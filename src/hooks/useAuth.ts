import { useState, useEffect, useCallback } from 'react';
import { api } from '@/services/api';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(() => {
    const localToken = localStorage.getItem('@FarmFlow:token');
    const localUserStr = localStorage.getItem('@FarmFlow:user');

    if (localToken && localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr);
        setUser(localUser);
        setSession({ access_token: localToken, user: localUser });
        setProfile({
          id: localUser.id,
          user_id: localUser.id,
          name: localUser.name || 'Usuário',
          role: localUser.role || 'admin',
          avatar_url: localUser.avatar_url || null,
        });
      } catch {
        localStorage.removeItem('@FarmFlow:token');
        localStorage.removeItem('@FarmFlow:user');
        setUser(null);
        setSession(null);
        setProfile(null);
      }
    } else {
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initAuth();

    const handleCustomAuthChange = () => {
      initAuth();
    };
    window.addEventListener('@FarmFlow:authChange', handleCustomAuthChange);

    return () => {
      window.removeEventListener('@FarmFlow:authChange', handleCustomAuthChange);
    };
  }, [initAuth]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post<{ user: any; token: string }>('/sessions', {
        email,
        password,
      });

      if (res && res.token && res.user) {
        localStorage.setItem('@FarmFlow:token', res.token);
        localStorage.setItem('@FarmFlow:user', JSON.stringify(res.user));
        setUser(res.user);
        setSession({ access_token: res.token, user: res.user });
        setProfile({
          id: res.user.id,
          user_id: res.user.id,
          name: res.user.name,
          role: res.user.role,
          avatar_url: res.user.avatar_url || null,
        });

        window.dispatchEvent(new CustomEvent('@FarmFlow:authChange'));
        return { data: { user: res.user, session: { access_token: res.token } }, error: null };
      }
      return { data: null, error: new Error('Credenciais inválidas.') };
    } catch (backendErr: any) {
      return { data: null, error: backendErr };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('@FarmFlow:token');
    localStorage.removeItem('@FarmFlow:user');
    setUser(null);
    setSession(null);
    setProfile(null);
    window.dispatchEvent(new CustomEvent('@FarmFlow:authChange'));
  };

  return {
    user,
    session,
    profile,
    loading,
    signIn,
    signOut,
    refreshAuth: initAuth,
  };
};
