import { apiWithToken } from '@/lib/api/apiconfig';

export const fetchCurrentPlan = async () => {
  const res = await apiWithToken.get('/user/plans');
  return res.data.data;
};
