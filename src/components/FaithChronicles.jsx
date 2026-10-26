import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { moduleManager } from '../utils/ModuleManager.js';
import { useAuth } from '../hooks/useAuth';
import { useGameProgress } from '../hooks/useGameProgress';
import useAudio from '../hooks/useAudio';
import { debounce } from '../utils/retryHelper.js';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { useTranslation } from '../hooks/useTranslation.js';

import LoginScreen from './screens/LocalLoginScreen';
import PasswordResetScreen from './screens/PasswordResetScreen';
import PseudoSetupScreen from './screens/PseudoSetupScreen';
import MenuScreen from './screens/MenuScreen';
import LevelSelectScreen from './screens/LevelSelectScreen';
import ChallengeScreen from './screens/ChallengeScreen';
import QuestionScreen from './screens/QuestionScreen';
import VictoryScreen from './screens/VictoryScreen';
import GameOverScreen from './screens/GameOverScreen';
import BibleReaderScreen from './screens/BibleReaderScreen';
import InfoScreen from './screens/InfoScreen';
import InstallPrompt from './InstallPrompt';

const FaithChronicles = () => {
  // Hooks Supabase
  const { 
    user, 
    loading: authLoading, 
    signInWithEmail, 
    signInAnonymously,
    signInWithPassword,
    signUpWithPassword,
    resetPassword,
    importSessionFromProduction, 
    isConfigured 
  } = useAuth();
  const { progress, saveProgress: saveToSupabase, saveLevelStars, loadAllStars, forceRefresh, lastSaveTime } = useGameProgress(user?.id);
  
  // Hook Audio 🎵
  const audio = useAudio();
  const { t, currentLanguage } = useTranslation();
  
  // Synchroniser la langue avec ModuleManager
  useEffect(() => {
    moduleManager.setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Afficher un avertissement si Supabase n'est pas configuré
  useEffect(() => {
    if (!isConfigured) {
      // console.warn('⚠️ Supabase non configuré - Mode hors-ligne uniquement');
      // console.warn('📖 Consultez SUPABASE_QUICKSTART.md pour la configuration');
    }
  }, [isConfigured]);

  // Fonction de chargement depuis localStorage (fallback)
  const loadProgress = () => {
    try {
      const saved = localStorage.getItem('faithChroniclesProgress');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // console.log("Erreur chargement:", e);
    }
    return {
      score: 0,
      wisdomPoints: 0,
      revelationPoints: 0,
      unlockedLevels: [1],
      levelStars: {}
    };
  };

  const savedProgress = loadProgress();
  const [currentScreen, setCurrentScreen] = useState(user ? 'menu' : 'login');
  const [bibleReaderTab, setBibleReaderTab] = useState('bible'); // État pour l'onglet Bible Reader
  const [isAnonymousMode, setIsAnonymousMode] = useState(false); // Mode local sans Supabase
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [score, setScore] = useState(savedProgress.score);
  const [lives, setLives] = useState(3);
  const [combo, setCombo] = useState(0);
  const [wisdomPoints, setWisdomPoints] = useState(savedProgress.wisdomPoints);
  const [revelationPoints, setRevelationPoints] = useState(savedProgress.revelationPoints);
  const [unlockedLevels, setUnlockedLevels] = useState(savedProgress.unlockedLevels);
  const [levelStars, setLevelStars] = useState(savedProgress.levelStars);
  const [totalXP, setTotalXP] = useState(savedProgress.totalXP || 0); // Nouveau: XP total
  const [showFunFact, setShowFunFact] = useState(false);
  const [funFactText, setFunFactText] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState('easy');
  const [isAnswering, setIsAnswering] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({title: '', content: ''});
  const [questionsAnswered, setQuestionsAnswered] = useState(0);

  // Détecter si on arrive depuis un lien de réinitialisation de mot de passe
  useEffect(() => {
    if (!isConfigured) return;
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    const error = hashParams.get('error');
    const errorDescription = hashParams.get('error_description');
    
    if (error) {
      // console.warn('⚠️ Erreur dans l\'URL:', error, errorDescription);
      
      if (error === 'access_denied' && errorDescription?.includes('expired')) {
        // console.log('🔑 Lien de réinitialisation expiré - Affichage du message d\'erreur');
        setCurrentScreen('password-reset');
      } else {
        // console.error('❌ Erreur d\'authentification:', error);
      }
    } else if (type === 'recovery') {
      // console.log('🔑 Lien de réinitialisation de mot de passe détecté');
      setCurrentScreen('password-reset');
    }
  }, []);

  // Gérer la connexion utilisateur
  const handleAnonymousLogin = async (pseudo) => {
    try {
      // Mode anonyme = TOUJOURS local, pas de Supabase
      // console.log('🎮 Mode anonyme - Sauvegarde locale uniquement');
      localStorage.setItem('faithChronicles_pseudo', pseudo);
      localStorage.setItem('faithChronicles_mode', 'anonymous');
      setIsAnonymousMode(true);
      setCurrentScreen('menu');
      return { data: { pseudo }, error: null };
    } catch (error) {
      // console.error('❌ Erreur handleAnonymousLogin:', error);
      return { data: null, error };
    }
  };

  const handleEmailLogin = async (email, pseudo = null) => {
    localStorage.setItem('faithChronicles_mode', 'email');
    if (pseudo) {
      localStorage.setItem('faithChronicles_pseudo', pseudo);
    }
    const result = await signInWithEmail(email, pseudo);
    return result;
  };

  // Gérer la configuration du pseudo pour utilisateurs connectés
  const handlePseudoSetup = async (pseudo) => {
    try {
      localStorage.setItem('faithChronicles_pseudo', pseudo);
      // console.log('✅ Pseudo configuré pour utilisateur connecté:', pseudo);
      
      // ⚠️ IMPORTANT: Ne sauvegarder en ligne QUE si l'utilisateur n'est PAS anonyme
      if (user?.email && isConfigured && !isAnonymousMode) {
        // console.log('💾 Sauvegarde en ligne dans table USERS globale...');
        try {
          // STRATÉGIE ROBUSTE: Vérifier si l'utilisateur existe, puis UPDATE ou INSERT
          
          // 1. Vérifier si l'utilisateur existe déjà
          const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('email, pseudo')
            .eq('email', user.email)
            .single();
          
          if (checkError && checkError.code !== 'PGRST116') {
            // Erreur autre que "pas trouvé"
            throw checkError;
          }
          
          if (existingUser) {
            // 2. Utilisateur existe → UPDATE
            // console.log('👤 Utilisateur existe, mise à jour du pseudo...');
            const { error: updateError } = await supabase
              .from('users')
              .update({ 
                pseudo: pseudo,
                avatar: '✨',
                pays: 'FR'
              })
              .eq('email', user.email);
            
            if (updateError) {
              throw updateError;
            } else {
              // console.log('✅ Pseudo mis à jour dans table USERS globale');
            }
          } else {
            // 3. Utilisateur n'existe pas → INSERT
            // console.log('➕ Nouvel utilisateur, création...');
            const { error: insertError } = await supabase
              .from('users')
              .insert({ 
                email: user.email,
                pseudo: pseudo,
                avatar: '✨',
                pays: 'FR'
              });
            
            if (insertError) {
              throw insertError;
            } else {
              // console.log('✅ Nouvel utilisateur créé dans table USERS globale');
            }
          }
          
        } catch (error) {
          // console.warn('⚠️ Erreur sauvegarde pseudo dans users globale:', error.message);
        }
      } else if (isAnonymousMode) {
        // console.log('🔒 Mode anonyme: sauvegarde uniquement locale (pas de BDD)');
      } else {
        // console.log('⚠️ Pas de sauvegarde en ligne: utilisateur non connecté ou Supabase non configuré');
      }
      
      setCurrentScreen('menu');
    } catch (error) {
      // console.error('❌ Erreur configuration pseudo:', error);
      throw error;
    }
  };

  // Rediriger vers le menu quand l'utilisateur se connecte (email uniquement)
  useEffect(() => {
    if (user && currentScreen === 'login' && !isAnonymousMode) {
      // Vérifier si l'utilisateur connecté a un pseudo
      const savedPseudo = localStorage.getItem('faithChronicles_pseudo');
      
      if (!savedPseudo) {
        // Pas de pseudo configuré, aller à l'écran de configuration
        setCurrentScreen('pseudo-setup');
      } else {
        // Pseudo déjà configuré, aller au menu
        setCurrentScreen('menu');
      }
    }
  }, [user, currentScreen, isAnonymousMode]);

  // Charger le mode et la progression au démarrage
  useEffect(() => {
    const savedMode = localStorage.getItem('faithChronicles_mode');
    const savedPseudo = localStorage.getItem('faithChronicles_pseudo');
    const savedProgress = localStorage.getItem('faithChroniclesProgress');

    // console.log('🔄 Chargement initial:', { savedMode, savedPseudo, hasProgress: !!savedProgress });

    if (savedMode === 'anonymous' && savedPseudo) {
      setIsAnonymousMode(true);
      setCurrentScreen('menu');
      
      // Charger la progression depuis localStorage pour mode anonyme
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          // console.log('📦 Chargement progression localStorage complète:', {
          //   score: progress.score || 0,
          //   wisdomPoints: progress.wisdomPoints || 0,
          //   revelationPoints: progress.revelationPoints || 0,
          //   totalXP: progress.totalXP || 0,
          //   niveauxDébloqués: (progress.unlockedLevels || [1]).length,
          //   étoiles: Object.keys(progress.levelStars || {}).length
          // });
          
          // Charger TOUTES les données
          setScore(progress.score || 0);
          setWisdomPoints(progress.wisdomPoints || 0);
          setRevelationPoints(progress.revelationPoints || 0);
          setUnlockedLevels(progress.unlockedLevels || [1]);
          setLevelStars(progress.levelStars || {});
          setTotalXP(progress.totalXP || 0);
        } catch (error) {
          // console.error('Erreur chargement progression localStorage:', error);
        }
      }
    } else if (user && !isAnonymousMode) {
      // Pour les utilisateurs connectés, forcer un rechargement
      // console.log('🔄 Utilisateur connecté détecté, rechargement progression...');
      setCurrentScreen('menu');
    }
  }, []);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      // Déconnexion Supabase si connecté
      if (user && !isAnonymousMode) {
        const { error } = await supabase.auth.signOut();
        // if (error) console.error('Erreur déconnexion:', error);
      }
      
      // Réinitialiser l'état local
      setCurrentScreen('login');
    } catch (error) {
      // console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fonction pour basculer du mode anonyme vers la connexion
  const handleSwitchToLogin = () => {
    // console.log('🔄 Basculement du mode anonyme vers la connexion');
    // Garder la progression actuelle
    const progressData = {
      score,
      wisdomPoints,
      revelationPoints,
      unlockedLevels,
      levelStars,
      totalXP,
      lastSaveTime: Date.now()
    };
    localStorage.setItem('faithChroniclesProgress', JSON.stringify(progressData));
    
    // Passer en mode connexion
    setIsAnonymousMode(false);
    localStorage.removeItem('faithChronicles_mode');
    setCurrentScreen('login');
  };

  // 🎮 Fonctions de sauvegarde/chargement de jeu
  const handleManualSave = async () => {
    // console.log('🎮 Sauvegarde manuelle demandée');
    
    // ⚠️ IMPORTANT: Vérifier que l'utilisateur n'est PAS anonyme
    if (isAnonymousMode) {
      // console.log('🔒 Mode anonyme: sauvegarde locale uniquement');
      // En mode anonyme, la sauvegarde se fait automatiquement via saveProgressBoth (localStorage)
      const progressData = {
        score,
        wisdomPoints,
        revelationPoints,
        unlockedLevels,
        levelStars,
        totalXP,
        lastSaveTime: Date.now()
      };
      localStorage.setItem('faithChroniclesProgress', JSON.stringify(progressData));
      // console.log('✅ Partie sauvegardée localement !');
      return;
    }
    
    try {
      const gameData = {
        score,
        wisdomPoints,
        revelationPoints,
        unlockedLevels,
        totalXP
      };
      await saveToSupabase(gameData);
      // console.log('✅ Partie sauvegardée avec succès !');
    } catch (error) {
      // console.error('❌ Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };

  const handleLoadSave = async () => {
    // console.log('🎮 Chargement de partie demandé');
    try {
      await handleRefresh();
      // console.log('✅ Partie chargée avec succès !');
    } catch (error) {
      // console.error('❌ Erreur lors du chargement:', error);
      throw error;
    }
  };

  // Fonction de rechargement manuel
  const handleRefresh = async () => {
    // console.log('🔄 Rechargement manuel de la progression...');
    if (user && !isAnonymousMode) {
      // Pour les utilisateurs connectés, utiliser forceRefresh du hook
      if (forceRefresh) {
        try {
          await forceRefresh();
          
          // Recharger aussi les étoiles
          const { data: starsData } = await loadAllStars();
          if (starsData) {
            setLevelStars(starsData);
            // console.log('⭐ Étoiles rechargées:', Object.keys(starsData).length, 'niveaux');
          }
          
          // console.log('✅ Progression complète rechargée depuis Supabase');
        } catch (error) {
          // console.error('❌ Erreur rechargement Supabase:', error);
        }
      } else {
        // console.warn('⚠️ Fonction forceRefresh non disponible');
      }
    } else if (isAnonymousMode) {
      // Pour les utilisateurs anonymes, recharger depuis localStorage
      const savedProgress = localStorage.getItem('faithChroniclesProgress');
      if (savedProgress) {
        try {
          const progressData = JSON.parse(savedProgress);
          
          // Recharger TOUS les scores et données
          setScore(progressData.score || 0);
          setWisdomPoints(progressData.wisdomPoints || 0);
          setRevelationPoints(progressData.revelationPoints || 0);
          setTotalXP(progressData.totalXP || 0);
          setUnlockedLevels(progressData.unlockedLevels || [1]);
          setLevelStars(progressData.levelStars || {});
          
          // console.log('✅ Progression complète rechargée depuis localStorage:', {
          //   score: progressData.score || 0,
          //   wisdomPoints: progressData.wisdomPoints || 0,
          //   revelationPoints: progressData.revelationPoints || 0,
          //   totalXP: progressData.totalXP || 0,
          //   niveauxDébloqués: (progressData.unlockedLevels || [1]).length,
          //   étoiles: Object.keys(progressData.levelStars || {}).length
          // });
        } catch (error) {
          // console.error('❌ Erreur rechargement localStorage:', error);
        }
      } else {
        // console.warn('⚠️ Aucune progression sauvegardée trouvée');
      }
    }
  };

  // Charger la progression depuis Supabase quand l'utilisateur est connecté (email uniquement)
  useEffect(() => {
    if (progress && user && !isAnonymousMode && progress.id) {
      // Éviter les chargements en boucle en vérifiant si les données ont vraiment changé
      const hasDataChanged = 
        score !== (progress.score || 0) ||
        wisdomPoints !== (progress.wisdom_points || 0) ||
        revelationPoints !== (progress.revelation_points || 0) ||
        totalXP !== (progress.total_xp || 0);
      
      if (hasDataChanged) {
        // console.log('📥 Chargement progression depuis Supabase:', progress);
        setScore(progress.score || 0);
        setWisdomPoints(progress.wisdom_points || 0);
        setRevelationPoints(progress.revelation_points || 0);
        setUnlockedLevels(progress.unlocked_levels || [1]);
        
        // Protection anti-régression XP: ne jamais diminuer les XP locales
        const remoteXP = progress.total_xp || 0;
        setTotalXP(prev => {
          const localXP = prev || 0;
          const finalXP = Math.max(localXP, remoteXP);
          if (finalXP > remoteXP) {
            // console.log(`🛡️ Protection XP: local ${localXP} > remote ${remoteXP}, gardé ${finalXP}`);
          }
          return finalXP;
        });

        // Charger les étoiles une seule fois
        loadAllStars().then(({ data }) => {
          if (data) {
            // console.log('⭐ Chargement étoiles depuis Supabase:', Object.keys(data).length, 'niveaux');
            setLevelStars(data);
          }
        });
      }
    } else if (user && !isAnonymousMode && progress === null) {
      // Fallback: si pas de données Supabase mais utilisateur connecté, charger depuis localStorage
      // console.log('🔄 Pas de données cloud, fallback localStorage pour utilisateur connecté');
      const savedProgress = localStorage.getItem('faithChroniclesProgress');
      if (savedProgress) {
        try {
          const localData = JSON.parse(savedProgress);
          // console.log('📦 Chargement fallback depuis localStorage:', localData);
          
          setScore(localData.score || 0);
          setWisdomPoints(localData.wisdomPoints || 0);
          setRevelationPoints(localData.revelationPoints || 0);
          setUnlockedLevels(localData.unlockedLevels || [1]);
          setLevelStars(localData.levelStars || {});
          setTotalXP(localData.totalXP || 0);
        } catch (error) {
          // console.error('Erreur chargement fallback localStorage:', error);
        }
      }
    }
  }, [progress?.id, user?.id, isAnonymousMode]); // Dépendances plus spécifiques

  // Sauvegarder dans localStorage ET Supabase (selon le mode)
  const saveProgressBoth = useCallback(() => {
    // 1. Toujours sauvegarder dans localStorage
    const progressData = {
      score,
      wisdomPoints,
      revelationPoints,
      unlockedLevels,
      levelStars,
      totalXP
    };
    localStorage.setItem('faithChroniclesProgress', JSON.stringify(progressData));

    // 2. Sauvegarder dans Supabase UNIQUEMENT si mode email (pas anonyme)
    if (user && isConfigured && !isAnonymousMode) {
      saveToSupabase({
        score,
        wisdomPoints,
        revelationPoints,
        unlockedLevels,
        totalXP
      });
    }
  }, [score, wisdomPoints, revelationPoints, unlockedLevels, levelStars, totalXP, user, isConfigured, isAnonymousMode, saveToSupabase]);

  // Version debouncée pour éviter trop d'appels
  const debouncedSaveProgress = useMemo(
    () => debounce(saveProgressBoth, 1000),
    [saveProgressBoth]
  );

  useEffect(() => {
    debouncedSaveProgress();
  }, [debouncedSaveProgress]);

  // Fonction spéciale pour sauvegarder les étoiles d'un niveau
  const saveStarsForLevel = async (levelNum, stars) => {
    // Mettre à jour localement en premier
    setLevelStars(prev => ({ ...prev, [levelNum]: stars }));

    // Sauvegarder dans Supabase UNIQUEMENT si mode email
    if (user && isConfigured && !isAnonymousMode) {
      try {
        const result = await saveLevelStars(levelNum, stars);
        if (result?.error) {
          // console.error('❌ Erreur sauvegarde étoiles niveau', levelNum, ':', result.error);
        } else {
          // console.log('⭐ Étoiles niveau', levelNum, 'sauvegardées:', stars);
        }
      } catch (error) {
        // console.error('❌ Erreur critique sauvegarde étoiles:', error);
      }
    }
  };

  const screenProps = {
    currentLevel, setCurrentLevel,
    currentQuestion, setCurrentQuestion,
    selectedCard, setSelectedCard,
    score, setScore,
    lives, setLives,
    combo, setCombo,
    wisdomPoints, setWisdomPoints,
    revelationPoints, setRevelationPoints,
    unlockedLevels, setUnlockedLevels,
    levelStars, setLevelStars,
    totalXP, setTotalXP,  // Nouveau: XP total
    bibleReaderTab, setBibleReaderTab, // État pour l'onglet Bible Reader
    saveStarsForLevel,  // Nouvelle fonction pour sauvegarder les étoiles
    showFunFact, setShowFunFact,
    funFactText, setFunFactText,
    questionDifficulty, setQuestionDifficulty,
    isAnswering, setIsAnswering,
    selectedAnswer, setSelectedAnswer,
    showModal, setShowModal,
    modalContent, setModalContent,
    questionsAnswered, setQuestionsAnswered,
    currentScreen, setCurrentScreen,
    moduleManager,
    audio,  // 🎵 Système audio
    user,  // Exposer l'utilisateur connecté
    isAnonymousMode,  // Mode anonyme (localStorage uniquement)
    isSupabaseConnected: Boolean(user && isConfigured && !isAnonymousMode),  // Indicateur de connexion Supabase
    onLogout: handleLogout,  // Fonction de déconnexion
    onSwitchToLogin: handleSwitchToLogin,  // Fonction pour passer du mode anonyme à la connexion
    onRefresh: handleRefresh,  // Fonction de rechargement manuel
    onManualSave: handleManualSave,  // Fonction de sauvegarde manuelle
    onLoadSave: handleLoadSave,  // Fonction de chargement de sauvegarde
    lastSaveTime: lastSaveTime  // Horodatage de la dernière sauvegarde
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-screen sm:h-[800px] sm:max-w-sm sm:rounded-[32px] bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden relative border-0 sm:border sm:border-white/20"
           style={{
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)'
           }}>

        {currentScreen === 'login' && (
          <LoginScreen
            onLoginWithPassword={signInWithPassword}
            onSignup={signUpWithPassword}
            onResetPassword={resetPassword}
            onAnonymousLogin={handleAnonymousLogin}
            audio={audio}
          />
        )}
        {currentScreen === 'password-reset' && (
          <PasswordResetScreen
            onResetComplete={() => setCurrentScreen('login')}
          />
        )}
        {currentScreen === 'pseudo-setup' && (
          <PseudoSetupScreen
            onPseudoSet={handlePseudoSetup}
            userEmail={user?.email}
            audio={audio}
          />
        )}
        {currentScreen === 'menu' && <MenuScreen {...screenProps} />}
        {currentScreen === 'levelSelect' && <LevelSelectScreen {...screenProps} />}
        {currentScreen === 'challenge' && <ChallengeScreen {...screenProps} />}
        {currentScreen === 'question' && <QuestionScreen {...screenProps} />}
        {currentScreen === 'victory' && <VictoryScreen {...screenProps} />}
        {currentScreen === 'gameOver' && <GameOverScreen {...screenProps} />}
        {currentScreen === 'bibleReader' && <BibleReaderScreen {...screenProps} />}
        {currentScreen === 'info' && <InfoScreen {...screenProps} />}

        {showModal && (
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            onClick={(e) => {
              // Fermer seulement si on clique sur l'arrière-plan, pas sur la modal
              if (e.target === e.currentTarget) {
                audio?.sounds?.wrash(); // Son de retour
                setShowModal(false);
              }
            }}
          >
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full max-h-[80%] overflow-y-auto shadow-2xl border border-white/20 animate-modal-in relative">
              {/* Bouton X en haut à droite */}
              <button
                onClick={() => {
                  audio?.sounds?.wrash(); // Son de retour
                  setShowModal(false);
                }}
                className="absolute top-4 right-4 w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center text-lg font-bold transition-all active:scale-95"
                title="Fermer"
              >
                ×
              </button>
              
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 mb-3 pr-8">
                  {modalContent.title}
                </h3>
                <div className="text-gray-700">
                  {modalContent.content}
                </div>
              </div>
              <button
                onClick={() => {
                  audio?.sounds?.wrash(); // Son de retour
                  setShowModal(false);
                }}
                className="w-full mt-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-bold shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200"
              >
                ← {t('navigation.back')}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes modal-in {
          0% { 
            opacity: 0; 
            transform: scale(0.9) translateY(-10px); 
          }
          100% { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        .animate-modal-in { 
          animation: modal-in 0.3s ease-out; 
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .animate-bounce-in { 
          animation: bounce-in 0.5s ease-out; 
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateX(10px); }
          100% { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fade-in { 
          animation: fade-in 0.2s ease-out; 
        }

        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
      
      {/* PWA Installation Prompt */}
      <InstallPrompt />
    </div>
  );
};

export default FaithChronicles;