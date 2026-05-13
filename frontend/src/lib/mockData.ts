// Mock data for the Salle & Equipment Reservation system
export type Role = "admin" | "professeur" | "etudiant";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Salle {
  id: string;
  name: string;
  capacity: number;
  type: "conference" | "lab" | "classroom";
  features: string[];
  image_url: string;
  is_available: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  category: "multimedia" | "computing" | "furniture";
  total: number;
  available: number;
  image: string;
}

export interface Reservation {
  id: string;
  userId: string;
  salleId?: string;
  equipId?: string;
  salleName?: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
}

export const mockUsers: User[] = [
  { id: "u1", name: "Ahmed Mansouri", email: "a.mansouri@emsi.ma", role: "admin" },
  { id: "u2", name: "Dr. Sarah Alami", email: "s.alami@emsi.ma", role: "professeur" },
  { id: "u3", name: "Yassine Berrada", email: "y.berrada@emsi.ma", role: "etudiant" },
];

export const mockSalles: Salle[] = [
  { id: "s1", name: "Salle de Conférence A", capacity: 50, type: "conference", features: ["Projecteur", "Visioconférence", "Climatisation"], image_url: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800", is_available: true },
  { id: "s2", name: "Lab Informatique 1", capacity: 30, type: "lab", features: ["PCs", "Tableau Blanc"], image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", is_available: false },
  { id: "s3", name: "Amphi 2", capacity: 120, type: "classroom", features: ["Sonorisation", "Projecteur"], image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800", is_available: true },
];

export const mockEquipment: Equipment[] = [
  { id: "e1", name: "Vidéoprojecteur Epson", category: "multimedia", total: 10, available: 4, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" },
  { id: "e2", name: "PC Portable Dell", category: "computing", total: 25, available: 12, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" },
  { id: "e3", name: "Micro Cravate Sans Fil", category: "multimedia", total: 8, available: 8, image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800" },
];

export const mockReservations: Reservation[] = [
  { id: "r1", userId: "u2", salleId: "s1", salleName: "Salle de Conférence A", date: "2024-05-15", startTime: "09:00", endTime: "11:00", purpose: "Réunion Département", status: "approved" },
  { id: "r2", userId: "u3", salleId: "s3", salleName: "Amphi 2", date: "2024-05-16", startTime: "14:00", endTime: "16:00", purpose: "Révision Groupe", status: "pending" },
];

export const reservationsTrend = [
  { month: "Jan", reservations: 45 },
  { month: "Fev", reservations: 52 },
  { month: "Mar", reservations: 48 },
  { month: "Avr", reservations: 70 },
  { month: "Mai", reservations: 85 },
  { month: "Juin", reservations: 60 },
];

export const occupancyByDay = [
  { day: "Lun", rate: 65 },
  { day: "Mar", rate: 80 },
  { day: "Mer", rate: 75 },
  { day: "Jeu", rate: 90 },
  { day: "Ven", rate: 55 },
  { day: "Sam", rate: 20 },
];
