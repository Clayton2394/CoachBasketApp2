import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  async function handleAuth() {
    setLoading(true);
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) Alert.alert("Erreur", error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: { data: { role: role, full_name: email.split('@')[0] } },
      });
      if (error) Alert.alert("Erreur", error.message);
      else Alert.alert("Succès", "Compte créé !");
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? "Connexion" : "Inscription"}</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#9CA3AF"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#9CA3AF"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true}
      />
      
      {isLogin && (
        <TouchableOpacity style={styles.buttonPrimary} onPress={handleAuth} disabled={loading}>
          <Text style={styles.buttonTextWhite}>{loading ? "Chargement..." : "Se connecter"}</Text>
        </TouchableOpacity>
      )}
      
      {!isLogin && (
        <View style={{ width: '100%' }}>
          <TouchableOpacity 
            style={styles.buttonPrimary} 
            onPress={() => { setRole("joueur"); handleAuth(); }}
            disabled={loading}
          >
            <Text style={styles.buttonTextWhite}>
              {loading ? "Chargement..." : "S'inscrire en tant que joueur"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.buttonSecondary} 
            onPress={() => { setRole("coach"); handleAuth(); }}
            disabled={loading}
          >
            <Text style={styles.buttonTextDark}>
              {loading ? "Chargement..." : "S'inscrire en tant que coach"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 20 }}>
        <Text style={styles.textLink}>
          {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 24, textAlign: 'center' },
  input: { width: '100%', height: 55, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, paddingHorizontal: 16, fontSize: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  buttonPrimary: { width: '100%', backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
  buttonSecondary: { width: '100%', backgroundColor: '#FFFFFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  buttonTextWhite: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  buttonTextDark: { color: '#374151', fontSize: 16, fontWeight: 'bold' },
  textLink: { color: '#2563EB', fontWeight: '600', marginTop: 20 }
});