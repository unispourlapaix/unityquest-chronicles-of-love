import { shareScoreImage } from './share-score-image.js';
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const translations = window.UNITYQUEST_LOCAL_TRANSLATIONS;
  const words = Object.fromEntries(Object.entries(translations).map(([code, texts]) => [code, texts.words]));
  const companions = [
    { face: '🐑 🌸', color: '#faf0f4' },
    { face: '🐑 ✨', color: '#faf5e7' },
    { face: '🐑 🌿', color: '#edf4ed' },
    { face: '🐑 💜', color: '#f1ecf9' }
  ];
  let language = 'fr';
  let companion = Math.floor(Math.random() * companions.length);
  let progress = null;
  let sharing = false;
  const number = value => typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : 0;
  const format = value => new Intl.NumberFormat(translations[language].locale).format(value);
  function readProgress() {
    try {
      const raw = localStorage.getItem('faithChroniclesProgress');
      if (!raw) return { state: 'empty' };
      let data;
      try { data = JSON.parse(raw); } catch { return { state: 'invalid' }; }
      if (!data || typeof data !== 'object' || Array.isArray(data) || !['score', 'wisdomPoints', 'totalXP'].some(key => typeof data[key] === 'number' && Number.isFinite(data[key]) && data[key] >= 0)) return { state: 'invalid' };
      const levels = [...new Set((Array.isArray(data.unlockedLevels) ? data.unlockedLevels : [1]).filter(n => Number.isInteger(n) && n > 0))].sort((a, b) => a - b);
      const stars = data.levelStars && typeof data.levelStars === 'object' && !Array.isArray(data.levelStars) ? Object.values(data.levelStars).reduce((sum, value) => sum + Math.min(3, Math.floor(number(value))), 0) : 0;
      return { state: 'ready', pseudo: (!localStorage.getItem('faithChronicles_pseudo') || localStorage.getItem('faithChronicles_pseudo') === 'Joueur local') ? words[language].anonymous : localStorage.getItem('faithChronicles_pseudo'), score: number(data.score), wisdom: number(data.wisdomPoints), revelation: number(data.revelationPoints), xp: number(data.totalXP), stars, levels };
    } catch { return { state: 'unavailable' }; }
  }
  function resetShare() { $('share-state').textContent = ''; $('manual-share').hidden = true; $('manual-share').value = ''; }
  function renderCompanion() {
    const current = companions[companion];
    $('sheep-face').setAttribute('src', `companions/sheep-${companion}.svg`);
    $('sheep-message').textContent = translations[language].sheep[companion];
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
    const aliases = { ja: 'jp', ln: 'rc' };
    language = translations[aliases[value] || value] ? (aliases[value] || value) : 'fr';
    const texts = translations[language];
    document.documentElement.lang = texts.locale;
    document.documentElement.dir = texts.dir;
    document.title = 'Emmanuel Payet — ' + texts.labels.title;
    $('language').value = language;
    document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = texts.page[Number(element.dataset.i18n)]; });
    document.querySelectorAll('[data-label]').forEach(element => { element.textContent = texts.labels[element.dataset.label]; });
    document.querySelectorAll('[data-local-aria]').forEach(element => { element.setAttribute('aria-label', texts.labels[element.dataset.localAria]); });
    document.querySelectorAll('[data-local-alt]').forEach(element => { element.setAttribute('alt', texts.labels[element.dataset.localAlt]); });
    document.querySelectorAll('[data-back-label]').forEach(element => { element.setAttribute('aria-label', texts.page[32]); });
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
    const text = `${mascot.face} 💗 ✨ 😊 ${progress.pseudo} — ${words[language].score} : ${format(progress.score)} ${words[language].points} !\n${translations[language].sheep[companion]}`;
    try {
      const result = await shareScoreImage({ variant: companion, pseudo: progress.pseudo, score: progress.score, texts: translations[language], assetBase: '.', text });
      if (result === 'shared') $('share-state').textContent = words[language].shared;
      else if (result === 'downloaded') { showManual(text); $('share-state').textContent = words[language].downloaded; }
    } catch (error) { if (error.name !== 'AbortError') { showManual(text); $('share-state').textContent = words[language].imageError; } }
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
