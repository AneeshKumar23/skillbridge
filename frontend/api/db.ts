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

export const signup = async (data: SignupData) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
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
            // Add address fields if needed
            street_address: '',
            city: '',
            state: '',
            zip_code: '',
            country: '',
        }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Signup failed');
    }

    return response.json();
};

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