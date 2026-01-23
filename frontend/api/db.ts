const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'; // Your FastAPI server URL

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
    const response = await fetch(`${API_BASE_URL}/prompts/${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }), // or just JSON.stringify(prompt) if backend expects raw string
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to add prompt');
    }
  
    return response.json();
  };
  


export const sendPromptToAI = async (userId: string, prompt: string) => {
    const response = await fetch(`${API_BASE_URL}/chat/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to get AI response');
    }
  
    return response.json(); // { response: "..." }
  };