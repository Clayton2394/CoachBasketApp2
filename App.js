import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from './lib/supabase';

// Import your screens
import HomeScreen from './screens/Home';
import AuthScreen from './screens/Auth';
import ClientScreen from './screens/Client';
import CoachScreen from './screens/Coach';
// Let's imagine you create a new settings page
// import SettingsScreen from './screens/Settings'; 

const Stack = createNativeStackNavigator();

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator>
        
        {/* CONDITION 1: NOT LOGGED IN */}
        {!session || !session.user ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthScreen} 
            options={{ headerShown: false }} // Hides the top header for the login screen
          />
        ) : (
          
          session.user.user_metadata.role === 'joueur' ? (
            <>
              <Stack.Screen name="ClientHome">
                {(props) => <ClientScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="MapClient">
                {(props) => <HomeScreen {...props} session={session} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="CoachHome">
                {(props) => <CoachScreen {...props} session={session} />}
              </Stack.Screen>
              <Stack.Screen name="MapCoach">
                {(props) => <HomeScreen {...props} session={session} />}
              </Stack.Screen>
            </>
          )
        )}

      </Stack.Navigator>
    </NavigationContainer>
  );
}