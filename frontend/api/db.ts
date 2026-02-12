const API_BASE_URL = 'http://localhost:8000'; // Your FastAPI server URL

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

// --- SIGNUP ---
export const signup = async (data: SignupData) => {
  const response = await fetch(`${API_BASE_URL}/users/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone_number: data.phone,
      password: data.password,
      terms_and_conditions: data.agreeToTerms,
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      language: '',
      skills: [],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Signup failed');
  }

  return response.json();
};

// --- LOGIN ---
export const login = async (data: LoginData) => {
  const formData = new URLSearchParams();
  formData.append('username', data.email);
  formData.append('password', data.password);

  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Login failed');
  }

  return response.json();
};

// --- ONBOARDING UPDATE ---
export const updateOnboarding = async (userId: string, data: OnboardingData) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/onboarding`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update onboarding info');
  }

  return response.json();
};

export const generateCurriculum = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/curriculum/${userId}/generate`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to generate curriculum');
  }

  return response.json();
};


export const generateContentForSkill = async (userId: string, skill: string) => {
  const response = await fetch(`${API_BASE_URL}/curriculum/${userId}/${encodeURIComponent(skill)}/content`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to generate content for skill');
  }

  return response.json();
};


export const getCurriculum = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/curriculum/${userId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch curriculum');
  }

  return response.json();
};



export const markSubtopicComplete = async (
  userId: string,
  skill: string,
  topic: string,
  subtopic: string
) => {
  const response = await fetch(
    `${API_BASE_URL}/curriculum/${userId}/${encodeURIComponent(skill)}/${encodeURIComponent(topic)}/${encodeURIComponent(subtopic)}/progress`,
    {
      method: 'PATCH',
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to update subtopic progress');
  }

  return response.json();
};

// --- USER ---
export const getUser = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch user');
  }

  return response.json();
};

// --- PROMPTS ---
export const getPrompts = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/prompts/${userId}`, {
    method: 'GET',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to fetch prompts');
  }

  return response.json();
};

export const addPrompt = async (userId: string, prompt: string) => {
  // Backend expects prompt as query parameter
  const response = await fetch(`${API_BASE_URL}/prompts/${userId}?prompt=${encodeURIComponent(prompt)}`, {
    method: 'POST',
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to add prompt');
  }

  return response.json();
};

// --- AI / CHAT ---
export const sendPromptToAI = async (userId: string, prompt: string) => {
  // Use dedicated chat endpoint
  const response = await fetch(`${API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to get AI response');
  }

  return response.json();
};

export const suggestSkills = async (prompt: string) => {
  const response = await fetch(`${API_BASE_URL}/api/suggest_skills`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to suggest skills');
  }

  return response.json();
};

export const generateLearningPath = async (prompt: string) => {
  const response = await fetch(`${API_BASE_URL}/api/generate_content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to generate learning path');
  }

  return response.json();
};
