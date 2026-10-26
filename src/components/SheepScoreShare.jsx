import React, { useState } from 'react';
const sheep = [
  { face: '🐑 🌸', message: 'Un petit pas de douceur, un grand pas vers la paix.', color: 'bg-pink-50' },
  { face: '🐑 ✨', message: 'Que ta lumière continue de briller !', color: 'bg-amber-50' },
  { face: '🐑 🌿', message: 'Sème la paix, récolte l’amour.', color: 'bg-green-50' },
  { face: '🐑 💜', message: 'Chaque bonne réponse fait grandir l’espérance.', color: 'bg-purple-50' }
];
export default function SheepScoreShare({ score = 0 }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * sheep.length));
  const [status, setStatus] = useState('');
  const [manualText, setManualText] = useState('');
  const mascot = sheep[index];
  const share = async () => {
    const text = `${mascot.face} Mon score sur UnityQuest : ${score} points !\n${mascot.message}`;
    setStatus(''); setManualText('');
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Mon score UnityQuest', text });
        setStatus('Partage terminé.');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setStatus('Score et mouton copiés ! Collez-les dans votre message.');
      } else { setManualText(text); setStatus('Copiez le texte ci-dessous pour le partager.'); }
    } catch (error) {
      if (error.name !== 'AbortError') {
        setManualText(text); setStatus('Copiez le texte ci-dessous pour le partager.');
      }
    }
  };
  return <section aria-label="Mon mouton et mon score" className={`${mascot.color} rounded-2xl border border-purple-100 p-3 my-3 text-center relative`}>
    <div className="text-4xl" aria-label="Mouton compagnon">{mascot.face}</div>
    <p className="text-sm text-purple-900 mt-2">{mascot.message}</p>
    <p className="font-bold text-indigo-900 my-2">{score} points</p>
    <div className="flex justify-center gap-2 flex-wrap">
      <button type="button" onClick={share} className="bg-indigo-600 text-white rounded-xl px-3 py-2 text-sm font-bold">Partager mon score 🐑</button>
      <button type="button" onClick={() => { setIndex(i => (i + 1 + Math.floor(Math.random() * (sheep.length - 1))) % sheep.length); setStatus(''); setManualText(''); }} className="bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm">Autre mouton 🎲</button>
    </div>
    <p role="status" className="text-xs mt-2">{status}</p>
    {manualText && <textarea aria-label="Score à copier" readOnly value={manualText} onFocus={e => e.target.select()} className="w-full p-2 mt-2 border rounded-lg text-sm" />}
  </section>;
}
