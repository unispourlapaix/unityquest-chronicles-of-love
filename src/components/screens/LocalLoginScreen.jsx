import React, { useState } from 'react';
import LanguageSelector from '../LanguageSelector';
export default function LocalLoginScreen({ onAnonymousLogin }) {
  const [pseudo, setPseudo] = useState(() => localStorage.getItem('faithChronicles_pseudo') || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const start = async event => {
    event.preventDefault();
    if (!pseudo.trim() || busy) return;
    setBusy(true);
    try {
      const result = await onAnonymousLogin(pseudo.trim());
      if (result?.error) throw result.error;
    } catch { setError('Impossible de sauvegarder : vérifiez le stockage de votre navigateur.'); }
    finally { setBusy(false); }
  };
  return <div className="h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex flex-col justify-center p-6">
    <div className="absolute top-4 right-4"><LanguageSelector /></div>
    <form onSubmit={start} className="bg-white rounded-3xl p-6 shadow-xl space-y-5">
      <div className="text-6xl text-center" aria-hidden="true">🐑</div>
      <h1 className="text-2xl font-bold text-center text-indigo-900">UnityQuest</h1>
      <p className="text-sm text-gray-600">Jouez en local. Votre progression est enregistrée dans ce navigateur.</p>
      <label className="block font-semibold" htmlFor="local-pseudo">Votre pseudo</label>
      <input id="local-pseudo" value={pseudo} onChange={e => setPseudo(e.target.value)} maxLength={40} required autoComplete="nickname" className="w-full border rounded-xl p-3" />
      {error && <p role="alert" className="text-red-700 text-sm">{error}</p>}
      <button disabled={busy || !pseudo.trim()} className="w-full rounded-xl bg-indigo-600 text-white p-4 font-bold disabled:opacity-50">{busy ? 'Chargement…' : 'Jouer 🐑'}</button>
      <p className="text-xs text-gray-500">La progression reste sur cet appareil. Exportez une sauvegarde avant d’effacer les données du navigateur.</p>
    </form>
  </div>;
}
