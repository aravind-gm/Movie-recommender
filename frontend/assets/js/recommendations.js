/**
 * Recommendations page JavaScript
 * Handles personalized recommendations display
 */

class RecommendationsPage {
    constructor() {
        // DOM elements
        this.personalRecommendationsContainer = document.getElementById('personal-recommendations');
        this.recentBasedRecommendationsContainer = document.getElementById('recent-based-recommendations');
        this.trendingMoviesContainer = document.getElementById('trending-movies');
        this.loginBtnMain = document.getElementById('login-btn-main');
        this.registerBtnMain = document.getElementById('register-btn-main');
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            this.loadPersonalizedRecommendations();
        }
        
        // Load trending movies (always visible)
        this.loadTrendingMovies();
    }
    
    bindEvents() {
        // Login button click (in the main content)
        if (this.loginBtnMain) {
            this.loginBtnMain.addEventListener('click', () => {
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                loginModal.show();
            });
        }
        
        // Register button click (in the main content)
        if (this.registerBtnMain) {
            this.registerBtnMain.addEventListener('click', () => {
                const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
                registerModal.show();
            });
        }
    }
    
    async loadPersonalizedRecommendations() {
        if (!this.personalRecommendationsContainer) return;
        
        try {
            const recommendations = await apiService.getPersonalizedRecommendations(8);
            
            // Clear loading spinner
            this.personalRecommendationsContainer.innerHTML = '';
            
            if (recommendations.length === 0) {
                this.personalRecommendationsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            No personalized recommendations yet. Watch more movies or update your preferences.
                        </div>
                        <a href="preferences.html" class="btn btn-primary mt-3">Set Your Preferences</a>
                    </div>
                `;
                return;
            }
            
            // Display recommendations
            recommendations.forEach(movie => {
                this.personalRecommendationsContainer.appendChild(this.createMovieCard(movie));
            });
            
            // Load similar movies based on watch history
            this.loadSimilarRecommendations(recommendations[0].tmdb_id);
            
        } catch (error) {
            console.error('Error loading personal recommendations:', error);
            this.personalRecommendationsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        Failed to load personalized recommendations. Please try again later.
                    </div>
                </div>
            `;
        }
    }
    
    async loadSimilarRecommendations(movieId) {
        if (!this.recentBasedRecommendationsContainer) return;
        
        try {
            const similarMovies = await apiService.getSimilarMovies(movieId);
            
            // Clear loading spinner
            this.recentBasedRecommendationsContainer.innerHTML = '';
            
            if (similarMovies.length === 0) {
                this.recentBasedRecommendationsContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">No similar movies found.</div>
                    </div>
                `;
                return;
            }
            
            // Display similar movies
            similarMovies.slice(0, 8).forEach(movie => {
                this.recentBasedRecommendationsContainer.appendChild(this.createMovieCard(movie));
            });
            
        } catch (error) {
            console.error('Error loading similar recommendations:', error);
            this.recentBasedRecommendationsContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        Failed to load similar movie recommendations. Please try again later.
                    </div>
                </div>
            `;
        }
    }
    
    async loadTrendingMovies() {
        if (!this.trendingMoviesContainer) return;
        
        try {
            const movies = await apiService.getPopularMovies();
            
            // Clear loading spinner
            this.trendingMoviesContainer.innerHTML = '';
            
            // Display movies
            movies.slice(0, 8).forEach(movie => {
                this.trendingMoviesContainer.appendChild(this.createMovieCard(movie));
            });
            
        } catch (error) {
            console.error('Error loading trending movies:', error);
            this.trendingMoviesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        Failed to load trending movies. Please try again later.
                    </div>
                </div>
            `;
        }
    }
    
    createMovieCard(movie) {
        const movieCol = document.createElement('div');
        movieCol.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';
        
        // Format release date
        const releaseDate = movie.release_date ? new Date(movie.release_date).toLocaleDateString() : 'Unknown';
        
        // Format genres (if available)
        let genresHtml = '';
        if (movie.genres && movie.genres.length > 0) {
            genresHtml = movie.genres.map(genre => genre.name).join(', ');
        }
        
        movieCol.innerHTML = `
            <div class="movie-card">
                <div class="position-relative">
                    <img src="${apiService.getImageUrl(movie.poster_path)}" class="movie-poster" alt="${movie.title}">
                    <span class="movie-rating">${movie.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
                <div class="movie-card-body">
                    <h5 class="movie-title">${movie.title}</h5>
                    <div class="movie-genres">${genresHtml || releaseDate}</div>
                    <p class="movie-overview">${movie.overview || 'No description available.'}</p>
                    <div class="movie-card-footer">
                        <small class="text-muted">${releaseDate}</small>
                        <a href="movie.html?id=${movie.tmdb_id || movie.id}" class="btn btn-sm btn-primary">Details</a>
                    </div>
                </div>
            </div>
        `;
        
        return movieCol;
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    window.recommendationsPage = new RecommendationsPage();
});