import translations from '../data/localTranslations.json';
export const getLocalTexts = code => translations[code] || translations.fr;
export const getLocalPlayerName = texts => {
  const name = localStorage.getItem('faithChronicles_pseudo')?.trim();
  return !name || name === 'Joueur local' ? texts.words.anonymous : name;
};
