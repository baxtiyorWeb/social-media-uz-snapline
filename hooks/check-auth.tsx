import api from '@/config/api';
import { AxiosError } from 'axios';
import { useEffect, useState } from 'react';

// User ma’lumotlari tipi
export interface Profile {
  firstName: string;
  lastName: string;
  username: string;
  avatar?: string;
}
export interface User {
  id: string;
  profile: Profile,
  email: string;
  followers: any[];
  following: any[];
  posts: any[];

  // kerak bo‘lsa qo‘shimcha fieldlar
}

interface UseCheckAuthResult {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useCheckAuth = (): UseCheckAuthResult => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get<User>('/profile/me',);
        console.log(response.data);

        setUser(response.data);
      } catch (err) {
        const axiosError = err as AxiosError;
        console.log(axiosError)
        setError(axiosError.response?.data as string || axiosError.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading, error };
};
