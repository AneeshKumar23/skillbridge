const API_BASE_URL = 'http://localhost:8000';

// ── Types ──────────────────────────────────────────────────────────────────────

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

interface LoginData {
  email: string;
  password: string;
}

interface OnboardingData {
  language: string;
  skills: string[];
  street_address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Resource {
  id: number;
  type: 'youtube' | 'article' | 'certificate';
  topic: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface Roadmap {
  id: number;
  skill: string;
  roadmap: Record<string, unknown>;
  created_at: string;
}

// ── Session helpers ────────────────────────────────────────────────────────────

export const getStoredToken = (): string | null => localStorage.getItem('accessToken');
export const getStoredUserId = (): string | null => localStorage.getItem('userId');

export const storeSession = (userId: string, accessToken: string) => {
  localStorage.setItem('userId', userId);
  localStorage.setItem('accessToken', accessToken);
};

export const clearSession = () => {
  localStorage.removeItem('userId');
  localStorage.removeItem('accessToken');
};

const authHeaders = (): Record<string, string> => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const jsonHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...authHeaders(),
});

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { detail?: string }).detail || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Auth ───────────────────────────────────────────────────────────────────────

export const signup = async (data: SignupData) => {
  const res = await fetch(`${API_BASE_URL}/users/`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone_number: data.phone,
      password: data.password,
      terms_and_conditions: data.agreeToTerms,
      street_address: '', city: '', state: '', zip_code: '', country: '',
      language: '', skills: [],
    }),
  });
  return handleResponse<{ id: string; access_token: string | null }>(res);
};

export const login = async (data: LoginData) => {
  const body = new URLSearchParams();
  body.append('username', data.email);
  body.append('password', data.password);

  const res = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const result = await handleResponse<{ user_id: string; access_token: string }>(res);
  if (result.user_id && result.access_token) storeSession(result.user_id, result.access_token);
  return result;
};

// ── User ───────────────────────────────────────────────────────────────────────

export const getUser = async (userId: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}`, { headers: authHeaders() });
  return handleResponse<Record<string, unknown>>(res);
};

// ── Onboarding ─────────────────────────────────────────────────────────────────

export const updateOnboarding = async (userId: string, data: OnboardingData) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/onboarding`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse<{ msg: string }>(res);
};

// ── Skills ─────────────────────────────────────────────────────────────────────

/** AI suggests skills from a free-text interest — nothing saved yet */
export const suggestSkills = async (userId: string, interest: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/skills/suggest`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ interest }),
  });
  return handleResponse<{ skills: string[] }>(res);
};

/** Persist the confirmed skill list to the user profile */
export const saveSkills = async (userId: string, skills: string[]) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/skills`, {
    method: 'PUT',
    headers: jsonHeaders(),
    body: JSON.stringify({ skills }),
  });
  return handleResponse<{ msg: string; skills: string[] }>(res);
};

// ── Roadmap ────────────────────────────────────────────────────────────────────

/** Generate + save a learning roadmap for a skill */
export const generateRoadmap = async (userId: string, skill: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/roadmap`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ skill }),
  });
  return handleResponse<{ skill: string; roadmap: Record<string, unknown> }>(res);
};

/** Get all saved roadmaps for the user */
export const getRoadmaps = async (userId: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/roadmap`, { headers: authHeaders() });
  return handleResponse<Roadmap[]>(res);
};

/** Get the latest saved roadmap for a specific skill */
export const getRoadmapBySkill = async (userId: string, skill: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/roadmap/${encodeURIComponent(skill)}`,
    { headers: authHeaders() });
  return handleResponse<Roadmap>(res);
};

// ── Chat ───────────────────────────────────────────────────────────────────────

/** Send a message — user turn + AI reply both persisted; returns AI response */
export const sendMessage = async (userId: string, message: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/chat`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ message }),
  });
  return handleResponse<{ response: string }>(res);
};

/** Fetch full conversation history — [{role, content, created_at}] */
export const getChatHistory = async (userId: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/chat`, { headers: authHeaders() });
  return handleResponse<ChatMessage[]>(res);
};

// ── Resources ──────────────────────────────────────────────────────────────────

/** Fetch YouTube videos for a topic + save to DB */
export const getYouTubeResources = async (userId: string, topic: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/resources/youtube`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ topic }),
  });
  return handleResponse<Record<string, unknown>>(res);
};

/** Fetch article links for a topic + save to DB */
export const getArticleResources = async (userId: string, topic: string) => {
  const res = await fetch(`${API_BASE_URL}/users/${userId}/resources/articles`, {
    method: 'POST',
    headers: jsonHeaders(),
    body: JSON.stringify({ topic }),
  });
  return handleResponse<Record<string, unknown>>(res);
};

/** Get all saved resources, optionally filtered by type */
export const getResources = async (userId: string, type?: 'youtube' | 'article' | 'certificate') => {
  const url = type
    ? `${API_BASE_URL}/users/${userId}/resources?type=${type}`
    : `${API_BASE_URL}/users/${userId}/resources`;
  const res = await fetch(url, { headers: authHeaders() });
  return handleResponse<Resource[]>(res);
};

// ── Certificate ────────────────────────────────────────────────────────────────

export const generateCertificate = async (userId: string) => {
  const res = await fetch(`${API_BASE_URL}/certificate/${userId}`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return handleResponse<{ msg: string; url: string }>(res);
};

