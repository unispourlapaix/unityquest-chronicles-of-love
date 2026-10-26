import SheepScoreShare from '../SheepScoreShare';
import React from 'react';
import { ChevronRight, Star, Trophy, Sparkles, Info, Gem, Book, BookOpen, Heart } from 'lucide-react';
import { bibleData, bibleTreasures } from '../../data/bible';
import ConnectionStatus from '../ConnectionStatus.jsx';
import LanguageSelector from '../LanguageSelector.jsx';
import JohnTreasuresDisplay from '../JohnTreasuresDisplay.jsx';
import JohnBibleReader from '../JohnBibleReader.jsx';
import useTranslation from '../../hooks/useTranslation';

const MenuScreen = ({ 
  wisdomPoints, unlockedLevels, levelStars, score, revelationPoints,
  setCurrentScreen, setShowModal, setModalContent, setCurrentLevel,
  audio,
  totalXP, setTotalXP, setBibleReaderTab
}) => {
  const { t } = useTranslation();
  const [showAudioPanel, setShowAudioPanel] = React.useState(false);
  const [gospelStatus, setGospelStatus] = React.useState({ isPlaying: false, currentIndex: 0 });
  
  // Mise à jour du statut gospel
  React.useEffect(() => {
    if (!showAudioPanel) return;
    
    const updateGospelStatus = () => {
      if (window.faithGospelPlayer) {
        setGospelStatus({
          isPlaying: window.faithGospelPlayer.isPlaying || false,
          currentIndex: window.faithGospelPlayer.currentIndex || 0
        });
      }
    };
    
    // Mise à jour initiale
    updateGospelStatus();
    
    // Mise à jour périodique quand le panneau est ouvert
    const interval = setInterval(updateGospelStatus, 1000);
    return () => clearInterval(interval);
  }, [showAudioPanel]);
  
  const calculatePlayerRank = () => {
    if (wisdomPoints >= 12000) return t('ranks.saint');
    if (wisdomPoints >= 8000) return t('ranks.prophet');
    if (wisdomPoints >= 5000) return t('ranks.wise');
    if (wisdomPoints >= 3000) return t('ranks.faithful');
    if (wisdomPoints >= 1500) return t('ranks.believer');
    if (wisdomPoints >= 500) return t('ranks.disciple');
    return t('ranks.seeker');
  };

  const getTotalStars = () => {
    return Object.values(levelStars).reduce((total, stars) => total + stars, 0);
  };

  const hasLastThreeStars = () => {
    const totalStars = getTotalStars();
    return totalStars >= 271; // Les 3 dernières étoiles (271, 272, 273)
  };

  const openModal = (title, content) => {
    setModalContent({title, content});
    setShowModal(true);
  };

  const getNextLevelToPlay = () => {
    // Trouver le niveau le plus élevé débloqué
    const maxUnlocked = Math.max(...unlockedLevels);
    return maxUnlocked;
  };

  const getBibleTreasure = () => {
    return bibleTreasures.getRandomTreasure(t);
  };

  const resetProgress = () => {
    // Jouer le son de reset
    audio?.sounds?.reset();
    
    // Petite pause pour que l'utilisateur entende le son avant le rechargement
    setTimeout(() => {
      localStorage.removeItem('faithChroniclesProgress');
      window.location.reload();
    }, 200);
  };

  const openJohnBibleReader = (initialChapter = 1) => {
    openModal(t('bible.johnReaderTitle'),
      <JohnBibleReader 
        onClose={() => setShowModal(false)}
        initialChapter={initialChapter}
        totalXP={totalXP}
        setTotalXP={setTotalXP}
        audio={audio}
      />
    );
  };

  // Exposer la fonction globalement pour JohnTreasuresDisplay
  React.useEffect(() => {
    window.openJohnBibleReader = openJohnBibleReader;
    return () => {
      delete window.openJohnBibleReader;
    };
  }, []);



  return (
    <>
      {/* Arrière-plan décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/30 rounded-full transform rotate-45 blur-2xl"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/30 rounded-full transform rotate-12 blur-2xl"></div>
        <div className="absolute top-1/2 right-0 w-48 h-48 bg-blue-100/20 rounded-full blur-xl"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-100/20 rounded-full blur-xl"></div>
      </div>

      {/* Indicateur de connexion discret */}
      <ConnectionStatus audio={audio} score={score} />

      {/* Contrôles Audio - juste l'icône au début */}
      <div className="absolute top-3 left-3 z-50">
        {!showAudioPanel ? (
          // Icône son seule
          <button
            onClick={() => setShowAudioPanel(true)}
            className={`p-2 rounded-md transition-all hover:scale-105 bg-white/85 backdrop-blur-sm shadow-sm ${
              audio?.isEnabled 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-50'
            }`}
            title={t('menu.audioControls')}
          >
            {audio?.isEnabled ? '🔊' : '🔇'}
          </button>
        ) : (
          <>
            {/* Overlay pour fermer le panneau en cliquant dehors */}
            <div 
              className="fixed inset-0 z-40"
              onClick={() => setShowAudioPanel(false)}
            />
            
            {/* Panneau complet ouvert */}
            <div className="relative z-50 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              {/* Bouton Mute/Unmute */}
              <button
                onClick={() => {
                  audio?.toggleAudio();
                  audio?.sounds?.tick();
                }}
                className={`p-1 rounded-sm transition-all hover:scale-105 text-sm ${
                  audio?.isEnabled 
                    ? 'bg-green-50 text-green-600 hover:bg-green-100' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
                title={audio?.isEnabled ? t('menu.mute') : t('menu.unmute')}
              >
                {audio?.isEnabled ? '🔊' : '🔇'}
              </button>
              
              {/* Slider volume compact */}
              {audio?.isEnabled && (
                <div className="flex items-center gap-1">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={audio?.volume || 0.7}
                    onChange={(e) => audio?.changeVolume(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    title={`Volume: ${Math.round((audio?.volume || 0.7) * 100)}%`}
                  />
                  <span className="text-xs text-gray-400 text-[10px] min-w-[25px]">
                    {Math.round((audio?.volume || 0.7) * 100)}%
                  </span>
                </div>
              )}
              
              {/* Bouton fermer */}
              <button
                onClick={() => setShowAudioPanel(false)}
                className="p-1 rounded-sm bg-gray-50 text-gray-500 hover:bg-gray-100 transition-all text-xs"
                title={t('menu.close')}
              >
                ✕
              </button>
            </div>
            
            {/* Sélecteur de langue */}
            <div className="mb-2">
              <div className="text-xs text-gray-600 mb-1">{t('menu.language')} :</div>
              <LanguageSelector audio={audio} />
            </div>
            
            {/* Bouton Reset dans le panneau audio */}
            <div className="border-t border-gray-200 pt-2">
              <button
                onClick={() => {
                  audio?.sounds?.tick();
                  setShowAudioPanel(false); // Fermer le panneau d'abord
                  if (wisdomPoints > 0) {
                    openModal(t('menu.restart'),
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="text-6xl mb-4">⚠️</div>
                          <p className="text-sm text-gray-700 mb-4">
                            {t('menu.confirmReset')}
                          </p>
                          <div className="p-3 bg-red-50 rounded-xl">
                            <div className="text-xs text-red-700">
                              {t('menu.youWillLose')}<br/>
                              • {wisdomPoints} {t('menu.wisdomPoints')}<br/>
                              • {getTotalStars()} {t('menu.starsCollected')}<br/>
                              • {unlockedLevels.length} {t('menu.levelsUnlocked')}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <button 
                            onClick={resetProgress}
                            className="w-full py-3 bg-red-500 text-white rounded-full font-bold shadow-lg active:scale-95 transition-all"
                          >
                            {t('buttons.yesRestart')}
                          </button>
                          <button 
                            onClick={() => setShowModal(false)}
                            className="w-full py-3 bg-gray-200 text-gray-700 rounded-full font-semibold"
                          >
                            {t('buttons.noContinue')}
                          </button>
                        </div>
                      </div>
                    );
                  } else {
                    openModal(t('menu.newAdventure'),
                      <div className="text-center space-y-4">
                        <div className="text-5xl mb-4">🌟</div>
                        <div className="text-lg font-bold text-blue-700">{t('menu.readyToStart')}</div>
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                          <div className="text-sm text-gray-600">
                            {t('menu.startJourney')}
                          </div>
                        </div>
                      </div>
                    );
                  }
                }}
                className="w-full py-1.5 px-2 bg-orange-50 text-orange-600 rounded-md hover:bg-orange-100 transition-all text-xs font-medium flex items-center justify-center gap-1"
                title={t('menu.restartGame')}
              >
                🔄 {t('menu.reset')}
              </button>
            </div>
          </div>
          </>
        )}
      </div>

      <div className="relative z-10 p-8 h-full flex flex-col justify-between overflow-y-auto">
        <div className="text-center">
          {/* Logo avec croix moderne - Cliquable pour Unity */}
          <button
            onClick={() => {
              audio?.sounds?.tok();
              setBibleReaderTab && setBibleReaderTab('unity');
              setCurrentScreen('bibleReader');
            }}
            className="mb-2 mx-auto block hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            <div className="w-32 h-32 rounded-full shadow-2xl hover:shadow-3xl flex items-center justify-center relative transition-all"
                 style={{background: 'linear-gradient(145deg, #ffffff 0%, #f3f4f6 100%)'}}>
              <div className="absolute inset-0 rounded-full"
                   style={{background: 'radial-gradient(circle at center, rgba(139, 92, 246, 0.1) 0%, transparent 70%)'}}></div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center justify-center"
                     style={{transform: 'translate(2px, 2px)', opacity: 0.2}}>
                  <div className="w-12 h-2 bg-gray-400 rounded-full absolute"></div>
                  <div className="h-12 w-2 bg-gray-400 rounded-full absolute"></div>
                </div>
                <div className="relative flex items-center justify-center">
                  <div className="w-12 h-2 rounded-full absolute"
                       style={{
                         background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                         boxShadow: '0 2px 8px rgba(139, 92, 246, 0.5)'
                       }}></div>
                  <div className="h-12 w-2 rounded-full absolute"
                       style={{
                         background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
                         boxShadow: '0 2px 8px rgba(139, 92, 246, 0.5)'
                       }}></div>
                </div>
                <div className="absolute w-3 h-3 bg-white rounded-full"
                     style={{
                       boxShadow: '0 0 12px rgba(255, 255, 255, 0.8)',
                       background: 'radial-gradient(circle at 30% 30%, #ffffff, #e0e7ff)'
                     }}></div>
              </div>
              <div className="absolute inset-0">
                <div className="absolute top-6 right-10 w-1 h-1 bg-purple-400 rounded-full opacity-60 animate-pulse"></div>
                <div className="absolute bottom-8 left-8 w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60 animate-pulse" style={{animationDelay: '1s'}}></div>
                <div className="absolute top-12 left-12 w-1 h-1 bg-indigo-400 rounded-full opacity-60 animate-pulse" style={{animationDelay: '2s'}}></div>
              </div>
            </div>
          </button>
          
          <SheepScoreShare score={score} />
          {/* Titre avec effet 3D */}
          <div className="mb-4">
            <h1 className={`font-black mb-3 tracking-wider relative ${
              t('app.title').split(' ')[0].length <= 8 ? 'text-5xl' : 
              t('app.title').split(' ')[0].length <= 12 ? 'text-4xl' : 
              t('app.title').split(' ')[0].length <= 16 ? 'text-3xl' : 'text-2xl'
            }`}
                style={{
                  color: '#ffaa55',
                  background: 'linear-gradient(135deg, #ffcc77 0%, #ff9944 50%, #ff8833 100%)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: 'none',
                  transform: 'perspective(600px) rotateX(25deg)',
                  transformStyle: 'preserve-3d',
                  display: 'inline-block'
                }}>
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                color: '#ffcc77',
                zIndex: -1,
                transform: 'translateZ(-10px) translateY(2px)',
                opacity: 0.7
              }}>{t('app.title').split(' ')[0]}</span>
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                color: '#ffaa55',
                zIndex: -2,
                transform: 'translateZ(-20px) translateY(4px)',
                opacity: 0.5
              }}>{t('app.title').split(' ')[0]}</span>
              {t('app.title').split(' ')[0]}
            </h1>
            
            {t('app.title').split(' ').slice(1).join(' ') && (
              <h2 className={`font-medium tracking-[0.5em] relative ${
                t('app.title').split(' ').slice(1).join(' ').replace('\n', ' ').length <= 15 ? 'text-2xl' : 
                t('app.title').split(' ').slice(1).join(' ').replace('\n', ' ').length <= 25 ? 'text-xl' : 
                t('app.title').split(' ').slice(1).join(' ').replace('\n', ' ').length <= 35 ? 'text-lg' : 'text-base'
              }`}
                style={{
                  fontFamily: 'Trebuchet MS, sans-serif',
                  color: '#6b7280',
                  textShadow: `
                    -1px -1px 1px rgba(255,255,255,0.9),
                    1px 1px 2px rgba(0,0,0,0.5),
                    2px 2px 3px rgba(0,0,0,0.3)
                  `,
                  transform: 'perspective(400px) rotateX(10deg) scaleY(0.95)',
                  transformOrigin: 'center',
                  display: 'inline-block',
                  marginTop: '-8px',
                  letterSpacing: '0.5em',
                  whiteSpace: 'pre-line'
                }}>
                {t('app.title').split(' ').slice(1).join(' ')}
              </h2>
            )}
          </div>
          
          <div className="text-xs text-gray-600 mb-8">
            <div className="relative">
              {t('app.subtitle')}<br/>
              <span className="italic text-green-600 font-medium bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                {t('app.tagline')}
              </span>
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-gold-400 to-transparent opacity-70"></div>
            </div>
          </div>
          
          {/* Bloc-note avec progression */}
          <div className="mb-8 p-4 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-xl border-2 border-amber-200 relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 flex gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-2 h-4 bg-gray-400 rounded-full"></div>
              ))}
            </div>
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b border-blue-200 opacity-20" style={{marginTop: `${i * 28}px`}}></div>
              ))}
            </div>
            <div className="relative z-10">
              <div className="text-sm text-blue-800">{t('menu.spiritualRank')} :</div>
              <div className="text-xl font-bold text-blue-900 mb-1">{calculatePlayerRank()}</div>
              <div className="text-sm text-blue-800">{wisdomPoints} {t('menu.wisdomPoints')}</div>
              <div className="text-xs text-blue-700 mt-1">
                {unlockedLevels.length} {t('menu.levelsUnlocked')}
              </div>
              <div className="text-xs text-blue-600 italic mt-3 pt-2 border-t border-blue-200/50">
                {t('quotes.wisdom')}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button 
            onClick={() => {
              audio?.sounds?.gong();
              const levelToPlay = getNextLevelToPlay();
              setCurrentLevel(levelToPlay);
              setCurrentScreen('challenge');
            }}
            className="w-full py-2.5 bg-white text-black border-2 border-gray-200 rounded-full font-bold text-lg shadow-xl transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}
          >
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            
            <span className="relative z-10">{t('buttons.play')}</span>
            <ChevronRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-lg p-3 border border-yellow-100 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
              <Trophy className="w-6 h-6 mx-auto text-yellow-500 mb-1 drop-shadow-sm" />
              <div className="text-xs text-yellow-700 font-medium">{t('labels.score')}</div>
              <div className="font-bold text-yellow-800 text-sm">{score}</div>
            </div>
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg p-3 border border-purple-100 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
              <Star className="w-6 h-6 mx-auto text-purple-500 mb-1 drop-shadow-sm" />
              <div className="text-xs text-purple-700 font-medium">{t('labels.stars')}</div>
              <div className="font-bold text-purple-800 text-sm">{getTotalStars()}/273</div>
            </div>
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-3 border border-blue-100 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
              <Sparkles className="w-6 h-6 mx-auto text-blue-500 mb-1 drop-shadow-sm" />
              <div className="text-xs text-blue-700 font-medium">{t('labels.revelation')}</div>
              <div className="font-bold text-blue-800 text-sm">{revelationPoints}</div>
            </div>
          </div>
          
          {/* Menu du bas - Version simplifiée avec 3 boutons */}
          <div className="mt-6 grid grid-cols-3 gap-3 px-2">
            <button 
              onClick={() => {
                audio?.sounds?.tick();
                setCurrentScreen('info');
              }}
              className="flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/40 group"
            >
              <Info className="w-5 h-5 text-blue-500 mb-1 drop-shadow-sm group-hover:text-blue-600 transition-colors" />
              <span className="text-[10px] text-gray-700 font-medium group-hover:text-gray-800 transition-colors">{t('menu.info')}</span>
            </button>
            
            <button 
              onClick={() => {
                audio?.sounds?.tick();
                const treasure = getBibleTreasure();
                openModal(t('treasures.title'),
                  <div className="space-y-3">
                    {/* Bible Offline - EN PREMIER */}
                    <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                      <div className="text-xs font-bold text-indigo-700 mb-2">📖 {t('treasures.bibleOffline')}</div>
                      <div className="text-sm text-gray-700 font-semibold mb-1">{treasure.bibleResource.name}</div>
                      <div className="text-xs text-gray-600 mb-2">{treasure.bibleResource.description}</div>
                      <div className="text-xs text-indigo-600 mb-2">
                        {t('treasures.features')} : {treasure.bibleResource.features.join(", ")}
                      </div>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setCurrentScreen('bibleReader');
                        }}
                        className="w-full py-2 bg-indigo-500 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                      >
                        📖 {t('treasures.openReader')}
                      </button>
                    </div>
                    
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                      <div className="text-xs font-bold text-amber-700 mb-2">✨ {t('treasures.verse')}</div>
                      <div className="text-sm text-gray-700 italic">{treasure.verse}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <div className="text-xs font-bold text-blue-700 mb-2">🌟 {t('treasures.fact')}</div>
                      <div className="text-sm text-gray-700">{treasure.fact}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="text-xs font-bold text-purple-700 mb-2">🎁 {t('treasures.treasure')}</div>
                      <div className="text-sm text-gray-700">{treasure.treasure}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-xs font-bold text-green-700 mb-2">🤔 {t('treasures.question')}</div>
                      <div className="text-sm text-gray-700">{treasure.question}</div>
                    </div>
                    {hasLastThreeStars() && (
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                        <div className="text-xs font-bold text-amber-700 mb-2">💭 {t('treasures.emmanuelMemo')}</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {t('treasures.emmanuelMessage')}
                        </div>
                      </div>
                    )}
                    <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                      <div className="text-xs font-bold text-red-700 mb-2">❌ {t('treasures.clarification')}</div>
                      <div className="text-sm text-gray-700 mb-1">{treasure.jesusIsNot}</div>
                      <div className="text-xs text-gray-600 italic">{treasure.jesusIsNotContext}</div>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border">
                      <div className="text-xs font-bold text-gray-600 mb-1">📖 {t('treasures.bibleStudy')}</div>
                      <div className="text-xs text-gray-600 font-mono mb-1">{treasure.strongGreek}</div>
                      <div className="text-xs text-gray-500 italic">{t('treasures.version')} : {treasure.version}</div>
                    </div>
                  </div>
                );
              }}
              className="flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/40 group"
            >
              <Gem className="w-5 h-5 text-purple-500 mb-1 drop-shadow-sm group-hover:text-purple-600 transition-colors" />
              <span className="text-[10px] text-gray-700 font-medium text-center group-hover:text-gray-800 transition-colors">{t('menu.treasures')}</span>
            </button>

            <button 
              onClick={() => {
                audio?.sounds?.tick();
                openModal("",
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">📖</div>
                      <h3 className="text-lg font-bold text-blue-600">
                        {t('info.johnGospelTitle')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('info.johnGospelStats')}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-3">
                      {/* Lecteur Bible + Strong EN PREMIER */}
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setTimeout(() => {
                            openJohnBibleReader(1);
                          }, 100);
                        }}
                        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-indigo-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <BookOpen className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-blue-700">
                              {t('info.bibleReaderStrong')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {t('info.bibleReaderStrongDesc')}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-blue-500" />
                        </div>
                      </button>

                      {/* Trésors de Jean EN SECOND */}
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setTimeout(() => {
                            openModal(t('info.johnTreasures'),
                              <JohnTreasuresDisplay onClose={() => setShowModal(false)} />
                            );
                          }, 100);
                        }}
                        className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-blue-100 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Heart className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-semibold text-purple-700">
                              {t('info.johnTreasures')}
                            </div>
                            <div className="text-sm text-gray-600">
                              {t('info.johnTreasuresDesc')}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-purple-500" />
                        </div>
                      </button>
                    </div>

                    {/* Quick Access */}
                    <div className="pt-3 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        {t('info.quickAccessChapters')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { ch: 1, titleKey: "johnChapter1" },
                          { ch: 3, titleKey: "johnChapter3" },
                          { ch: 14, titleKey: "johnChapter14" },
                          { ch: 20, titleKey: "johnChapter20" }
                        ].map(({ ch, titleKey }) => (
                          <button
                            key={ch}
                            onClick={() => {
                              setShowModal(false);
                              setTimeout(() => {
                                openJohnBibleReader(ch);
                              }, 100);
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs font-medium text-gray-700 transition-colors"
                          >
                            Ch.{ch}: {t(`info.${titleKey}`)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }}
              className="flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/40 group relative"
            >
              {/* Badge "Nouveau" */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-[6px] font-bold">N</span>
              </div>
              
              <Book className="w-5 h-5 text-blue-600 mb-1 drop-shadow-sm group-hover:text-blue-700 transition-colors" />
              <span className="text-[10px] text-gray-700 font-medium text-center group-hover:text-gray-800 transition-colors">{t('menu.john')}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuScreen;