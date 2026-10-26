import React, { useState } from 'react';
import { User, Mail, Cloud, LogOut, RefreshCw, Save, Edit2, Check, X } from 'lucide-react';
import { getLanguage, getLanguageList } from '../data/translations/languages.js';
import { useTranslation } from '../hooks/useTranslation.js';

const ConnectionStatus = ({ 
  user, 
  isAnonymousMode, 
  isSupabaseConnected, 
  onLogout,
  onRefresh,
  onManualSave,
  lastSaveTime,
  className = "",
  audio, // Ajout du prop audio
  onSwitchToLogin // Nouvelle prop pour basculer vers l'écran de connexion
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const [newPseudo, setNewPseudo] = useState('');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const { t, changeLanguage } = useTranslation();

  const handleSave = async () => {
    if (!onManualSave) return;
    
    setIsSaving(true);
    try {
      await onManualSave();
      setTimeout(() => setIsSaving(false), 2000); // Feedback visuel
    } catch (error) {
      setIsSaving(false);
    }
  };

  const handlePseudoEdit = () => {
    const currentPseudo = localStorage.getItem('faithChronicles_pseudo') || 'Anonyme';
    setNewPseudo(currentPseudo);
    setIsEditingPseudo(true);
  };

  const handlePseudoSave = () => {
    if (newPseudo.trim().length >= 2) {
      // Sauvegarder le nouveau pseudo dans localStorage (sans perdre la progression)
      localStorage.setItem('faithChronicles_pseudo', newPseudo.trim());
      audio?.sounds?.starEarned(); // Son de succès
      setIsEditingPseudo(false);
      // Forcer un re-render en fermant/ouvrant le menu
      setIsExpanded(false);
      setTimeout(() => setIsExpanded(true), 100);
    } else {
      audio?.sounds?.wrong(); // Son d'erreur
    }
  };

  const handlePseudoCancel = () => {
    setIsEditingPseudo(false);
    setNewPseudo('');
  };

  const formatLastSave = () => {
    if (!lastSaveTime) return t('login.never');
    return new Date(lastSaveTime).toLocaleTimeString();
  };

  // Récupérer la langue actuelle et son drapeau
  const getCurrentLanguage = () => {
    const langCode = localStorage.getItem('faithchronicles_language') || 'fr';
    return getLanguage(langCode);
  };

  // Changer de langue
  const handleLanguageChange = (langCode) => {
    audio?.sounds?.tick();
    changeLanguage(langCode);
    setShowLanguageMenu(false);
  };

  // Ne pas afficher si pas d'utilisateur ET pas en mode anonyme
  if (!user && !isAnonymousMode) return null;

  // Récupérer le pseudo à afficher
  const getDisplayName = () => {
    // Toujours récupérer le pseudo depuis localStorage en priorité
    const savedPseudo = localStorage.getItem('faithChronicles_pseudo');
    
    if (savedPseudo) {
      return savedPseudo;
    }
    
    if (isAnonymousMode) {
      return 'Anonyme';
    } else if (user) {
      // Fallback sur l'email si pas de pseudo
      return user.email?.split('@')[0] || 'Joueur';
    }
    return 'Joueur';
  };

  const getStatusInfo = () => {
    if (isAnonymousMode) {
      return {
        type: 'anonymous',
        icon: User,
        title: getDisplayName(),
        color: 'bg-orange-500',
        dotColor: 'bg-orange-400'
      };
    } else if (isSupabaseConnected) {
      return {
        type: 'connected',
        icon: Cloud,
        title: getDisplayName(),
        color: 'bg-green-500',
        dotColor: 'bg-green-400'
      };
    } else {
      return {
        type: 'email_pending',
        icon: Mail,
        title: getDisplayName(),
        color: 'bg-blue-500',
        dotColor: 'bg-blue-400'
      };
    }
  };

  const status = getStatusInfo();
  const Icon = status.icon;

  return (
    <div className={`absolute top-4 right-4 z-50 ${className}`}>
      {/* Overlay pour fermer en cliquant dehors */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Version compacte (par défaut) */}
      <div 
        className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-white/60 transition-all duration-300 hover:shadow-xl relative z-50"
        style={{ 
          width: isExpanded ? '280px' : '50px', 
          height: '50px',
          overflow: isExpanded ? 'visible' : 'hidden'
        }}
      >
        <div className="flex items-center h-full">
          {/* Bouton principal */}
          <button
            onClick={() => {
              audio?.sounds?.buttonClick(); // Son clic bouton
              setIsExpanded(!isExpanded);
            }}
            className="flex items-center justify-center w-12 h-12 flex-shrink-0"
          >
            <div className="relative">
              <div className={`${status.color} rounded-full p-2 shadow-sm`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              {/* Indicateur de statut */}
              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${status.dotColor} rounded-full border-2 border-white ${status.type === 'email_pending' ? 'animate-pulse' : ''}`}></div>
            </div>
          </button>

          {/* Contenu étendu */}
          {isExpanded && (
            <div className="flex items-center justify-between flex-1 px-3 py-2 animate-fade-in">
              <div className="flex-1 min-w-0">
                {/* Mode édition du pseudo (pour tous les utilisateurs) */}
                {isEditingPseudo ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={newPseudo}
                      onChange={(e) => setNewPseudo(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handlePseudoSave();
                        if (e.key === 'Escape') handlePseudoCancel();
                      }}
                      className="text-sm px-2 py-1 border border-gray-300 rounded w-28 focus:outline-none focus:border-blue-400 font-medium"
                      placeholder="Pseudo..."
                      maxLength={20}
                      autoFocus
                    />
                    <button
                      onClick={handlePseudoSave}
                      className="p-1 hover:bg-green-50 rounded-full transition-colors"
                      title={t('login.confirm')}
                    >
                      <Check className="w-3.5 h-3.5 text-green-600" />
                    </button>
                    <button
                      onClick={handlePseudoCancel}
                      className="p-1 hover:bg-red-50 rounded-full transition-colors"
                      title={t('login.cancel')}
                    >
                      <X className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="text-sm font-medium text-gray-800">
                      {status.title}
                    </div>
                    {/* Bouton éditer pseudo (pour tous les utilisateurs) */}
                    <button
                      onClick={() => {
                        audio?.sounds?.tick();
                        handlePseudoEdit();
                      }}
                      className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                      title={t('login.editPseudo')}
                    >
                      <Edit2 className="w-3 h-3 text-gray-500" />
                    </button>
                    {/* Sélecteur de langue (drapeaux uniquement) */}
                    <div className="relative z-[100]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // console.log('Clic sur drapeau, état actuel:', showLanguageMenu);
                          audio?.sounds?.tick();
                          setShowLanguageMenu(!showLanguageMenu);
                          // console.log('Nouvel état du menu:', !showLanguageMenu);
                        }}
                        className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-md transition-all cursor-pointer"
                        title={`Langue: ${getCurrentLanguage().nativeName}`}
                        type="button"
                      >
                        <span className="text-base">
                          {getCurrentLanguage().flag || getCurrentLanguage().code.toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {getCurrentLanguage().code.toUpperCase()}
                        </span>
                      </button>
                      
                      {/* Menu des drapeaux */}
                      {showLanguageMenu && (
                        <>
                          {/* Overlay pour fermer */}
                          <div 
                            className="fixed inset-0 z-[100]"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowLanguageMenu(false);
                            }}
                          />
                          
                          {/* Menu centré compact avec texte - avec marges de sécurité */}
                          <div 
                            className="fixed bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-4 z-[110] w-80 max-w-[90vw] max-h-[85vh] flex flex-col"
                            style={{ 
                              top: '10vh',
                              left: '50%',
                              transform: 'translateX(-50%)'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Titre */}
                            <div className="text-center mb-3 pb-2 border-b border-gray-200 flex-shrink-0">
                              <h3 className="text-lg font-bold text-gray-800">🌍 Langue / Language</h3>
                            </div>
                            
                            {/* Liste des langues - 2 colonnes avec scroll */}
                            <div className="grid grid-cols-2 gap-2 overflow-y-auto flex-1 pr-1">
                              {getLanguageList().map((lang) => (
                                <button
                                  key={lang.code}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLanguageChange(lang.code);
                                  }}
                                  className={`flex items-center gap-2 p-2.5 rounded-lg transition-all text-left ${
                                    getCurrentLanguage().code === lang.code 
                                      ? 'bg-blue-500 text-white shadow-md' 
                                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <span className="text-2xl flex-shrink-0 w-8 h-8 flex items-center justify-center">
                                    {lang.flag || lang.code.toUpperCase()}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-medium block truncate">{lang.nativeName}</span>
                                    <span className={`text-xs ${getCurrentLanguage().code === lang.code ? 'text-blue-100' : 'text-gray-500'}`}>
                                      {lang.code.toUpperCase()}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                            
                            {/* Bouton fermer */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowLanguageMenu(false);
                              }}
                              className="mt-3 w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors flex-shrink-0"
                            >
                              ✕ {t('login.close')}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center space-x-1">
                {/* Bouton "Se connecter" pour les anonymes */}

                {/* Bouton de sauvegarde manuelle */}
                {onManualSave && (
                  <button
                    onClick={() => {
                      audio?.sounds?.pof(); // Son de sauvegarde
                      handleSave();
                    }}
                    disabled={isSaving}
                    className="p-1.5 hover:bg-green-50 rounded-full transition-colors group"
                    title={`${t('login.save')}${lastSaveTime ? ` (${t('login.lastSave')}: ${formatLastSave()})` : ''}`}
                  >
                    <Save className={`w-3.5 h-3.5 ${isSaving ? 'text-green-300 animate-pulse' : 'text-green-600 group-hover:text-green-700'}`} />
                  </button>
                )}

                {/* Bouton refresh pour utilisateurs connectés */}
                {onRefresh && isSupabaseConnected && (
                  <button
                    onClick={() => {
                      audio?.sounds?.tick(); // Son de rafraîchissement
                      onRefresh();
                    }}
                    className="p-1.5 hover:bg-blue-50 rounded-full transition-colors group"
                    title={t('login.refresh')}
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600 group-hover:text-blue-700" />
                  </button>
                )}

                {/* Bouton de déconnexion */}
                {onLogout && (
                  <button
                    onClick={() => {
                      audio?.sounds?.wrash(); // Son de déconnexion
                      onLogout();
                    }}
                    className="p-1.5 hover:bg-red-50 rounded-full transition-colors group"
                    title={t('login.logout')}
                  >
                    <LogOut className="w-3.5 h-3.5 text-red-600 group-hover:text-red-700" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message d'aide discret */}
      {isExpanded && status.type === 'email_pending' && (
        <div className="mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg p-2 shadow-sm animate-fade-in">
          💌 {t('login.checkEmail')}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;