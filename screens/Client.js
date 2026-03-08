import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';

export default function ClientScreen({ session, navigation }) {
    const [myBookings, setMyBookings] = useState([]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    async function fetchMyBookings() {
        const { data, error } = await supabase
            .from('bookings')
            .select(`*, slots (start_time, end_time, coaches (profiles (full_name)))`)
            .eq('player_id', session.user.id)
            .order('created_at', { ascending: false });
        if (error) Alert.alert("Erreur", error.message);
        else setMyBookings(data || []);
    }

    async function deleteBookings(id) {
        const { error } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);
        if (error) {
            Alert.alert("Erreur", "Impossible d'annuler : " + error.message);
        } else {
            Alert.alert("Succès", "Ta séance a bien été annulée 🗑️");
            fetchMyBookings();
        }
    }

    const confirmdelete = (id) => {
        Alert.alert("Annuler la séance",
            "Es-tu sûr de vouloir annuler cette séance ?",
            [
                {
                    text: "Non je la garde",
                    style:'cancel'
                },
                {
                    text: "Oui je veux annuler",
                    style:'destructive',
                    onPress: () => deleteBookings(id)
                }
            ],
            {cancelable: true}
        )
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' à ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        fetchMyBookings();

        const unsubscribe = navigation.addListener('focus', () => {
            fetchMyBookings();
        })

        return unsubscribe;
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenue !</Text>
            <Text style={styles.subtitle}>{session.user.user_metadata.full_name}</Text>
            <View style={styles.container}>
                {myBookings.length === 0 ? (
                    <Text style={styles.subtitle}>Aucune réservation pour le moment.</Text>
                ) : (
                    <FlatList
                        data={myBookings}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.bookingCard}>
                                <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#111827', marginBottom: 4 }}>
                                    Coach : {item.slots?.coaches?.profiles?.full_name || 'Inconnu'}
                                </Text>
                                <Text style={{ color: '#6B7280', marginBottom: 8 }}>📅 {formatDate(item.slots?.start_time)}</Text>
                                <Text style={{ color: '#10B981', fontWeight: '600' }}>Statut : {item.status}</Text>
                                <TouchableOpacity style={styles.buttonDanger} onPress={() => {confirmdelete(item.id)}}>
                                    <Text style={styles.buttonTextWhite}>Annuler la séance</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                )}
            </View>

            <TouchableOpacity style={styles.buttonPrimary} onPress={() => navigation.navigate('MapClient')}>
                <Text style={styles.buttonTextWhite}>Aller sur la carte</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.buttonDanger} onPress={handleSignOut}>
                <Text style={styles.buttonTextWhite}>Se déconnecter</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', padding: 24 },
    title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
    subtitle: { fontSize: 18, color: '#6B7280', marginBottom: 40, textAlign: 'center' },
    bookingCard: { width: '100%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
    buttonPrimary: { width: '100%', backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
    buttonDanger: { width: '100%', backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    buttonTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});