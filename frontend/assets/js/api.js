/**
 * API Service for the Movie Recommendation System
 * Handles all API calls to the backend
 */

class ApiService {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
        this.imageBaseUrl = 'https://image.tmdb.org/t/p/w500';
    }

    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    // Generic API call method with error handling
    async apiCall(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...this.getAuthHeaders()
        };

        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                },
                mode: 'cors'  // Remove credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Helper method for TMDB image URLs
    getImageUrl(path) {
        if (!path) return '../assets/images/placeholder.jpg';
        return `${this.imageBaseUrl}${path}`;
    }

    // Core movie methods
    async getPopularMovies(page = 1) {
        return this.apiCall(`/movies/popular?page=${page}`);
    }

    async getGenres() {
        return this.apiCall('/movies/genres');
    }

    async getMovieDetails(movieId) {
        if (!movieId) {
            console.error('Movie ID is required');
            throw new Error('Movie ID is required');
        }
        return this.apiCall(`/movies/${movieId}`);
    }

    async getSimilarMovies(movieId, limit = 8) {
        if (!movieId) {
            console.error('Movie ID is required');
            return { movies: [] };
        }
        
        try {
            console.log(`Getting similar movies for ID: ${movieId}, limit: ${limit}`);
            const response = await this.apiCall(`/recommendations/similar/${movieId}?limit=${limit}`);
            console.log('Similar movies response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching similar movies:', error);
            return { movies: [] };
        }
    }

    async login(email, password) {
        // FastAPI OAuth expects x-www-form-urlencoded format
        const formData = new URLSearchParams();
        formData.append('username', email); // FastAPI OAuth uses username field
        formData.append('password', password);

        try {
            const response = await this.apiCall('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (response.access_token) {
                localStorage.setItem('token', response.access_token);
            }

            return response;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async register(username, email, password) {
        return this.apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username,
                email,
                password
            })
        });
    }

    async getCurrentUser() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        return this.apiCall('/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    async searchMovies(query, page = 1) {
        try {
            console.log(`Searching movies with query: ${query}, page: ${page}`);
            
            if (!query?.trim()) {
                return {
                    page: 1,
                    results: [],
                    total_pages: 0,
                    total_results: 0
                };
            }
            
            const encodedQuery = encodeURIComponent(query.trim());
            const response = await this.apiCall(`/movies/search?query=${encodedQuery}&page=${page}`);
            
            console.log('Search response:', response);
            return response;
            
        } catch (error) {
            console.error('Error searching movies:', error);
            return {
                page: 1,
                results: [],
                total_pages: 0,
                total_results: 0
            };
        }
    }

    async getMoviesByGenre(genreId) {
        try {
            const response = await this.apiCall(`/movies/genre/${genreId}`);
            console.log('Genre movies response:', response);
            return response;
        } catch (error) {
            console.error('Error fetching genre movies:', error);
            throw error;
        }
    }
    
    async uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append('avatar', file);

        return this.apiCall('/users/avatar', {
            method: 'POST',
            headers: {
                // Remove Content-Type to let browser set it with boundary
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
    }

    async updateProfile(formData) {
        const token = localStorage.getItem('token');
        
        console.log('Updating profile with data:', Object.fromEntries(formData));
        
        try {
            const response = await this.apiCall('/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            console.log('Profile update response:', response);
            
            if (!response) {
                throw new Error('No response from server');
            }
            
            return response;
        } catch (error) {
            console.error('Error in updateProfile:', error);
            throw error;
        }
    }

    async getAvatars() {
        return this.apiCall('/users/avatars');
    }

    async getPersonalizedRecommendations(limit = 8) {
        try {
            const response = await this.apiCall(`/recommendations/personalized?limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching personalized recommendations:', error);
            throw error;
        }
    }

    async getRecommendationsByGenre(genreId, limit = 8) {
        try {
            const response = await this.apiCall(`/recommendations/by-genre/${genreId}?limit=${limit}`);
            return response;
        } catch (error) {
            console.error('Error fetching genre recommendations:', error);
            throw error;
        }
    }

    async toggleWatchlist(movieId) {
        try {
            const response = await this.apiCall(`/users/watch-list/toggle`, {  // Changed from /users/watchlist
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ movie_id: movieId })
            });
            return response;
        } catch (error) {
            console.error('Error toggling watchlist:', error);
            throw error;
        }
    }

    async getWatchlist() {
        try {
            const response = await this.apiCall(`/users/watch-list`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.watchlist || [];
        } catch (error) {
            console.error('Error getting watchlist:', error);
            return []; // Return empty array instead of throwing
        }
    }
}

// Create a singleton instance
const apiService = new ApiService();