> **Archive — ancienne version :** les instructions concernant la connexion et la synchronisation à distance ne s’appliquent plus. La progression et les préférences sont enregistrées localement dans le navigateur.

# 🚀 Système de Cache et Performance

## 📋 Vue d'ensemble

UNITYQUEST Chronicles of Love utilise maintenant un système de cache intelligent pour optimiser les performances et réduire les appels API inutiles vers Supabase.

## ⏱️ Cache de 60 secondes

### Principe
- **Rafraîchissement automatique**: Les scores ne se rechargent automatiquement que toutes les 60 secondes maximum
- **Cache intelligent**: Évite les appels API répétitifs lors de la navigation
- **Performance optimisée**: Réduit considérablement la charge réseau

### Fonctionnement

```javascript
// Le hook useGameProgress maintient un cache automatique
const { progress, forceRefresh } = useGameProgress(userId);

// Cache valide pendant 60s, pas de rechargement
loadProgress(); // ✅ Utilise le cache

// Force un rechargement immédiat
forceRefresh(); // 🔄 Ignore le cache
```

## 🎯 Bénéfices

### ✅ Réduction des erreurs réseau
- Moins d'appels API = moins de risques de NetworkError
- Moins de pression sur la connexion internet
- Expérience utilisateur plus fluide

### ✅ Performance améliorée
- Temps de chargement réduit
- Interface plus réactive
- Moins de consommation réseau

### ✅ Gestion intelligente
- Cache automatique transparent pour l'utilisateur
- Rafraîchissement en arrière-plan
- Force refresh disponible quand nécessaire

## 🔧 Configuration technique

### Cache TTL (Time To Live)
```javascript
const scoreCache = new SmartCache(60000); // 60 secondes
const starsCache = new SmartCache(60000); // 60 secondes
```

### Intervalle de vérification
```javascript
// Vérification automatique toutes les 60s
setInterval(() => {
  loadProgress(false); // Refresh si cache expiré
}, 60000);
```

### Logs de débogage
- `🔄 Cache valide, pas de rechargement nécessaire`
- `🔄 Rafraîchissement des scores...`
- `✅ Scores rafraîchis avec succès`
- `⭐ Cache étoiles valide`

## 📱 Impact utilisateur

### Avant le cache
❌ Rechargement à chaque navigation  
❌ Appels API constants  
❌ Erreurs réseau fréquentes  
❌ Interface qui "lag"  

### Avec le cache
✅ Rechargement intelligent (60s max)  
✅ Appels API optimisés  
✅ Moins d'erreurs réseau  
✅ Interface fluide et rapide  

## 🛠️ Maintenance

### Surveillance
- Vérifiez les logs console pour les patterns de cache
- Surveillez la fréquence des rafraîchissements
- Ajustez le TTL si nécessaire

### Debugging
```javascript
// Force un refresh pour tester
forceRefresh();

// Vérifier l'âge du cache
console.log('Cache age:', scoreCache.getAge('user_progress'));
```

## 📈 Métriques attendues

- **Réduction des erreurs**: -80% de NetworkError
- **Performance**: +50% plus rapide à la navigation
- **Consommation réseau**: -70% d'appels API
- **Expérience utilisateur**: Interface plus réactive

---

*Ce système assure une expérience optimale tout en respectant les limites réseau et serveur.* 🎮✨