> **Archive — ancienne version :** les instructions concernant la connexion et la synchronisation à distance ne s’appliquent plus. La progression et les préférences sont enregistrées localement dans le navigateur.

# 🎮 Système de Sauvegarde de Jeu - Faith Chronicles

## 📋 Vue d'ensemble

Faith Chronicles utilise un système de sauvegarde/chargement complet, comme dans les jeux vidéo classiques. Vos progrès sont automatiquement sauvegardés et peuvent être rechargés à tout moment.

## 🎯 Fonctionnalités

### 💾 Sauvegarde Automatique
- **Déclenchement** : Après chaque question répondue, changement de niveau, gain d'étoiles
- **Fréquence** : Toutes les actions importantes
- **Cache** : Système de cache intelligent 60 secondes pour éviter les appels excessifs

### 🎮 Sauvegarde Manuelle
- **Bouton "Sauver"** dans le menu principal
- **Confirmation** : Message de réussite/échec
- **Instantané** : Force la sauvegarde même avec le cache actif

### 📥 Chargement de Sauvegarde
- **Bouton "Charger"** dans le menu principal  
- **Recharge complète** : Score, étoiles, révélation, XP, niveaux débloqués
- **Synchronisation** : Entre localStorage (mode anonyme) et cloud (utilisateur connecté)

## 🏪 Emplacements de Sauvegarde

### 🔒 Mode Anonyme (localStorage)
- **Emplacement** : Navigateur local uniquement
- **Statut** : "Sauvegarde locale" (orange)
- **Données** : Perdues si cache navigateur vidé
- **Avantage** : Fonctionne sans compte

### ☁️ Mode Connecté (Supabase Cloud)
- **Emplacement** : Base de données cloud sécurisée
- **Statut** : "Cloud synchronisé" (vert)
- **Données** : Persistantes entre appareils
- **Avantage** : Synchronisation multi-appareils

## 🎯 Interface Utilisateur

### 🕹️ GameSaveManager Component
```jsx
<GameSaveManager
  user={user}
  isAnonymousMode={isAnonymousMode}
  isSupabaseConnected={isSupabaseConnected}
  onManualSave={handleManualSave}
  onLoadSave={handleLoadSave}
  lastSaveTime={lastSaveTime}
/>
```

### 📱 Affichage
- **Header** : "🎮 Gestion de sauvegarde"
- **Status** : Indicateur de type de sauvegarde avec icône
- **Dernière sauvegarde** : Horodatage formaté
- **Boutons** : Sauvegarder (vert) / Charger (bleu)
- **Messages** : Confirmation des actions

## 🔧 Architecture Technique

### 📊 Données Sauvegardées
```javascript
{
  score: number,           // Score total du joueur
  wisdomPoints: number,    // Points de sagesse accumulés
  revelationPoints: number, // Points de révélation
  unlockedLevels: array,   // Niveaux débloqués [1,2,3,...]
  totalXP: number,         // Expérience totale
  levelStars: object       // Étoiles par niveau {1: 3, 2: 2, ...}
}
```

### 🔄 Fonctions Principales
```javascript
// Sauvegarde manuelle complète
const handleManualSave = async () => {
  await saveProgress(gameData);
  console.log('✅ Partie sauvegardée avec succès !');
};

// Chargement/rechargement complet  
const handleLoadSave = async () => {
  await handleRefresh(); // Recharge toutes les données
  console.log('✅ Partie chargée avec succès !');
};
```

### ⚡ Cache System
- **TTL** : 60 secondes pour les scores
- **Auto-refresh** : Interval automatique toutes les 60s
- **Force refresh** : Bypass du cache si nécessaire
- **Smart invalidation** : Cache vidé lors des changements

## 🎮 Expérience Utilisateur

### 🎯 Terminologie de Jeu
- **"Sauvegarder la partie"** au lieu de "enregistrer les données"
- **"Charger la partie"** au lieu de "synchroniser"
- **"Dernière sauvegarde"** au lieu de "dernier sync"
- **"Partie sauvegardée !"** confirmations courtes et claires

### 🎨 Interface Visuelle
- **Icônes** : Save (💾), Upload (📥), Clock (🕐)  
- **Couleurs** : Vert (sauvegarder), Bleu (charger), Orange (local)
- **Animation** : Spinners pendant les opérations
- **Status** : Messages de confirmation colorés

### 📱 Accessibilité Mobile
- **Responsive** : Interface adaptée aux petits écrans
- **Touch-friendly** : Boutons suffisamment grands
- **Feedback** : Animations et confirmations visuelles

## 🛠️ Configuration

### 🔧 Props Requises
```javascript
// Dans MenuScreen
onManualSave={handleManualSave}
onLoadSave={handleLoadSave}  
lastSaveTime={lastSaveTime}
```

### 📊 Hook useGameProgress
```javascript
const { 
  progress, 
  saveProgress, 
  lastSaveTime,  // Nouveau: horodatage
  forceRefresh 
} = useGameProgress(userId);
```

## 🚀 Avantages

### 👤 Pour le Joueur
- **Simplicité** : Interface familière type jeu vidéo
- **Sécurité** : Sauvegarde automatique + manuelle
- **Flexibilité** : Mode anonyme ou connecté
- **Transparence** : Status et horodatages clairs

### 💻 Pour le Développeur  
- **Robustesse** : Gestion d'erreurs et retry automatique
- **Performance** : Cache intelligent et debouncing
- **Maintenance** : Code modulaire et documenté
- **Évolutivité** : Facile d'ajouter nouvelles fonctionnalités

## 📝 Exemple d'Utilisation

1. **Première visite** : Mode anonyme, sauvegarde locale
2. **Jeu normal** : Sauvegarde automatique après chaque action
3. **Sauvegarde manuelle** : Clic sur "Sauver" dans le menu
4. **Création compte** : Migration automatique vers cloud
5. **Changement d'appareil** : Connexion + "Charger" = récupération complète
6. **Rafraîchissement page** : Rechargement automatique depuis localStorage/cloud

Le système garantit une expérience fluide et familière pour tous les types d'utilisateurs ! 🎮✨