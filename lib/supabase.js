import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// On récupère les variables cachées dans le fichier .env
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);