import React, { useEffect, useState } from 'react';
import useTranslation from '../hooks/useTranslation';
import { getLocalTexts, getLocalPlayerName } from '../utils/localTranslations';
const sheep = [
  { face: '🐑 🌸', color: 'bg-pink-50' },
  { face: '🐑 ✨', color: 'bg-amber-50' },
  { face: '🐑 🌿', color: 'bg-green-50' },
  { face: '🐑 💜', color: 'bg-purple-50' }
];
export default function SheepScoreShare({ score = 0, compact = false, variantIndex, onVariantChange, showMascot = true }) {
  const { currentLanguage } = useTranslation();
  const texts = getLocalTexts(currentLanguage);
  const [localIndex, setLocalIndex] = useState(() => Math.floor(Math.random() * sheep.length));
  const index = variantIndex ?? localIndex;
  const changeSheep = () => {
    const next = (index + 1 + Math.floor(Math.random() * (sheep.length - 1))) % sheep.length;
    if (onVariantChange) onVariantChange(next);
    else setLocalIndex(next);
    setStatus(''); setManualText('');
  };
  const [status, setStatus] = useState('');
  const [manualText, setManualText] = useState('');
  useEffect(() => { setStatus(''); setManualText(''); }, [currentLanguage]);
  const mascot = sheep[index];
  const formattedScore = new Intl.NumberFormat(texts.locale).format(score);
  const share = async () => {
    const pseudo = getLocalPlayerName(texts);
    const text = `${mascot.face} ${pseudo} — ${texts.words.score} : ${formattedScore} ${texts.words.points} !\n${texts.sheep[index]}`;
    setStatus(''); setManualText('');
    try {
      if (navigator.share) {
        await navigator.share({ title: texts.words.score, text });
        setStatus('shared');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
      } else { setManualText(text); setStatus('manual'); }
    } catch (error) {
      if (error.name !== 'AbortError') { setManualText(text); setStatus('manual'); }
    }
  };
  return <section aria-label={texts.labels.section} dir={texts.dir} className={`${mascot.color} rounded-2xl border border-purple-100 p-3 my-3 text-center relative`}>
    {showMascot && <img src={`${process.env.PUBLIC_URL || ''}/companions/sheep-${index}.svg`} width="260" height="250" alt={texts.labels.companion} className={`mx-auto h-auto ${compact ? 'w-20' : 'w-44'}`} />}
    {!compact && <p className="text-sm text-purple-900 mt-2">{texts.sheep[index]}</p>}
    <p className="font-bold text-indigo-900 my-2">{formattedScore} {texts.words.points}</p>
    <div className="flex justify-center gap-2 flex-wrap">
      <button type="button" onClick={share} className="bg-indigo-600 text-white rounded-xl px-3 py-2 text-sm font-bold">{texts.page[29]} 🐑</button>
      {!compact && <button type="button" onClick={changeSheep} className="bg-white border border-purple-200 rounded-xl px-3 py-2 text-sm">{texts.page[28]}</button>}
    </div>
    <p role="status" className="text-xs mt-2">{status ? texts.words[status] : ''}</p>
    {manualText && <textarea aria-label={texts.words.choose} readOnly value={manualText} onFocus={e => e.target.select()} className="w-full p-2 mt-2 border rounded-lg text-sm" />}
  </section>;
}
