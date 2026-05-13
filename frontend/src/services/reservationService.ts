import API from "../api";

/**
 * Service de Réservation - Version 2.4 (V2 Forced)
 * Renommé pour contourner le cache SSR de TanStack Start
 */

export async function getRoomReservations(params?: any) {
  const { data } = await API.get("/reservations/rooms/", { params });
  return (data.results || data).map((r: any) => ({ ...r, res_type: 'room' }));
}

export async function createRoomReservation(payload: any) {
  const { data } = await API.post("/reservations/rooms/", payload);
  return data;
}

export async function getEquipmentReservations(params?: any) {
  const { data } = await API.get("/reservations/equipments/", { params });
  return (data.results || data).map((r: any) => ({ ...r, res_type: 'equipment' }));
}

export async function createEquipmentReservation(payload: any) {
  const { data } = await API.post("/reservations/equipments/", payload);
  return data;
}

export async function cancelReservation(id: number, type: 'room' | 'equipment') {
  const endpoint = type === 'room' ? `/reservations/rooms/${id}/` : `/reservations/equipments/${id}/`;
  const { data } = await API.delete(endpoint);
  return data;
}

// Fonction de confirmation explicite
export async function confirmReservation(id: number, type: 'room' | 'equipment') {
  const endpoint = type === 'room' ? `/reservations/rooms/${id}/` : `/reservations/equipments/${id}/`;
  const { data } = await API.patch(endpoint, { status: 'confirmee' });
  return data;
}

// Fonction de rejet explicite
export async function rejectReservation(id: number, type: 'room' | 'equipment') {
  const endpoint = type === 'room' ? `/reservations/rooms/${id}/` : `/reservations/equipments/${id}/`;
  const { data } = await API.patch(endpoint, { status: 'refusee' });
  return data;
}

export async function checkRoomAIConflict(payload: any) {
  const { data } = await API.post("/reservations/rooms/ai_analyse/", payload);
  return data;
}

export async function checkEquipmentAIConflict(payload: any) {
  const { data } = await API.post("/reservations/equipments/ai_analyse/", payload);
  return data;
}

export async function getReservations() {
  const [rooms, equips] = await Promise.all([getRoomReservations(), getEquipmentReservations()]);
  return [...rooms, ...equips].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export const getMyReservations = getReservations;
export const getAllReservations = getReservations;
