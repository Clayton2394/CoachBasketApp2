# 🏀 CoachFinder

> Une application mobile de mise en relation entre sportifs et coachs professionnels, avec système de géolocalisation et de réservation en temps réel.

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)](https://supabase.com/)

---

## 📱 Aperçu du projet

<div align="center">
  <img src="./Screenshots/log_in_screen.jpeg" alt="Écran de connexion" width="250" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./Screenshots/Map_screen.jpeg" alt="Carte des coachs" width="250" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./Screenshots/Coach_screen.jpeg" alt="Tableau de bord" width="250" />
</div>

## 🚀 Fonctionnalités principales

Ce projet a été développé pour démontrer la création d'une application mobile complète (Front-end & Back-end as a Service) :

* **🔒 Authentification & Rôles :** Système de connexion sécurisé avec séparation stricte des droits entre les utilisateurs (Rôle "Joueur" vs "Coach").
* **🗺️ Géolocalisation :** Intégration de `react-native-maps` et `expo-location` pour afficher les coachs disponibles autour de soi.
* **📅 Système de réservation :** Création, lecture et annulation de créneaux sportifs avec mise à jour en temps réel.
* **🛡️ Sécurité des données :** Utilisation avancée des **Policies (RLS)** de Supabase pour garantir que chaque utilisateur n'accède qu'à ses propres données.
* **✨ UI/UX Moderne :** Interface fluide développée en Flexbox pur, intégrant des modales interactives, des listes optimisées (`FlatList`), et un design épuré.

## 🛠️ Stack Technique

**Front-end (Mobile)**
* React Native & Expo
* Hooks React personnalisés (`useState`, `useEffect`)
* Gestion de la navigation (React Navigation)
* Cartographie (`react-native-maps`)

**Back-end & Base de données (Supabase)**
* PostgreSQL
* Authentification (Supabase Auth)
* Row Level Security (RLS) & Triggers SQL
* Requêtes complexes (Jointures relationnelles entre Profils, Créneaux et Réservations)

## ⚙️ Installation et lancement local

Si vous souhaitez faire tourner ce projet sur votre machine :

1. **Cloner le repository :**
   ```bash
   git clone [https://github.com/](https://github.com/)[Ton_Nom_Utilisateur]/[Nom_Du_Repo].git
   cd [Nom_Du_Repo]
