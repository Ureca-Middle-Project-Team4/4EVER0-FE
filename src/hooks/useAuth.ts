import { useAuthStore } from '@/stores/useAuthStore';

export const useAuth = () => {
  const { isLoggedIn, userId, authId } = useAuthStore();

  return {
    isLoggedIn,
    userId,
    authId,
  };
};
