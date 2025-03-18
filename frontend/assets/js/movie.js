/**
 * Movie details page JavaScript
 * Handles movie details display and user interactions
 */

class MoviePage {
    constructor() {
        this.movieId = new URLSearchParams(window.location.search).get('id');
        this.movieDetailsContainer = document.getElementById('movie-details-container');
        this.similarMoviesContainer = document.getElementById('similar-movies');
        
        // Add authentication state check
        this.isAuthenticated = !!localStorage.getItem('token');
        
        if (!this.movieId) {
            console.error('No movie ID provided');
            this.showError('Invalid movie ID');
            return;
        }

        console.log('MoviePage initialized with ID:', this.movieId);
        if (this.movieId) {
            this.init();
            this.addLoadingStates();
        }
    }

    async init() {
        try {
            await this.loadMovieDetails();
        } catch (error) {
            console.error('Error initializing movie page:', error);
            this.showError('Failed to load movie details');
        }
    }

    async loadMovieDetails() {
        try {
            this.showLoading();
            
            const movie = await apiService.getMovieDetails(this.movieId);
            this.movie = movie;
            
            this.renderMovieDetails(movie);
            
        } catch (error) {
            console.error('Error loading movie details:', error);
            this.showError('Failed to load movie details. Please try again later.');
        } finally {
            this.hideLoading();
        }
        
        // Load similar movies separately
        await this.loadSimilarMovies();
    }

    async loadSimilarMovies() {
        try {
            if (!this.similarMoviesContainer) return;
            
            const response = await apiService.getSimilarMovies(this.movieId);
            
            // Handle empty results
            if (!response || !response.length) {
                this.similarMoviesContainer.innerHTML = `
                    <div class="container">
                        <div class="alert alert-info">
                            No similar movies found.
                        </div>
                    </div>
                `;
                return;
            }
            
            this.renderSimilarMovies(response);
            
        } catch (error) {
            console.error('Error loading similar movies:', error);
            this.similarMoviesContainer.innerHTML = `
                <div class="container">
                    <div class="alert alert-danger">
                        <i class="fas fa-exclamation-circle me-2"></i>
                        Failed to load similar movies. Please try again later.
                    </div>
                </div>
            `;
        }
    }

    renderMovieDetails(movie) {
        if (!this.movieDetailsContainer || !movie) return;

        const posterUrl = movie.poster_path 
            ? apiService.getImageUrl(movie.poster_path)
            : '../assets/images/placeholder.jpg';

        this.movieDetailsContainer.innerHTML = `
            <div class="container py-5">
                <div class="row">
                    <div class="col-md-4">
                        <img src="${posterUrl}" 
                             class="img-fluid rounded movie-poster-detail" 
                             alt="${movie.title}"
                             onerror="this.onerror=null; this.src='../assets/images/placeholder.jpg';">
                    </div>
                    <div class="col-md-8">
                        <h2>${movie.title}</h2>
                        <p class="text-muted">
                            ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'} | 
                            ${movie.runtime ? `${movie.runtime} min` : 'N/A'} |
                            ${movie.vote_average ? `${movie.vote_average.toFixed(1)}/10` : 'N/A'}
                        </p>
                        <p>${movie.overview || 'No overview available.'}</p>
                        <div class="genres mb-3">
                            ${movie.genres?.map(genre => 
                                `<span class="badge bg-primary me-2">${genre.name}</span>`
                            ).join('') || ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderSimilarMovies(movies) {
        if (!this.similarMoviesContainer || !movies?.length) return;

        this.similarMoviesContainer.innerHTML = `
            <div class="container">
                <h3 class="mb-4">Similar Movies You Might Like</h3>
                <div class="row g-4">
                    ${movies.map(movie => `
                        <div class="col-md-3 col-sm-6">
                            <div class="card h-100 movie-card">
                                <img src="${apiService.getImageUrl(movie.poster_path)}" 
                                     class="card-img-top" 
                                     alt="${movie.title}"
                                     onerror="this.onerror=null; this.src='../assets/images/placeholder.jpg';">
                                <div class="card-body">
                                    <h5 class="card-title text-truncate" title="${movie.title}">${movie.title}</h5>
                                    <p class="card-text">
                                        <small class="text-muted">
                                            ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                                        </small>
                                        <span class="float-end">
                                            <i class="fas fa-star text-warning"></i> 
                                            ${movie.vote_average?.toFixed(1) || 'N/A'}
                                        </span>
                                    </p>
                                    <a href="movie.html?id=${movie.tmdb_id}" class="btn btn-primary w-100">View Details</a>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    showError(message) {
        const container = this.movieDetailsContainer || document.body;
        container.innerHTML = `
            <div class="container py-5">
                <div class="alert alert-danger">
                    ${message}
                </div>
            </div>
        `;
    }

    showToast(message, type = 'info') {
        const toastContainer = document.querySelector('.toast-container') 
            || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" 
                        data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);
        new bootstrap.Toast(toast).show();
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        document.body.appendChild(container);
        return container;
    }

    addLoadingStates() {
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(button => {
            button.addEventListener('click', () => {
                button.classList.add('disabled');
                button.innerHTML = `
                    <span class="spinner-border spinner-border-sm" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </span>
                    Loading...
                `;
            });
        });
    }

    showLoading() {
        // Add loading state to the movie details container
        if (this.movieDetailsContainer) {
            this.movieDetailsContainer.innerHTML = `
                <div class="container py-5 text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-3">Loading movie details...</p>
                </div>
            `;
        }
        
        // Add loading state to similar movies container
        if (this.similarMoviesContainer) {
            this.similarMoviesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `;
        }
    }

    hideLoading() {
        // Loading is hidden when content is rendered
        // Nothing to do here as the containers are populated with content
    }

    // Add a method to check and refresh authentication status
    checkAuthStatus() {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Verify token is still valid (you might want to add a proper token verification)
                this.isAuthenticated = true;
                return true;
            } catch (error) {
                console.error('Invalid token:', error);
                localStorage.removeItem('token');
                this.isAuthenticated = false;
                return false;
            }
        }
        this.isAuthenticated = false;
        return false;
    }

    // Update event listeners at the bottom of the file
    initializeEventListeners() {
        // Listen for authentication changes
        window.addEventListener('storage', (event) => {
            if (event.key === 'token') {
                const wasAuthenticated = this.isAuthenticated;
                this.checkAuthStatus();
                
                // Only reload content if auth state actually changed
                if (wasAuthenticated !== this.isAuthenticated) {
                    this.loadSimilarMovies();
                    
                    // Update auth-required elements visibility
                    const authElements = document.querySelectorAll('.auth-required');
                    authElements.forEach(el => {
                        el.style.display = this.isAuthenticated ? '' : 'none';
                    });
                }
            }
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    const moviePage = new MoviePage();
    moviePage.initializeEventListeners();
});