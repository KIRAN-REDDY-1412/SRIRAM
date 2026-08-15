export type UserRole = 'victim' | 'volunteer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  skills?: string[];
  availability?: boolean;
  latitude?: number;
  longitude?: number;
  created_at?: string;
}

export type EmergencyPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type EmergencyStatus = 'Submitted' | 'Assigned' | 'En Route' | 'Arrived' | 'Resolved' | 'Cancelled';

export interface EmergencyRequest {
  id: string;
  user_id?: string;
  disaster_type: string;
  description: string;
  latitude: number;
  longitude: number;
  people_count: number;
  injured_count: number;
  trapped: boolean;
  requested_help: string;
  priority: EmergencyPriority;
  priority_score: number;
  priority_reason: string;
  status: EmergencyStatus;
  created_at: string;
  updated_at: string;
  victim_name?: string;
  victim_phone?: string;
  assignment_id?: string;
  assignment_status?: string;
  volunteer_id?: string;
  volunteer_name?: string;
  volunteer_phone?: string;
}

export interface VolunteerProfile {
  id: string;
  user_id: string;
  name?: string;
  phone?: string;
  skills: string[];
  availability: boolean;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export interface Hospital {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  available_beds: number;
  emergency_capacity: number;
  phone: string;
  created_at?: string;
}

export interface Shelter {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  capacity: number;
  occupied: number;
  resources: string;
  created_at?: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'Food' | 'Water' | 'Medicine' | 'Blankets' | 'Equipment' | string;
  quantity: number;
  location: string;
  status: 'Available' | 'Low Stock' | 'Depleted' | string;
  created_at?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export interface AIPriorityResult {
  priority: EmergencyPriority;
  score: number;
  reason: string;
}

export interface DashboardStats {
  statistics: {
    totalEmergencies: number;
    criticalEmergencies: number;
    activeVolunteers: number;
    activeMissions: number;
    availableResources: number;
    resolvedToday: number;
  };
  charts: {
    priorityDistribution: { priority: string; count: string }[];
    disasterTypes: { disaster_type: string; count: string }[];
    statusBreakdown: { status: string; count: string }[];
  };
}
