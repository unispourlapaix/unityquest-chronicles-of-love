import React from 'react';
import { ChevronRight, Star, Trophy, Sparkles, Info, Gem } from 'lucide-react';
import { bibleData } from '../../data/bible/bibleData.js';
import ConnectionStatus from '../ConnectionStatus.jsx';
import { useTranslation } from '../../../contexts/LanguageContext.jsx';

const MenuScreen = ({ 
  wisdomPoints, unlockedLevels, levelStars, score, revelationPoints,
  setCurrentScreen, setShowModal, setModalContent, setCurrentLevel,
  user, isAnonymousMode, isSupabaseConnected, onSwitchToLogin, onRefresh, audio
}) => {
  const { t } = useTranslation();
  const [showAudioPanel, setShowAudioPanel] = React.useState(false);
  
  const calculatePlayerRank = () => {
    if (wisdomPoints >= 12000) return "Saint";
    if (wisdomPoints >= 8000) return "Prophète";
    if (wisdomPoints >= 5000) return "Sage";
    if (wisdomPoints >= 3000) return "Fidèle";
    if (wisdomPoints >= 1500) return "Croyant";
    if (wisdomPoints >= 500) return "Disciple";
    return "Chercheur";
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
    return bibleData.getRandomTreasure();
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

  const playAmaziSequence = () => {
    // Version SOUL d'Amazing Grace - style gospel émotionnel (20s)
    // Notes en fréquences Hz avec ornements et vibrato
    const playNote = (frequency, duration = 0.5, startTime = 0, volume = 0.3, vibrato = false, slide = null) => {
      if (!window.audioContext) {
        try {
          window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
          // console.warn('Web Audio API non supporté');
          return;
        }
      }

      const audioContext = window.audioContext;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      
      // Slide entre notes (style soul)
      if (slide) {
        oscillator.frequency.setValueAtTime(slide.from, audioContext.currentTime + startTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequency, audioContext.currentTime + startTime + 0.1);
      } else {
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime + startTime);
      }
      
      // Vibrato pour l'émotion (style soul)
      if (vibrato) {
        const lfo = audioContext.createOscillator();
        const lfoGain = audioContext.createGain();
        
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(5, audioContext.currentTime + startTime); // 5Hz vibrato
        lfoGain.gain.setValueAtTime(8, audioContext.currentTime + startTime); // Intensité vibrato
        
        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);
        
        lfo.start(audioContext.currentTime + startTime);
        lfo.stop(audioContext.currentTime + startTime + duration);
      }
      
      // Enveloppe expressive (attaque plus lente, sustain plus long)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + startTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + startTime + 0.1);
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime + startTime + duration - 0.2);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + startTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + startTime);
      oscillator.stop(audioContext.currentTime + startTime + duration);
    };

    // Notes avec blue notes pour le style soul
    const notes = {
      G4: 392,   // Sol
      A4: 440,   // La
      Bb4: 466,  // Si bémol (blue note)
      B4: 494,   // Si
      C5: 523,   // Do
      D5: 587,   // Ré
      Eb5: 622,  // Mi bémol (blue note)
      E5: 659,   // Mi
      F5: 698,   // Fa
      G5: 784    // Sol aigu
    };

    // console.log('� Jouer "Amazing Grace" version SOUL/Gospel...');

    // Mélodie SOUL avec ornements et blue notes
    const soulMelody = [
      // "A-ma-zing Grace" avec style gospel (0-6s)
      { note: notes.G4, time: 0, duration: 0.8, vibrato: true },                    // "A-" avec vibrato
      { note: notes.Bb4, time: 1.0, duration: 0.3, slide: {from: notes.G4} },      // "ma-" slide up (blue note)
      { note: notes.C5, time: 1.4, duration: 1.8, vibrato: true, volume: 0.4 },    // "zing" long et expressif
      { note: notes.Eb5, time: 3.5, duration: 0.4, slide: {from: notes.C5} },      // Grace ornement (blue note)
      { note: notes.C5, time: 4.0, duration: 1.0, vibrato: true },                 // "Grace" avec émotion
      
      // "how sweet the sound" avec melismes soul (5-11s)
      { note: notes.E5, time: 5.5, duration: 0.6 },                                // "how"
      { note: notes.F5, time: 6.2, duration: 0.3, slide: {from: notes.E5} },       // ornement
      { note: notes.G5, time: 6.6, duration: 1.2, vibrato: true, volume: 0.45 },   // "sweet" climax avec vibrato
      { note: notes.F5, time: 8.0, duration: 0.4 },                                // descente ornementée
      { note: notes.E5, time: 8.5, duration: 0.6 },                                // "the"
      { note: notes.C5, time: 9.2, duration: 1.5, vibrato: true },                 // "sound" tenu avec émotion
      
      // "That saved a wretch like me" avec soul profonde (11-17s)
      { note: notes.G4, time: 11.0, duration: 1.0, vibrato: true },                // "That" grave et expressif
      { note: notes.C5, time: 12.2, duration: 0.8, slide: {from: notes.G4} },      // "saved" montée
      { note: notes.E5, time: 13.2, duration: 0.8, vibrato: true },                // "a"
      { note: notes.Eb5, time: 14.2, duration: 0.6 },                              // "wretch" (blue note)
      { note: notes.D5, time: 15.0, duration: 0.6 },                               // transition
      { note: notes.C5, time: 15.8, duration: 0.8 },                               // "like"
      { note: notes.G4, time: 16.8, duration: 1.5, vibrato: true, volume: 0.35 }, // "me" final expressif
      
      // Finale gospel: "I once was lost" (18-20s)
      { note: notes.C5, time: 18.5, duration: 0.5, slide: {from: notes.G4} },      // "I"
      { note: notes.E5, time: 19.2, duration: 0.8, vibrato: true, volume: 0.4 },   // "once was lost" final
      
      // Harmonies gospel (plus riches)
      { note: notes.G4, time: 2.0, duration: 1.0, volume: 0.12 },
      { note: notes.Bb4, time: 4.5, duration: 0.8, volume: 0.15 },
      { note: notes.D5, time: 7.0, duration: 1.0, volume: 0.15 },
      { note: notes.G4, time: 9.5, duration: 1.2, volume: 0.18 },
      { note: notes.F5, time: 13.5, duration: 0.8, volume: 0.15 },
      { note: notes.C5, time: 16.0, duration: 1.0, volume: 0.18 },
      { note: notes.G5, time: 19.0, duration: 1.2, volume: 0.2 }
    ];

    // Jouer chaque note avec style soul
    soulMelody.forEach(({ note, time, duration, volume = 0.3, vibrato = false, slide = null }) => {
      setTimeout(() => {
        playNote(note, duration, 0, volume, vibrato, slide);
      }, time * 1000);
    });

    // Effets spirituels style gospel - très discrets
    setTimeout(() => audio?.sounds?.starEarned(), 3000);     // Étoile à "zing" (moment fort)
    setTimeout(() => audio?.sounds?.levelComplete(), 19500); // "Amen" final
  };

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
      <ConnectionStatus 
        user={user}
        isAnonymousMode={isAnonymousMode}
        isSupabaseConnected={isSupabaseConnected}
        onSwitchToLogin={onSwitchToLogin}
        onRefresh={onRefresh}
        audio={audio}
      />

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
            title="Contrôles audio"
          >
            {audio?.isEnabled ? '🔊' : '🔇'}
          </button>
        ) : (
          // Panneau complet ouvert
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-gray-200">
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
                title={audio?.isEnabled ? 'Couper le son' : 'Activer le son'}
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
                title="Fermer"
              >
                ✕
              </button>
            </div>
            
            {/* Tests audio */}
            <div className="space-y-2">
              <div className="text-xs text-gray-600">Tests :</div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => audio?.sounds?.correctAnswer()}
                  className="px-1 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                  title="Son correct"
                >
                  ✓
                </button>
                <button
                  onClick={() => audio?.sounds?.wrongAnswer()}
                  className="px-1 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  title="Son erreur"
                >
                  ✗
                </button>
                <button
                  onClick={() => audio?.sounds?.starEarned()}
                  className="px-1 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  title="Son étoile"
                >
                  ⭐
                </button>
                <button
                  onClick={() => audio?.sounds?.levelComplete()}
                  className="px-1 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  title="Son victoire"
                >
                  🎉
                </button>
              </div>
              
              {/* Boutons Foi, Courage, Sagesse */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  onClick={() => audio?.sounds?.faith()}
                  className="px-1 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 font-medium"
                  title="Son de Foi"
                >
                  ✨ FOI
                </button>
                <button
                  onClick={() => audio?.sounds?.courage()}
                  className="px-1 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 font-medium"
                  title="Son de Courage"
                >
                  ⚔️ COURAGE
                </button>
                <button
                  onClick={() => audio?.sounds?.wisdom()}
                  className="px-1 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 font-medium"
                  title="Son de Sagesse"
                >
                  📜 SAGESSE
                </button>
              </div>
              
              {/* Boutons Pof */}
              <div className="grid grid-cols-3 gap-1 pt-1">
                <button
                  onClick={() => audio?.sounds?.pof()}
                  className="px-1 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium"
                  title="Pof basique"
                >
                  💥 POF
                </button>
                <button
                  onClick={() => audio?.sounds?.pofHigh()}
                  className="px-1 py-1 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200 font-medium"
                  title="Pof aigu"
                >
                  ⚡ POF+
                </button>
                <button
                  onClick={() => audio?.sounds?.pofLow()}
                  className="px-1 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 font-medium"
                  title="Pof grave"
                >
                  🌊 POF-
                </button>
              </div>
              
              {/* Bouton Gong */}
              <div className="pt-1">
                <button
                  onClick={() => {
                    if (window.faithSounds) {
                      window.faithSounds.gong();
                    }
                  }}
                  className="w-full px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 font-medium"
                  title="Son de gong spirituel"
                >
                  🔔 GONG
                </button>
              </div>
              
              {/* Bouton Wrash */}
              <div className="pt-1">
                <button
                  onClick={() => audio?.sounds?.wrash()}
                  className="w-full px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
                  title="Son de retour wrash"
                >
                  💨 WRASH
                </button>
              </div>
              
              {/* Bouton Groook */}
              <div className="pt-1">
                <button
                  onClick={() => audio?.sounds?.groook()}
                  className="w-full px-2 py-1 text-xs bg-stone-100 text-stone-700 rounded hover:bg-stone-200 font-medium"
                  title="Son de pierre groook"
                >
                  🗿 GROOOK
                </button>
              </div>
              
              {/* Ligne 4 - Nouveaux sons percussifs */}
              <div className="grid grid-cols-4 gap-1">
              {/* Bouton Picth */}
              <button
                  onClick={() => audio?.sounds?.picth()}
                  className="px-1 py-1 text-xs bg-pink-100 text-pink-700 rounded hover:bg-pink-200"
                  title="Son cristallin picth pour étoiles"
                >
                  ✨ PICTH
                </button>
              
              {/* Bouton Cheube */}
              <button
                  onClick={() => audio?.sounds?.cheube()}
                  className="px-1 py-1 text-xs bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
                  title="Son navigation cheube pour < >"
                >
                  ↔️ CHEUBE
                </button>
              
              {/* Bouton Tok */}
              <button
                  onClick={() => audio?.sounds?.tok()}
                  className="px-1 py-1 text-xs bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                  title="Son tok pour continuer"
                >
                  ⚡ TOK
                </button>
              
              {/* Bouton Paf */}
              <button
                  onClick={() => audio?.sounds?.paf()}
                  className="px-1 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                  title="Son sec paf"
                >
                  👋 PAF
                </button>
              </div>
              
              {/* Ligne 5 - Pong et Boume */}
              <div className="grid grid-cols-2 gap-1">
              {/* Bouton Pong */}
              <button
                  onClick={() => audio?.sounds?.pong()}
                  className="px-1 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                  title="Son rebond pong"
                >
                  🏓 PONG
                </button>
              
              {/* Bouton Boume */}
              <button
                  onClick={() => audio?.sounds?.boume()}
                  className="px-1 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                  title="Son explosion boume"
                >
                  💥 BOUME
                </button>
              </div>
              
              {/* Ligne 6 - Reset et AMAZI */}
              <div className="grid grid-cols-2 gap-1">
              {/* Bouton Reset */}
              <button
                  onClick={() => audio?.sounds?.reset()}
                  className="px-1 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 font-medium"
                  title="Son whoosh reset pour remise à zéro"
                >
                  🔄 RESET
                </button>
              
              {/* Bouton Amazing Grace Soul */}
              <button
                  onClick={playAmaziSequence}
                  className="px-1 py-1 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded hover:from-purple-200 hover:to-pink-200 font-bold animate-pulse"
                  title="Amazing Grace version SOUL/Gospel 20s ♪ Avec vibrato et blue notes"
                >
                  � SOUL
                </button>
              </div>
              
              {/* Test technique */}
              <button
                onClick={() => {
                  if (window.faithSounds) {
                    window.faithSounds.test();
                  }
                }}
                className="w-full px-1 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                title="Test technique"
              >
                🧪 Test
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 p-8 h-full flex flex-col justify-between">
        <div className="text-center mt-2">
          {/* Logo avec croix moderne */}
          <div className="mb-2">
            <div className="w-32 h-32 mx-auto rounded-full shadow-2xl flex items-center justify-center relative"
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
          </div>
          
          {/* Titre avec effet 3D */}
          <div className="mb-4">
            <h1 className="text-5xl font-black mb-3 tracking-wider relative"
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
              }}>FAITH</span>
              <span style={{
                position: 'absolute',
                top: 0,
                left: 0,
                color: '#ffaa55',
                zIndex: -2,
                transform: 'translateZ(-20px) translateY(4px)',
                opacity: 0.5
              }}>FAITH</span>
              FAITH
            </h1>
            
            <h2 className="text-2xl font-medium tracking-[0.5em] relative"
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
                  letterSpacing: '0.5em'
                }}>
              CHRONICLES
            </h2>
          </div>
          
          <div className="text-xs text-gray-600 mb-8">
            <div className="relative">
              La Connaissance des Écritures<br/>
              <span className="italic text-green-600 font-medium bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                "Étudier les Écritures, c'est marcher vers la lumière divine"
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
              <div className="text-sm text-blue-800">{wisdomPoints} Points de Sagesse</div>
              <div className="text-xs text-blue-700 mt-1">
                {unlockedLevels.length} niveau(x) débloqué(s)
              </div>
              <div className="text-xs text-blue-600 italic mt-3 pt-2 border-t border-blue-200/50">
                "La connaissance vraie mène à la sagesse éternelle"
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
            className="w-full py-4 bg-white text-black border-2 border-gray-200 rounded-full font-bold text-lg shadow-xl transform transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group"
            style={{
              boxShadow: '0 10px 30px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.9)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
            }}
          >
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            
            <span className="relative z-10">JOUER</span>
            <ChevronRight className="w-5 h-5 relative z-10 transform group-hover:translate-x-1 transition-transform" />
          </button>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gradient-to-br from-white to-yellow-50 rounded-2xl shadow-lg p-3 border border-yellow-100 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
              <Trophy className="w-6 h-6 mx-auto text-yellow-500 mb-1 drop-shadow-sm" />
              <div className="text-xs text-yellow-700 font-medium">Score</div>
              <div className="font-bold text-yellow-800 text-sm">{score}</div>
            </div>
            <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-lg p-3 border border-purple-100 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
              <Star className="w-6 h-6 mx-auto text-purple-500 mb-1 drop-shadow-sm" />
              <div className="text-xs text-purple-700 font-medium">Étoiles</div>
              <div className="font-bold text-purple-800 text-sm">{getTotalStars()}/273</div>
            </div>
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg p-3 border border-blue-100 transform hover:scale-105 transition-all duration-200 hover:shadow-xl">
              <Sparkles className="w-6 h-6 mx-auto text-blue-500 mb-1 drop-shadow-sm" />
              <div className="text-xs text-blue-700 font-medium">Révélation</div>
              <div className="font-bold text-blue-800 text-sm">{revelationPoints}</div>
            </div>
          </div>
          
          {/* Menu du bas - Version améliorée */}
          <div className="mt-3 flex justify-around px-2">
            <button 
              onClick={() => {
                audio?.sounds?.tick();
                setCurrentScreen('info');
              }}
              className="flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/40 group"
              style={{minWidth: '85px'}}
            >
              <Info className="w-5 h-5 text-blue-500 mb-1 drop-shadow-sm group-hover:text-blue-600 transition-colors" />
              <span className="text-[10px] text-gray-700 font-medium group-hover:text-gray-800 transition-colors">Info</span>
            </button>
            
            <button 
              onClick={() => {
                audio?.sounds?.tick();
                const treasure = getBibleTreasure();
                openModal("💎 Les Trésors de la Bible",
                  <div className="space-y-3">
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                      <div className="text-xs font-bold text-amber-700 mb-2">✨ Verset du jour</div>
                      <div className="text-sm text-gray-700 italic">{treasure.verse}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                      <div className="text-xs font-bold text-blue-700 mb-2">🌟 Le saviez-vous ?</div>
                      <div className="text-sm text-gray-700">{treasure.fact}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <div className="text-xs font-bold text-purple-700 mb-2">📜 Trésor caché</div>
                      <div className="text-sm text-gray-700">{treasure.treasure}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-xs font-bold text-green-700 mb-2">🤔 Question rigolote</div>
                      <div className="text-sm text-gray-700">{treasure.question}</div>
                    </div>
                    {hasLastThreeStars() && (
                      <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                        <div className="text-xs font-bold text-amber-700 mb-2">📝 Mémo d'Emmanuel</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          Vous êtes arrivés en haut de la montagne, et la connaissance est acquise.<br/>
                          Mais la foi inébranlable demande de l'expérience de vie, de la miséricorde et du véritable amour de Jésus.<br/><br/>
                          
                          Les diverses épreuves de la vie testeront votre voie, le vrai chemin que l'on choisit, notre cœur.<br/>
                          Nous restons imparfaits, nos désirs sont nombreux, et l'amour du gain ou de notre confort personnel devient trop souvent notre priorité égoïste.<br/><br/>
                          
                          Demandez à Dieu la sagesse, son amour, sa force, et reconnaissez vos faiblesses humblement, car on ne peut rien Lui cacher… Rien.<br/>
                          Inutile de voyager en mode privé, en VPN, ou même d'effacer l'historique.<br/><br/>
                          
                          Jeûnez comme Daniel : privez-vous un moment de ce que vous aimez le plus, dans le calme et la sagesse. Cela vous permettra de mieux entendre Dieu, d'avoir une disposition de cœur prête aux transformations profondes — et souvent douloureuses.<br/>
                          Alors, les rêves et les songes deviendront plus clairs, comme pour Joseph.<br/><br/>
                          
                          Mais gardez-vous de l'orgueil : ne cédez pas au « j'ai toujours raison » ou au « je connais mieux ». Car la révélation de Dieu est une grâce extraordinaire.<br/>
                          Ne devenez pas un docteur de la Loi, capable de crucifier encore Jésus aujourd'hui, Lui qui demande simplement d'aimer votre prochain… et de lui accorder la même liberté que vous-même recevez.<br/><br/>
                          
                          Avoir la foi, c'est entrer dans une relation et un cheminement libre du cœur.<br/>
                          Elle fera de vous des héros puissants, capables de l'impossible.<br/>
                          Car l'expérience du surnaturel, la présence de Dieu, sa confirmation ou sa bénédiction vous rendra vraiment inébranlables.
                        </div>
                      </div>
                    )}
                    <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                      <div className="text-xs font-bold text-red-700 mb-2">❌ Clarification importante</div>
                      <div className="text-sm text-gray-700 mb-1">{treasure.jesusIsNot}</div>
                      <div className="text-xs text-gray-600 italic">{treasure.jesusIsNotContext}</div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                      <div className="text-xs font-bold text-indigo-700 mb-2">📖 Lire la Bible Offline</div>
                      <div className="text-sm text-gray-700 font-semibold mb-1">{treasure.bibleResource.name}</div>
                      <div className="text-xs text-gray-600 mb-2">{treasure.bibleResource.description}</div>
                      <div className="text-xs text-indigo-600 mb-2">
                        Fonctionnalités : {treasure.bibleResource.features.join(", ")}
                      </div>
                      <button
                        onClick={() => {
                          setShowModal(false);
                          setCurrentScreen('bibleReader');
                        }}
                        className="w-full py-2 bg-indigo-500 text-white rounded-full text-xs font-bold shadow-md hover:shadow-lg active:scale-95 transition-all"
                      >
                        📖 Ouvrir le lecteur
                      </button>
                    </div>
                    <div className="p-2 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border">
                      <div className="text-xs font-bold text-gray-600 mb-1">📖 Étude biblique</div>
                      <div className="text-xs text-gray-600 font-mono mb-1">{treasure.strongGreek}</div>
                      <div className="text-xs text-gray-500 italic">Version : {treasure.version}</div>
                    </div>
                  </div>
                );
              }}
              className="flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/40 group"
              style={{minWidth: '85px'}}
            >
              <Gem className="w-5 h-5 text-purple-500 mb-1 drop-shadow-sm group-hover:text-purple-600 transition-colors" />
              <span className="text-[10px] text-gray-700 font-medium text-center group-hover:text-gray-800 transition-colors">Trésors</span>
            </button>
            
            <button 
              onClick={() => {
                audio?.sounds?.tick();
                if (wisdomPoints > 0) {
                  openModal("🔄 Recommencer l'aventure ?",
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <p className="text-sm text-gray-700 mb-4">
                          Es-tu sûr de vouloir effacer toute ta progression ?
                        </p>
                        <div className="p-3 bg-red-50 rounded-xl">
                          <div className="text-xs text-red-700">
                            Tu perdras :<br/>
                            • {wisdomPoints} Points de Sagesse<br/>
                            • {getTotalStars()} étoiles collectées<br/>
                            • {unlockedLevels.length} niveaux débloqués
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <button 
                          onClick={resetProgress}
                          className="w-full py-3 bg-red-500 text-white rounded-full font-bold shadow-lg active:scale-95 transition-all"
                        >
                          Oui, recommencer
                        </button>
                        <button 
                          onClick={() => setShowModal(false)}
                          className="w-full py-3 bg-gray-200 text-gray-700 rounded-full font-semibold"
                        >
                          Non, continuer
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  openModal("🎮 Nouvelle Aventure",
                    <div className="text-center space-y-4">
                      <div className="text-5xl mb-4">🌟</div>
                      <div className="text-lg font-bold text-blue-700">Prêt à commencer ?</div>
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200">
                        <div className="text-sm text-gray-600">
                          "Commence ton voyage dans la connaissance des Écritures !"
                        </div>
                      </div>
                    </div>
                  );
                }
              }}
              className="flex flex-col items-center p-3 bg-white/80 backdrop-blur-sm rounded-2xl shadow-md hover:shadow-lg transition-all hover:scale-105 active:scale-95 border border-white/40 group"
              style={{minWidth: '85px'}}
            >
              <div className="w-5 h-5 text-orange-500 mb-1 drop-shadow-sm group-hover:text-orange-600 transition-colors text-center">🔄</div>
              <span className="text-[10px] text-gray-700 font-medium text-center group-hover:text-gray-800 transition-colors">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuScreen;