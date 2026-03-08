import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../lib/supabase';

const handleSignOut = async () => {
    await supabase.auth.signOut();
};

export default function CoachScreen({ session, navigation }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fonction pour récupérer les créneaux du coach
    async function fetchCoachSlots() {
        setLoading(true);
        const { data, error } = await supabase
            .from('slots')
            .select(`
                id,
                start_time,
                end_time,
                is_booked,
                bookings (
                    id,
                    status,
                    profiles (
                        full_name
                    )
                )
            `)
            .eq('coach_id', session.user.id) // Seulement les créneaux de ce coach
            .order('start_time', { ascending: true }); // Trier par date de début

        if (error) {
            Alert.alert("Erreur", "Impossible de charger les créneaux : " + error.message);
        } else {
            setSlots(data || []);
        }
        setLoading(false);
    }

    // Mettre à jour la liste à chaque fois qu'on affiche cet écran
    useEffect(() => {
        fetchCoachSlots();
        const unsubscribe = navigation.addListener('focus', () => {
            fetchCoachSlots();
        });
        return unsubscribe;
    }, [navigation]);

    // Formatage de la date pour un affichage propre
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' à ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Le design d'une "carte" (un élément de la liste)
    const renderSlotItem = ({ item }) => {
        // Vérifier s'il y a un joueur associé à ce créneau
        const isBooked = item.is_booked && item.bookings && item.bookings.length > 0;
        const playerName = isBooked ? item.bookings[0].profiles?.full_name : "Créneau libre";
        
        // Couleur dynamique selon le statut
        const statusColor = isBooked ? '#10B981' : '#6B7280'; // Vert si réservé, Gris si libre

        return (
            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    {isBooked ? `🏀 Séance avec ${playerName}` : "⏳ Créneau disponible"}
                </Text>
                <Text style={styles.cardDate}>📅 {formatDate(item.start_time)}</Text>
                <Text style={[styles.cardStatus, { color: statusColor }]}>
                    Statut : {isBooked ? "Réservé" : "Libre"}
                </Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Espace Coach</Text>
                <Text style={styles.subtitle}>{session.user.user_metadata.full_name}</Text>
            </View>
            
            {/* Zone de la liste */}
            <View style={styles.listContainer}>
                <Text style={styles.sectionTitle}>Mes prochaines séances</Text>
                
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
                ) : slots.length === 0 ? (
                    <Text style={styles.emptyText}>Tu n'as aucun créneau pour le moment.</Text>
                ) : (
                    <FlatList
                        data={slots}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderSlotItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                )}
            </View>

            {/* Boutons d'action en bas */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('MapCoach')}>
                    <Text style={styles.buttonTextWhite}>Gérer mes créneaux (Carte)</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonDanger} onPress={handleSignOut}>
                    <Text style={styles.buttonTextWhite}>Se déconnecter</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// ----------------------------------------------------
// NOUVEAUX STYLES PURE CSS (Mise en page Flexbox)
// ----------------------------------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', paddingTop: 60, paddingHorizontal: 24, paddingBottom: 24 },
  
  header: { alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  
  // Section Liste
  listContainer: { flex: 1, width: '100%', marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 15 },
  emptyText: { color: '#6B7280', fontStyle: 'italic', textAlign: 'center', marginTop: 20, fontSize: 16 },
  
  // Style d'une Carte (Créneau)
  card: { width: '100%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 8 },
  cardDate: { fontSize: 14, color: '#4B5563', marginBottom: 8 },
  cardStatus: { fontSize: 14, fontWeight: '600' },

  // Footer (Boutons)
  footer: { width: '100%', paddingTop: 10 },
  buttonPrimary: { width: '100%', backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  buttonDanger: { width: '100%', backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  buttonTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});