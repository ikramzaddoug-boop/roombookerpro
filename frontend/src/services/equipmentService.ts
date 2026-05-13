import API from "../api";

export interface Equipment {
  id: number;
  name: string;
  description: string;
  quantity: number;
  is_available: boolean;
  photo_url: string;
}

export const getEquipments = async (params?: any): Promise<Equipment[]> => {
  const res = await API.get("/equipments/", { params });
  return res.data.results || res.data;
};

export const getEquipmentById = async (id: number): Promise<Equipment> => {
  const res = await API.get(`/equipments/${id}/`);
  return res.data;
};

export const createEquipment = async (data: Partial<Equipment>): Promise<Equipment> => {
  const res = await API.post("/equipments/", data);
  return res.data;
};

export const updateEquipment = async (id: number, data: Partial<Equipment>): Promise<Equipment> => {
  const res = await API.patch(`/equipments/${id}/`, data);
  return res.data;
};

export const deleteEquipment = async (id: number): Promise<void> => {
  await API.delete(`/equipments/${id}/`);
};
