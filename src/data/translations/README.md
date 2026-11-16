> **Archive — ancienne version :** les instructions concernant la connexion et la synchronisation à distance ne s’appliquent plus. La progression et les préférences sont enregistrées localement dans le navigateur.

# 🌍 Système Multilingue - Faith Chronicles

Support complet de **14 langues** avec gestion automatique du RTL (Right-to-Left) pour l'arabe et l'hébreu.

---

## 📚 Langues Supportées

### Langues LTR (Left-to-Right)
- 🇫🇷 **Français** (fr) - Langue par défaut
- 🇬🇧 **English** (en)
- 🇪🇸 **Español** (es)
- 🇩🇪 **Deutsch** (de)
- 🇮🇹 **Italiano** (it)
- 🇵🇹 **Português** (pt)
- 🇷🇺 **Русский** (ru)
- 🇺🇦 **Українська** (uk)
- 🇨🇳 **中文** (zh)
- 🇯🇵 **日本語** (jp)
- 🇰🇷 **한국어** (ko)
- 🇨🇩 **Lingala** (rc)

### Langues RTL (Right-to-Left)
- 🇸🇦 **العربية** (ar) - Arabe
- 🇮🇱 **עברית** (he) - Hébreu

---

## 🚀 Démarrage Rapide

### Installation

1. **Le système est déjà installé !** Tous les fichiers de traduction sont créés.

2. **Intégrer dans votre App** :

```tsx
// src/App.tsx
import { TranslationProvider } from './hooks/useTranslation';

function App() {
  return (
    <TranslationProvider>
      {/* Votre application */}
    </TranslationProvider>
  );
}
```

3. **Utiliser dans vos composants** :

```jsx
import useTranslation from '../hooks/useTranslation';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return <h1>{t('app.title')}</h1>;
};
```

---

## 📖 Utilisation

### Traduction Simple

```jsx
const { t } = useTranslation();

// Traduction d'un texte
<button>{t('buttons.play')}</button>
// Résultat FR: "JOUER"
// Résultat EN: "PLAY"
```

### Traduction avec Paramètres

```jsx
const { t } = useTranslation();

// Avec paramètres dynamiques
<p>{t('messages.wrongAnswer', { lives: 3 })}</p>
// Résultat FR: "❌ Mauvaise réponse ! Il te reste 3 vie(s)."
// Résultat EN: "❌ Wrong answer! You have 3 life(lives) left."
```

### Changer de Langue

```jsx
const { changeLanguage } = useTranslation();

// Changer vers l'anglais
<button onClick={() => changeLanguage('en')}>
  English
</button>
```

### Composant Sélecteur de Langue

```jsx
import LanguageSelector from './components/LanguageSelector';

// Dans votre MenuScreen ou Header
<LanguageSelector audio={audio} />
```

---

## 🎨 Support RTL

Le système gère **automatiquement** le mode RTL pour l'arabe et l'hébreu :

```jsx
const { isRTL } = useTranslation();

// Appliquer des styles conditionnels
<div className={isRTL ? 'text-right' : 'text-left'}>
  {/* Contenu */}
</div>
```

Le `<html dir="rtl">` est automatiquement appliqué pour AR et HE.

---

## 📁 Structure des Fichiers

```
src/data/translations/
├── languages.js           # Configuration des 14 langues
├── index.js              # Exports centralisés
├── fr/ui.js              # 🇫🇷 Français
├── en/ui.js              # 🇬🇧 English
├── es/ui.js              # 🇪🇸 Español
├── de/ui.js              # 🇩🇪 Deutsch
├── it/ui.js              # 🇮🇹 Italiano
├── pt/ui.js              # 🇵🇹 Português
├── ru/ui.js              # 🇷🇺 Русский
├── uk/ui.js              # 🇺🇦 Українська
├── zh/ui.js              # 🇨🇳 中文
├── jp/ui.js              # 🇯🇵 日本語
├── ko/ui.js              # 🇰🇷 한국어
├── ar/ui.js              # 🇸🇦 العربية (RTL)
├── he/ui.js              # 🇮🇱 עברית (RTL)
└── rc/ui.js              # 🇨🇩 Lingala
```

---

## 🗂️ Sections de Traduction Disponibles

Chaque fichier `ui.js` contient les sections suivantes :

- `app` - Titre et slogan de l'application
- `buttons` - Tous les boutons (play, back, continue, etc.)
- `labels` - Labels (score, stars, wisdom, etc.)
- `menu` - Menu principal
- `login` - Écran de connexion
- `ranks` - Rangs spirituels
- `treasures` - Section trésors de la Bible
- `messages` - Messages du jeu
- `quotes` - Citations bibliques

### Exemple de Structure

```javascript
export const uiTranslations = {
  app: {
    title: "FAITH CHRONICLES",
    subtitle: "La Connaissance des Écritures"
  },
  buttons: {
    play: "JOUER",
    back: "Retour"
  },
  messages: {
    wrongAnswer: "❌ Mauvaise réponse ! Il te reste {lives} vie(s)."
  }
};
```

---

## 💾 Sauvegarde dans Supabase

### Script SQL

Exécutez le script `add-multilanguage-support.sql` dans Supabase SQL Editor pour :

1. Ajouter la colonne `preferred_language` dans `users`
2. Créer les contraintes de validation
3. Ajouter les index de performance

### Synchronisation Automatique

```jsx
// Le hook sauvegarde automatiquement la langue choisie
const { changeLanguage } = useTranslation();

changeLanguage('en'); 
// → Sauvegarde dans localStorage
// → Synchronise avec Supabase (si connecté)
```

---

## 🔧 API Complète

### Hook useTranslation

```jsx
const {
  currentLanguage,  // Code langue actuelle ('fr', 'en', etc.)
  changeLanguage,   // Fonction: changeLanguage('en')
  t,                // Fonction: t('app.title')
  getSection,       // Fonction: getSection('buttons')
  languages,        // Objet: toutes les langues disponibles
  isRTL             // Boolean: true si RTL actif
} = useTranslation();
```

### Méthodes

#### `t(key, params)`
Traduit une clé avec paramètres optionnels.

```jsx
t('app.title')                           // Simple
t('messages.wrongAnswer', { lives: 3 })  // Avec paramètres
```

#### `changeLanguage(langCode)`
Change la langue de l'application.

```jsx
changeLanguage('en')  // Passer à l'anglais
changeLanguage('ar')  // Passer à l'arabe (active RTL)
```

#### `getSection(sectionName)`
Récupère toute une section de traductions.

```jsx
const buttons = getSection('buttons');
// { play: "JOUER", back: "Retour", ... }
```

---

## 🎯 Exemples d'Intégration

### MenuScreen avec Traductions

```jsx
import useTranslation from '../hooks/useTranslation';
import LanguageSelector from './LanguageSelector';

const MenuScreen = ({ wisdomPoints, audio }) => {
  const { t, isRTL } = useTranslation();
  
  return (
    <div className={isRTL ? 'rtl-layout' : ''}>
      {/* Sélecteur de langue */}
      <div className="absolute top-3 right-3">
        <LanguageSelector audio={audio} />
      </div>
      
      {/* Titre traduit */}
      <h1>{t('app.title')}</h1>
      <p>{t('app.tagline')}</p>
      
      {/* Bouton traduit */}
      <button>{t('buttons.play')}</button>
      
      {/* Label traduit avec données */}
      <div>
        {t('labels.wisdom')}: {wisdomPoints}
      </div>
    </div>
  );
};
```

### LoginScreen avec Traductions

```jsx
import useTranslation from '../hooks/useTranslation';

const LoginScreen = ({ onLogin }) => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('login.title')}</h1>
      <p>{t('login.subtitle')}</p>
      
      <input placeholder={t('login.emailPlaceholder')} />
      <button onClick={onLogin}>
        {t('login.sendLink')}
      </button>
    </div>
  );
};
```

---

## ✅ Checklist d'Intégration

- [x] ✅ Créer les 14 fichiers de traduction UI
- [x] ✅ Implémenter le hook `useTranslation`
- [x] ✅ Créer le composant `LanguageSelector`
- [x] ✅ Créer le script SQL Supabase
- [x] ✅ Support RTL automatique (AR, HE)
- [ ] 🔄 Wrapper App.tsx avec `TranslationProvider`
- [ ] 🔄 Intégrer `LanguageSelector` dans MenuScreen
- [ ] 🔄 Remplacer textes hardcodés par `t()` dans les composants
- [ ] 🔄 Exécuter le script SQL dans Supabase
- [ ] 🔄 Tester toutes les langues

---

## 📝 Ajouter une Nouvelle Langue

1. Créer un nouveau fichier `src/data/translations/xx/ui.js`
2. Copier la structure depuis `fr/ui.js`
3. Traduire tous les textes
4. Ajouter la langue dans `languages.js` :

```javascript
export const LANGUAGES = {
  // ... autres langues
  xx: {
    code: 'xx',
    name: 'Language Name',
    nativeName: 'Nom Natif',
    flag: '🏁',
    direction: 'ltr', // ou 'rtl'
    enabled: true
  }
};
```

5. Importer dans `useTranslation.js` :

```javascript
import xxUI from '../data/translations/xx/ui';

const UI_TRANSLATIONS = {
  // ... autres langues
  xx: xxUI.uiTranslations
};
```

---

## 🐛 Dépannage

### La traduction ne s'affiche pas
- Vérifiez que le composant est dans le `<TranslationProvider>`
- Vérifiez que la clé existe dans le fichier `ui.js`
- Consultez la console pour les warnings

### RTL ne fonctionne pas
- Vérifiez `direction: 'rtl'` dans `languages.js`
- Ajoutez des classes CSS RTL si nécessaire
- L'attribut `dir="rtl"` est automatique

### La langue ne se sauvegarde pas
- Vérifiez le localStorage : `faithchronicles_language`
- Exécutez le script SQL Supabase
- Vérifiez la connexion Supabase

---

## 📚 Documentation Complète

Consultez `MULTILANGUAGE_INTEGRATION_GUIDE.md` pour :
- Guide d'intégration détaillé
- Exemples de code complets
- Synchronisation Supabase
- Détection automatique de langue

---

**Développé avec ❤️ pour Faith Chronicles**
Support multilingue professionnel avec 14 langues
