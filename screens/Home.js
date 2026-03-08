import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, ActivityIndicator, Alert, Modal, FlatList, TouchableOpacity } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export default function HomeScreen({ session }) {
  const [location, setLocation] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [myBookings, setMyBookings] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [listModalVisible, setListModalVisible] = useState(false);
  const [selectedCoach, setSelectedCoach] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
      fetchCoaches();
    })();
  }, []);

  async function fetchCoaches() {
    const { data } = await supabase.from('coaches').select('*, profiles(full_name)');
    if (data) setCoaches(data);
  }

  async function fetchMyBookings() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`*, slots (start_time, end_time, coaches (profiles (full_name)))`)
      .eq('player_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) Alert.alert("Erreur", error.message);
    else setMyBookings(data || []);
  }

  async function becomeCoach() {
    if (!location) return;
    const { error } = await supabase.from('coaches').insert({
      id: session.user.id,
      location_lat: location.coords.latitude,
      location_lng: location.coords.longitude,
      price_per_hour: 3000,
      bio: "Coach dispo",
      sport_speciality: "Basketball"
    });
    if (!error) {
      Alert.alert("Bravo !", "Tu es coach !");
      fetchCoaches();
    } else {
        Alert.alert("Attention, tu es déjà coach");
    }
  }

  async function handleBooking() {
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    const { data: slotData, error: slotError } = await supabase
      .from('slots')
      .insert({ coach_id: selectedCoach.id, start_time: startTime, end_time: endTime, is_booked: true })
      .select().single();

    if (slotError) return Alert.alert("Erreur Slot", slotError.message);

    const { error: bookingError } = await supabase
      .from('bookings')
      .insert({ slot_id: slotData.id, player_id: session.user.id });

    if (bookingError) {
      Alert.alert("Erreur Booking", bookingError.message);
    } else {
      Alert.alert("Succès !", "Réservation confirmée");
      setBookingModalVisible(false);
      fetchMyBookings();
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' à ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading || !location) return <ActivityIndicator size="large" style={{flex:1}} />;

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
      >
        {coaches.map((coach) => (
          <Marker
            key={coach.id}
            coordinate={{ latitude: coach.location_lat, longitude: coach.location_lng }}
            pinColor="gold"
            title={coach.profiles?.full_name || 'Coach'}
            onCalloutPress={() => {
              setSelectedCoach(coach);
              setBookingModalVisible(true);
            }}
          />
        ))}
      </MapView>

      <View style={styles.mapOverlay}>
        <Text style={styles.title}>Trouver un coach</Text>
        
        <TouchableOpacity style={styles.buttonPrimary} onPress={becomeCoach}>
            <Text style={styles.buttonTextWhite}>Devenir Coach</Text>
        </TouchableOpacity>
          
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => { fetchMyBookings(); setListModalVisible(true); }}>
            <Text style={styles.buttonTextDark}>📅 Mes Réservations</Text>
        </TouchableOpacity>
          
        <TouchableOpacity style={styles.buttonDanger} onPress={handleSignOut}>
            <Text style={styles.buttonTextWhite}>Se déconnecter</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL DE RÉSERVATION */}
      <Modal animationType="slide" transparent={true} visible={bookingModalVisible} onRequestClose={() => setBookingModalVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Réserver avec {selectedCoach?.profiles?.full_name}</Text>
          <TouchableOpacity style={styles.buttonPrimary} onPress={handleBooking}>
            <Text style={styles.buttonTextWhite}>Confirmer (1h)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => setBookingModalVisible(false)}>
            <Text style={styles.buttonTextDark}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL LISTE DES RÉSERVATIONS */}
      <Modal animationType="slide" visible={listModalVisible} presentationStyle="pageSheet" onRequestClose={() => setListModalVisible(false)}>
        <View style={{flex: 1, padding: 24, paddingTop: 50, backgroundColor: '#F3F4F6'}}>
          <Text style={styles.title}>Mes Séances 🏀</Text>
          
          {myBookings.length === 0 ? (
            <Text style={styles.subtitle}>Aucune réservation pour le moment.</Text>
          ) : (
            <FlatList
              data={myBookings}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.bookingCard}>
                  <Text style={{fontWeight: 'bold', fontSize: 18, color: '#111827', marginBottom: 4}}>
                    Coach : {item.slots?.coaches?.profiles?.full_name || 'Inconnu'}
                  </Text>
                  <Text style={{color: '#6B7280', marginBottom: 8}}>📅 {formatDate(item.slots?.start_time)}</Text>
                  <Text style={{color: '#10B981', fontWeight: '600'}}>Statut : {item.status}</Text>
                  <TouchableOpacity style={styles.buttonDanger} onPress={() => {Alert.alert("Séance annulée !")}}>
                    <Text style={styles.buttonTextWhite}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => setListModalVisible(false)}>
            <Text style={styles.buttonTextDark}>Fermer</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  map: { width: Dimensions.get('window').width, height: Dimensions.get('window').height },
  mapOverlay: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: 24, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 6 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', marginBottom: 20, textAlign: 'center' },
  modalContent: { margin: 20, marginTop: '40%', backgroundColor: "#FFFFFF", borderRadius: 24, padding: 35, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 15, elevation: 10, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: '#111827', textAlign: 'center' },
  bookingCard: { width: '100%', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F3F4F6', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 3 },
  buttonPrimary: { width: '100%', backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  buttonSecondary: { width: '100%', backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  buttonDanger: { width: '100%', backgroundColor: '#EF4444', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  buttonTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  buttonTextDark: { color: '#374151', fontSize: 16, fontWeight: 'bold' }
});