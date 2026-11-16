import React, { useState, useEffect } from 'react';
import { moduleManager } from '../utils/ModuleManager.js';
import useAudio from '../hooks/useAudio';
import { useTranslation } from '../hooks/useTranslation.js';

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
  // Hook Audio 🎵
  const audio = useAudio();
  const { t, currentLanguage } = useTranslation();
  
  // Synchroniser la langue avec ModuleManager
  useEffect(() => {
    moduleManager.setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Fonction de chargement depuis localStorage (fallback)
  const loadProgress = () => {
    try {
      const saved = localStorage.getItem('faithChroniclesProgress');
      const data = JSON.parse(saved);
      if (data && typeof data === 'object' && !Array.isArray(data)) return {
        score: data.score ?? 0, wisdomPoints: data.wisdomPoints ?? 0,
        revelationPoints: data.revelationPoints ?? 0, totalXP: data.totalXP ?? 0,
        unlockedLevels: Array.isArray(data.unlockedLevels) ? data.unlockedLevels : [1],
        levelStars: data.levelStars ?? {}
      };
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

  const [savedProgress] = useState(loadProgress);
  const [currentScreen, setCurrentScreen] = useState('menu');
  const [bibleReaderTab, setBibleReaderTab] = useState('bible'); // État pour l'onglet Bible Reader
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

  useEffect(() => {
    try {
      localStorage.setItem('faithChroniclesProgress', JSON.stringify({
        score, wisdomPoints, revelationPoints, unlockedLevels, levelStars, totalXP
      }));
    } catch {
      // Le jeu reste utilisable si le stockage du navigateur est indisponible.
    }
  }, [score, wisdomPoints, revelationPoints, unlockedLevels, levelStars, totalXP]);

  const saveStarsForLevel = (levelNum, stars) => {
    setLevelStars(prev => ({ ...prev, [levelNum]: stars }));
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
    audio
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-0 sm:p-4">
      <div className="w-full h-screen sm:h-[800px] sm:max-w-sm sm:rounded-[32px] bg-white/95 backdrop-blur-xl shadow-2xl overflow-hidden relative border-0 sm:border sm:border-white/20"
           style={{
             boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)'
           }}>

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