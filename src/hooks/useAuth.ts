import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/services/api';
import {
  normalizeRoleLabel,
  PermissionKey,
  resolveUserPermissions,
} from '@/constants/permissions';

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  role: string | null;
  status?: string | null;
  permissions: PermissionKey[];
  avatar_url: string | null;
}

let syncedToken: string | null = null;
let inFlightMePromise: Promise<any> | null = null;

export const syncCurrentUserProfile = (updatedUser: any) => {
  try {
    const raw = localStorage.getItem('@FarmFlow:user');
    if (!raw) return;
    const current = JSON.parse(raw);
    if (current?.id && updatedUser?.id && current.id === updatedUser.id) {
      const merged = { ...current, ...updatedUser };
      localStorage.setItem('@FarmFlow:user', JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent('@FarmFlow:authChange'));
    }
  } catch {}
};

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<PermissionKey[]>([]);
  const [loading, setLoading] = useState(true);

  const clearSessionState = useCallback(() => {
    localStorage.removeItem('@FarmFlow:token');
    localStorage.removeItem('@FarmFlow:user');
    syncedToken = null;
    setUser(null);
    setSession(null);
    setProfile(null);
    setPermissions([]);
  }, []);

  const applyUserSession = useCallback((token: string, rawUser: any) => {
    const resolvedPermissions = resolveUserPermissions(rawUser);
    const normalizedRole = normalizeRoleLabel(rawUser?.role);
    const enrichedUser = {
      ...rawUser,
      role: normalizedRole,
      permissions: resolvedPermissions,
      status: rawUser?.status === 'Inativo' ? 'Inativo' : 'Ativo',
    };

    setUser(enrichedUser);
    setSession({ access_token: token, user: enrichedUser });
    setPermissions(resolvedPermissions);
    setProfile({
      id: enrichedUser.id,
      user_id: enrichedUser.id,
      name: enrichedUser.name || 'Usuário',
      role: normalizedRole,
      status: enrichedUser.status,
      permissions: resolvedPermissions,
      avatar_url: enrichedUser.avatar_url || null,
    });
  }, []);

  const initAuth = useCallback(() => {
    const localToken = localStorage.getItem('@FarmFlow:token');
    const localUserStr = localStorage.getItem('@FarmFlow:user');

    if (localToken && localUserStr) {
      try {
        const localUser = JSON.parse(localUserStr);
        applyUserSession(localToken, localUser);
      } catch {
        clearSessionState();
      }
    } else {
      setUser(null);
      setSession(null);
      setProfile(null);
      setPermissions([]);
    }
    setLoading(false);
  }, [applyUserSession, clearSessionState]);

  useEffect(() => {
    initAuth();

    const localToken = localStorage.getItem('@FarmFlow:token');
    if (localToken && syncedToken !== localToken) {
      syncedToken = localToken;
      if (!inFlightMePromise) {
        inFlightMePromise = api
          .get<{ user: any }>('/sessions/me')
          .finally(() => {
            inFlightMePromise = null;
          });
      }

      inFlightMePromise
        .then((res) => {
          if (res?.user && localStorage.getItem('@FarmFlow:token') === localToken) {
            const currentRaw = localStorage.getItem('@FarmFlow:user');
            const nextStr = JSON.stringify(res.user);
            if (currentRaw !== nextStr) {
              localStorage.setItem('@FarmFlow:user', nextStr);
              window.dispatchEvent(new CustomEvent('@FarmFlow:authChange'));
            }
          }
        })
        .catch((err) => {
          if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
            clearSessionState();
            window.dispatchEvent(new CustomEvent('@FarmFlow:authChange'));
          }
        });
    }

    const handleCustomAuthChange = () => {
      initAuth();
    };
    window.addEventListener('@FarmFlow:authChange', handleCustomAuthChange);

    return () => {
      window.removeEventListener('@FarmFlow:authChange', handleCustomAuthChange);
    };
  }, [clearSessionState, initAuth]);

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.post<{ user: any; token: string }>('/sessions', {
        email,
        password,
      });

      if (res && res.token && res.user) {
        syncedToken = res.token;
        localStorage.setItem('@FarmFlow:token', res.token);
        localStorage.setItem('@FarmFlow:user', JSON.stringify(res.user));
        applyUserSession(res.token, res.user);

        window.dispatchEvent(new CustomEvent('@FarmFlow:authChange'));
        return { data: { user: res.user, session: { access_token: res.token } }, error: null };
      }
      return { data: null, error: new Error('Credenciais inválidas.') };
    } catch (backendErr: any) {
      return { data: null, error: backendErr };
    }
  };

  const signOut = async () => {
    clearSessionState();
    window.dispatchEvent(new CustomEvent('@FarmFlow:authChange'));
  };

  const hasPermission = useCallback(
    (permission: string): boolean => {
      return permissions.includes(permission as PermissionKey);
    },
    [permissions],
  );

  return {
    user,
    session,
    profile,
    permissions,
    hasPermission,
    loading,
    signIn,
    signOut,
    refreshAuth: initAuth,
  };
};
