// Édition locale : aucun client cloud n'est créé.
export const supabase = null;
export const isSupabaseConfigured = () => false;
export const checkSession = async () => ({ session: null, isAuthenticated: false });
export const refreshSession = async () => ({ session: null, error: null });
