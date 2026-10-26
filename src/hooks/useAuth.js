// Interface conservée pour les anciens écrans, sans authentification distante.
const unavailable = async () => ({ data: null, session: null, error: new Error('Connexion cloud désactivée dans cette édition locale.') });
const success = async () => ({ data: { user: null, session: null }, error: null });
export const useAuth = () => ({
  user: null, session: null, loading: false, isConfigured: false,
  signInAnonymously: success,
  signInWithEmail: unavailable,
  signInWithPassword: unavailable,
  signUpWithPassword: unavailable,
  resetPassword: unavailable,
  updatePassword: unavailable,
  signOut: success,
  importSessionFromProduction: unavailable,
});
