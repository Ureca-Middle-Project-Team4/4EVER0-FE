import { apiWithToken } from '@/lib/api/apiconfig';
import { AttendanceTodayResponse, MonthlyAttendanceResponse } from '../../types/attendance';

export const getTodayAttendance = async (): Promise<AttendanceTodayResponse> => {
  const res = await apiWithToken.get('/attendances/today');
  console.log('📦 getTodayAttendance 응답:', res.data); // ✅ 여기!
  return res.data.data;
};

export const postTodayAttendance = async (): Promise<AttendanceTodayResponse> => {
  const res = await apiWithToken.post('/attendances');
  return res.data;
};

export const getMonthlyAttendance = async (
  year: number,
  month: number,
): Promise<MonthlyAttendanceResponse> => {
  const res = await apiWithToken.get(`/attendances/month?year=${year}&month=${month}`);
  return res.data.data;
};
