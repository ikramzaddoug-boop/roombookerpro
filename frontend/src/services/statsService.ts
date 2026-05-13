import API from "@/api";

export interface DashboardStats {
  total_rooms: number;
  available_rooms: number;
  total_equipments: number;
  total_reservations: number;
  total_users: number;
  occupation_rate: number;
  par_salle?: { name: string; count: number }[];
}

export interface ReservationStats {
  total: number;
  confirmees: number;
  en_attente: number;
  annulees: number;
  recent: any[];
}

export const getGlobalStats = async (): Promise<DashboardStats> => {
  const res = await API.get("/stats/");
  return res.data;
};

export const getReservationStats = async (): Promise<ReservationStats> => {
  const res = await API.get("/reservations/statistiques/");
  return res.data;
};

export const getPendingReservations = async (limit = 5) => {
  const res = await API.get(`/reservations/?status=en_attente&limit=${limit}`);
  return res.data.results || res.data;
};

export const getPopularRooms = async (limit = 3) => {
  const res = await API.get(`/rooms/?limit=${limit}`);
  return res.data.results || res.data;
};
