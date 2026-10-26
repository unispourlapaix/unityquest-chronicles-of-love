(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const words = {
    fr: { unavailable: 'Le stockage de ce navigateur est inaccessible. Ouvrez la page depuis le jeu et autorisez le stockage local.', empty: 'Votre aventure commence ici. Jouez à UnityQuest dans ce navigateur pour retrouver votre progression.', invalid: 'La sauvegarde locale ne peut pas être lue. Revenez au jeu pour vérifier votre progression.', ready: 'Votre progression sur cet appareil, actualisée depuis la sauvegarde du jeu.', player: 'Le chemin de', anonymous: 'Joueur local', levels: 'niveaux débloqués', highest: 'niveau le plus élevé', copied: 'Score et mouton copiés. Vous pouvez les coller dans votre message.', manual: 'Sélectionnez et copiez ce texte pour partager votre score.', shared: 'Partage terminé.', score: 'Mon score sur UnityQuest', points: 'points', choose: 'Copier le texte du partage' },
    en: { unavailable: 'Browser storage is unavailable. Open this page from the game and allow local storage.', empty: 'Your adventure starts here. Play UnityQuest in this browser to see your progress.', invalid: 'The local save could not be read. Return to the game to check your progress.', ready: 'Your progress on this device, refreshed from the game save.', player: 'The journey of', anonymous: 'Local player', levels: 'levels unlocked', highest: 'highest level', copied: 'Score and sheep copied. Paste them into your message.', manual: 'Select and copy this text to share your score.', shared: 'Sharing complete.', score: 'My UnityQuest score', points: 'points', choose: 'Copy the sharing text' }
  };
  const companions = [
    { face: '🐑 🌸', color: '#faf0f4', fr: 'Un petit pas de douceur, un grand pas vers la paix.', en: 'A little step of kindness, a big step towards peace.' },
    { face: '🐑 ✨', color: '#faf5e7', fr: 'Que ta lumière continue de briller !', en: 'Keep your light shining!' },
    { face: '🐑 🌿', color: '#edf4ed', fr: 'Sème la paix, récolte l’amour.', en: 'Sow peace, harvest love.' },
    { face: '🐑 💜', color: '#f1ecf9', fr: 'Chaque bonne réponse fait grandir l’espérance.', en: 'Every right answer helps hope grow.' }
  ];
  let language = 'fr';
  let companion = Math.floor(Math.random() * companions.length);
  let progress = null;
  let sharing = false;
  const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
  const format = value => new Intl.NumberFormat(language).format(value);
  function readProgress() {
    try {
      const raw = localStorage.getItem('faithChroniclesProgress');
      if (!raw) return { state: 'empty' };
      let data;
      try { data = JSON.parse(raw); } catch { return { state: 'invalid' }; }
      if (!data || typeof data !== 'object' || Array.isArray(data) || !['score', 'wisdomPoints', 'totalXP'].some(key => typeof data[key] === 'number' && Number.isFinite(data[key]) && data[key] >= 0)) return { state: 'invalid' };
      const levels = [...new Set((Array.isArray(data.unlockedLevels) ? data.unlockedLevels : [1]).filter(n => Number.isInteger(n) && n > 0))].sort((a, b) => a - b);
      const stars = data.levelStars && typeof data.levelStars === 'object' && !Array.isArray(data.levelStars) ? Object.values(data.levelStars).reduce((sum, value) => sum + Math.min(3, Math.floor(number(value))), 0) : 0;
      return { state: 'ready', pseudo: localStorage.getItem('faithChronicles_pseudo') || words[language].anonymous, score: number(data.score), wisdom: number(data.wisdomPoints), revelation: number(data.revelationPoints), xp: number(data.totalXP), stars, levels };
    } catch { return { state: 'unavailable' }; }
  }
  function resetShare() { $('share-state').textContent = ''; $('manual-share').hidden = true; $('manual-share').value = ''; }
  function renderCompanion() {
    const current = companions[companion];
    $('sheep-face').textContent = current.face;
    $('sheep-message').textContent = current[language];
    $('sheep-panel').style.backgroundColor = current.color;
  }
  function renderProgress() {
    progress = readProgress();
    $('data-state').textContent = words[language][progress.state];
    $('share').disabled = progress.state !== 'ready' || sharing;
    $('player-name').textContent = progress.state === 'ready' ? `${words[language].player} ${progress.pseudo}` : '';
    for (const key of ['score', 'wisdom', 'revelation', 'xp', 'stars']) $(key).textContent = progress.state === 'ready' ? format(progress[key]) : '—';
    $('levels').textContent = progress.state === 'ready' ? `${progress.levels.length} ${words[language].levels} · ${words[language].highest} : ${progress.levels.at(-1) || 1}` : '';
  }
  function setLanguage(value) {
    language = value === 'en' ? 'en' : 'fr';
    document.documentElement.lang = language;
    document.title = language === 'fr' ? 'Emmanuel Payet — Art, foi & liens' : 'Emmanuel Payet — Art, faith & connection';
    $('language').value = language;
    document.querySelectorAll('[data-fr]').forEach(element => { element.textContent = element.dataset[language]; });
    $('manual-share').setAttribute('aria-label', words[language].choose);
    resetShare(); renderCompanion(); renderProgress();
  }
  function showManual(text) {
    $('manual-share').value = text; $('manual-share').hidden = false;
    $('share-state').textContent = words[language].manual;
    $('manual-share').focus(); $('manual-share').select();
  }
  async function shareScore() {
    if (sharing) return;
    renderProgress();
    if (progress.state !== 'ready') return;
    resetShare(); sharing = true; $('share').disabled = true;
    const mascot = companions[companion];
    const text = `${mascot.face} ${words[language].score} : ${format(progress.score)} ${words[language].points} !\n${mascot[language]}`;
    try {
      if (typeof navigator.share === 'function') { await navigator.share({ title: 'UnityQuest', text }); $('share-state').textContent = words[language].shared; }
      else if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); $('share-state').textContent = words[language].copied; }
      else showManual(text);
    } catch (error) { if (error.name !== 'AbortError') showManual(text); }
    finally { sharing = false; renderProgress(); }
  }
  $('language').addEventListener('change', event => {
    try { localStorage.setItem('emmanuelModuleLanguage', event.target.value); } catch {}
    setLanguage(event.target.value);
  });
  $('refresh').addEventListener('click', () => { resetShare(); renderProgress(); });
  $('new-sheep').addEventListener('click', () => { companion = (companion + 1 + Math.floor(Math.random() * (companions.length - 1))) % companions.length; resetShare(); renderCompanion(); });
  $('share').addEventListener('click', shareScore);
  $('manual-share').addEventListener('focus', event => event.target.select());
  window.addEventListener('storage', event => { if (!event.key || ['faithChroniclesProgress', 'faithChronicles_pseudo'].includes(event.key)) { resetShare(); renderProgress(); } });
  window.addEventListener('focus', renderProgress);
  let initial = new URLSearchParams(location.search).get('lang');
  if (!initial) try { initial = localStorage.getItem('emmanuelModuleLanguage') || localStorage.getItem('faithchronicles_language'); } catch {}
  setLanguage(initial);
})();
