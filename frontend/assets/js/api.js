/**
 * API Service for the Movie Recommendation System
 * Handles all API calls to the backend
 */

class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8000'; // Change this to your backend URL
        this.tmdbImageBaseUrl = 'https://image.tmdb.org/t/p/';
    }

    // Get the stored token
    getToken() {
        return localStorage.getItem('token');
    }

    // Generic API call method with authentication
    async apiCall(endpoint, method = 'GET', data = null) {
        const headers = {
            'Content-Type': 'application/json'
        };

        const token = this.getToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            method,
            headers
        };

        if (data && (method === 'POST' || method === 'PUT')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Something went wrong');
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Authentication methods
    async register(username, email, password) {
        return this.apiCall('/auth/register', 'POST', { username, email, password });
    }

    async login(email, password) {
        // Using FormData for login as FastAPI expects this format
        const formData = new FormData();
        formData.append('username', email); // FastAPI OAuth2 uses 'username' field
        formData.append('password', password);

        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Login failed');
        }
        
        return await response.json();
    }

    async getCurrentUser() {
        return this.apiCall('/auth/me');
    }

    // Movie methods
    async getPopularMovies(page = 1) {
        return this.apiCall(`/movies/popular?page=${page}`);
    }

    async searchMovies(query, page = 1) {
        return this.apiCall(`/movies/search?query=${encodeURIComponent(query)}&page=${page}`);
    }

    async getMovieDetails(movieId) {
        return this.apiCall(`/movies/${movieId}`);
    }

    async rateMovie(movieId, rating) {
        return this.apiCall(`/movies/${movieId}/rate?rating=${rating}`, 'POST');
    }

    // Genre methods
    async getGenres() {
        return this.apiCall('/movies/genres');
    }

    async getMoviesByGenre(genreId, page = 1) {
        return this.apiCall(`/recommendations/by-genre/${genreId}?page=${page}`);
    }

    // Recommendation methods
    async getPersonalizedRecommendations(limit = 10) {
        return this.apiCall(`/recommendations/personalized?limit=${limit}`);
    }

    async getSimilarMovies(movieId) {
        return this.apiCall(`/recommendations/similar/${movieId}`);
    }

    async updatePreferences(genreIds) {
        return this.apiCall('/recommendations/update-preferences', 'POST', genreIds);
    }

    // Helper methods
    getImageUrl(path, size = 'w500') {
        if (!path) return 'assets/images/no-poster.png';
        return `${this.tmdbImageBaseUrl}${size}${path}`;
    }
}

// Create a singleton instance
const apiService = new ApiService();