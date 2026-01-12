const API_URL = '/api';

async function fetchAPI(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (response.status === 401) {
            // Unauthorized, redirect to login
            window.location.href = '/index.html';
            return null;
        }

        const resData = await response.json();

        if (!response.ok) {
            throw new Error(resData.message || 'Something went wrong');
        }

        return resData;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}
