import API from "../api";

export interface Room {
  id: number;
  name: string;
  description: string;
  capacity: number;
  room_type: string;
  location: string;
  floor: number;
  is_available: boolean;
  image_url: string;
  created_at: string;
}

export const getRooms = async (params?: any): Promise<Room[]> => {
  const res = await API.get("/rooms/", { params });
  return res.data.results || res.data;
};

export const getRoomById = async (id: number): Promise<Room> => {
  const res = await API.get(`/rooms/${id}/`);
  return res.data;
};

export const createRoom = async (data: Partial<Room>): Promise<Room> => {
  const res = await API.post("/rooms/", data);
  return res.data;
};

export const updateRoom = async (id: number, data: Partial<Room>): Promise<Room> => {
  const res = await API.patch(`/rooms/${id}/`, data);
  return res.data;
};

export const deleteRoom = async (id: number): Promise<void> => {
  await API.delete(`/rooms/${id}/`);
};

export const getRoomAvailability = async (id: number, date: string) => {
  const res = await API.get(`/rooms/${id}/availability/`, { params: { date } });
  return res.data;
};

export const getSmartRecommendations = async (params: any) => {
  const res = await API.get("/rooms/smart_recommendations/", { params });
  return res.data;
};
