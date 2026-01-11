import api from '@/config/api';
import { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';

// User ma’lumotlari tipi
export interface Profile {
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
}
export interface User {
  id: string;
  profile: Profile;
  email: string;
  followers: any[];
  following: any[];
  posts: any[];
}

interface UseCheckAuthResult {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetchUser: () => Promise<void>;
}

export const useCheckAuth = (): UseCheckAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<User>('/profile/me');
      setUser(response.data);
    } catch (err) {
      const axiosError = err as AxiosError;
      setError(axiosError.response?.data as string || axiosError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  

  // refetchUser ni pull-to-refresh uchun qaytaramiz
  const refetchUser = async () => {
    await fetchUser();
  };

  return { user, loading, error, refetchUser };
};
