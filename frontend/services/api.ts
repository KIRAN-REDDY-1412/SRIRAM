import { 
  User, EmergencyRequest, VolunteerProfile, Hospital, Shelter, Resource, 
  DashboardStats, AIPriorityResult 
} from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const authToken = token || (typeof window !== 'undefined' ? localStorage.getItem('resqai_token') : null);
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
};

export const api = {
  // Auth APIs
  register: async (data: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Registration failed');
    return json;
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json;
  },

  me: async (): Promise<{ user: User }> => {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch profile');
    return json;
  },

  // Emergency APIs
  createEmergency: async (data: any): Promise<{ emergency: EmergencyRequest; ai_prediction: AIPriorityResult }> => {
    const res = await fetch(`${API_BASE_URL}/emergencies`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Emergency submission failed');
    return json;
  },

  getEmergencies: async (params?: Record<string, string>): Promise<{ emergencies: EmergencyRequest[] }> => {
    const queryStr = params ? '?' + new URLSearchParams(params).toString() : '';
    const res = await fetch(`${API_BASE_URL}/emergencies${queryStr}`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch emergencies');
    return json;
  },

  getEmergencyById: async (id: string): Promise<{ emergency: EmergencyRequest; history: any[] }> => {
    const res = await fetch(`${API_BASE_URL}/emergencies/${id}`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Emergency not found');
    return json;
  },

  updateEmergencyStatus: async (id: string, status: string, notes?: string) => {
    const res = await fetch(`${API_BASE_URL}/emergencies/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update emergency status');
    return json;
  },

  // Volunteer APIs
  getVolunteers: async (): Promise<{ volunteers: VolunteerProfile[] }> => {
    const res = await fetch(`${API_BASE_URL}/volunteers`, {
      headers: getHeaders(),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch volunteers');
    return json;
  },

  updateVolunteerAvailability: async (availability: boolean) => {
    const res = await fetch(`${API_BASE_URL}/volunteers/availability`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ availability }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update availability');
    return json;
  },

  updateVolunteerLocation: async (latitude: number, longitude: number) => {
    const res = await fetch(`${API_BASE_URL}/volunteers/location`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ latitude, longitude }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update location');
    return json;
  },

  // Assignment APIs
  assignVolunteer: async (emergency_id: string, volunteer_id?: string) => {
    const res = await fetch(`${API_BASE_URL}/assignments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ emergency_id, volunteer_id }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Assignment failed');
    return json;
  },

  updateAssignmentStatus: async (assignmentId: string, status: string) => {
    const res = await fetch(`${API_BASE_URL}/assignments/${assignmentId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update assignment');
    return json;
  },

  // Facilities & Resources
  getHospitals: async (): Promise<{ hospitals: Hospital[] }> => {
    const res = await fetch(`${API_BASE_URL}/hospitals`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch hospitals');
    return json;
  },

  getShelters: async (): Promise<{ shelters: Shelter[] }> => {
    const res = await fetch(`${API_BASE_URL}/shelters`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch shelters');
    return json;
  },

  getResources: async (): Promise<{ resources: Resource[] }> => {
    const res = await fetch(`${API_BASE_URL}/resources`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch resources');
    return json;
  },

  updateResource: async (id: string, data: { quantity?: number; status?: string }) => {
    const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update resource');
    return json;
  },

  // Dashboard Stats
  getDashboardStatistics: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE_URL}/dashboard/statistics`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to fetch statistics');
    return json;
  },

  // AI Direct Prediction Proxy
  predictPriority: async (data: any): Promise<AIPriorityResult> => {
    const res = await fetch(`${API_BASE_URL}/ai/predict-priority`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'AI prediction failed');
    return json;
  }
};
