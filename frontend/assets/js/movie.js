/**
 * Movie details page JavaScript
 * Handles movie details display and user interactions
 */

class MoviePage {
    constructor() {
        // DOM elements
        this.movieDetailsContainer = document.getElementById('movie-details-container');
        this.similarMoviesContainer = document.getElementById('similar-movies');
        this.addToWatchlistBtn = document.getElementById('add-to-watchlist');
        this.rateModal = new bootstrap.Modal(document.getElementById('rateModal'));
        this.rateMovieTitleElement = document.getElementById('rate-movie-title');
        this.submitRatingBtn = document.getElementById('submit-rating');
        
        // Movie data
        this.movieId = this.getMovieIdFromUrl();
        this.movieData = null;
        this.selectedRating = 0;
        
        this.init();
    }
    
    getMovieIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    async init() {
        if (!this.movieId) {
            this.showError('Movie ID is missing. Please go back and try again.');
            return;
        }
        
        await this.loadMovieDetails();
        this.loadSimilarMovies();
        this.bindEvents();
    }
    
    bindEvents() {
        // Add to watchlist button
        if (this.addToWatchlistBtn) {
            this.addToWatchlistBtn.addEventListener('click', () => {
                this.toggleWatchlist();
            });
        }
        
        // Rating stars
        const ratingStars = document.querySelectorAll('.rating-star');
        ratingStars.forEach(star => {
            star.addEventListener('click', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.selectRating(rating);
            });
            
            star.addEventListener('mouseover', (e) => {
                const rating = parseInt(e.target.dataset.rating);
                this.highlightStars(rating);
            });
            
            star.addEventListener('mouseout', () => {
                this.highlightStars(this.selectedRating);
            });
        });
        
        // Submit rating button
        if (this.submitRatingBtn) {
            this.submitRatingBtn.addEventListener('click', () => {
                this.submitRating();
            });
        }
    }
    
    async loadMovieDetails() {
        try {
            this.movieData = await apiService.getMovieDetails(this.movieId);
            this.renderMovieDetails();
            
            // Show watchlist button for logged-in users
            const token = localStorage.getItem('token');
            if (token && this.addToWatchlistBtn) {
                this.addToWatchlistBtn.classList.remove('d-none');
            }
        } catch (error) {
            console.error('Error loading movie details:', error);
            this.showError('Failed to load movie details. Please try again later.');
        }
    }
    
    async loadSimilarMovies() {
        if (!this.similarMoviesContainer || !this.movieId) return;
        
        try {
            const similarMovies = await apiService.getSimilarMovies(this.movieId);
            
            // Clear loading spinner
            this.similarMoviesContainer.innerHTML = '';
            
            if (similarMovies.length === 0) {
                this.similarMoviesContainer.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">No similar movies found.</div>
                    </div>
                `;
                return;
            }
            
            // Display similar movies
            similarMovies.slice(0, 8).forEach(movie => {
                this.similarMoviesContainer.appendChild(this.createMovieCard(movie));
            });
            
        } catch (error) {
            console.error('Error loading similar movies:', error);
            this.similarMoviesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        Failed to load similar movies. Please try again later.
                    </div>
                </div>
            `;
        }
    }
    
    renderMovieDetails() {
        if (!this.movieDetailsContainer || !this.movieData) return;
        
        // Update page title
        document.title = `${this.movieData.title} - MovieRecommender`;
        
        // Format release date
        const releaseDate = this.movieData.release_date ? 
            new Date(this.movieData.release_date).toLocaleDateString() : 'Unknown';
        
        // Format genres
        const genres = this.movieData.genres && this.movieData.genres.length > 0 ? 
            this.movieData.genres.map(genre => genre.name).join(', ') : 'Not specified';
        
        // Create backdrop URL (use larger image)
        const backdropUrl = this.movieData.backdrop_path ? 
            apiService.getImageUrl(this.movieData.backdrop_path, 'original') : 
            apiService.getImageUrl(this.movieData.poster_path, 'original');
        
        // Create HTML structure
        const detailsHtml = `
            <div class="movie-backdrop" style="background-image: url('${backdropUrl}')">
                <div class="movie-backdrop-overlay"></div>
                <div class="movie-details-content">
                    <div class="container">
                        <div class="row align-items-end">
                            <div class="col-md-3 mb-3 mb-md-0">
                                <img src="${apiService.getImageUrl(this.movieData.poster_path)}" alt="${this.movieData.title}" class="img-fluid rounded shadow">
                            </div>
                            <div class="col-md-9">
                                <h1 class="display-4 fw-bold">${this.movieData.title}</h1>
                                <p class="lead mb-1">${releaseDate} • ${genres}</p>
                                <div class="d-flex align-items-center mb-3">
                                    <div class="me-3">
                                        <i class="fas fa-star text-warning"></i>
                                        <span class="ms-1">${this.movieData.vote_average.toFixed(1)} (${this.movieData.vote_count} votes)</span>
                                    </div>
                                    <button class="btn btn-sm btn-outline-light ms-3 auth-required" id="rate-movie-btn">
                                        <i class="fas fa-star me-1"></i> Rate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="container py-5">
                <div class="row">
                    <div class="col-md-8">
                        <h3 class="mb-3">Overview</h3>
                        <p class="lead">${this.movieData.overview || 'No overview available.'}</p>
                        
                        <div class="mt-5">
                            <h3 class="mb-3">Why You Might Like This</h3>
                            <p>Based on your preferences, this movie matches your taste in ${genres} films.</p>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card shadow">
                            <div class="card-header bg-dark text-white">
                                <h5 class="mb-0">Movie Details</h5>
                            </div>
                            <div class="card-body">
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span class="fw-bold">Release Date:</span>
                                        <span>${releaseDate}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span class="fw-bold">Genres:</span>
                                        <span>${genres}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span class="fw-bold">Vote Average:</span>
                                        <span>${this.movieData.vote_average.toFixed(1)}/10</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span class="fw-bold">Vote Count:</span>
                                        <span>${this.movieData.vote_count.toLocaleString()}</span>
                                    </li>
                                    <li class="list-group-item d-flex justify-content-between">
                                        <span class="fw-bold">Popularity:</span>
                                        <span>${this.movieData.popularity.toFixed(1)}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Update the container
        this.movieDetailsContainer.innerHTML = detailsHtml;
        
        // Setup rate movie button after rendering
        const rateMovieBtn = document.getElementById('rate-movie-btn');
        if (rateMovieBtn) {
            rateMovieBtn.addEventListener('click', () => {
                this.openRatingModal();
            });
        }
    }
    
    openRatingModal() {
        if (!this.movieData) return;
        
        // Set movie title in the modal
        if (this.rateMovieTitleElement) {
            this.rateMovieTitleElement.textContent = this.movieData.title;
        }
        
        // Reset rating
        this.selectRating(0);
        
        // Show the modal
        this.rateModal.show();
    }
    
    selectRating(rating) {
        this.selectedRating = rating;
        this.highlightStars(rating);
        
        // Update rating text
        const selectedRatingElement = document.querySelector('.selected-rating');
        if (selectedRatingElement) {
            selectedRatingElement.textContent = rating > 0 ? `${rating} / 10` : 'Select a rating';
        }
        
        // Enable/disable submit button
        if (this.submitRatingBtn) {
            this.submitRatingBtn.disabled = rating === 0;
        }
    }
    
    highlightStars(rating) {
        const stars = document.querySelectorAll('.rating-star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('text-warning');
            } else {
                star.classList.remove('text-warning');
            }
        });
    }
    
    async submitRating() {
        if (!this.movieId || !this.selectedRating) return;
        
        try {
            await apiService.rateMovie(this.movieId, this.selectedRating);
            
            // Close the modal
            this.rateModal.hide();
            
            // Show success message
            this.showToast(`You rated ${this.movieData.title} ${this.selectedRating}/10`, 'success');
            
        } catch (error) {
            console.error('Error submitting rating:', error);
            this.showToast('Failed to submit rating. Please try again later.', 'danger');
        }
    }
    
    toggleWatchlist() {
        // In a real app, this would call the backend to add/remove from watchlist
        const isAdded = this.addToWatchlistBtn.classList.contains('active');
        
        if (isAdded) {
            // Remove from watchlist
            this.addToWatchlistBtn.classList.remove('active', 'btn-primary');
            this.addToWatchlistBtn.classList.add('btn-outline-primary');
            this.showToast(`Removed from your watchlist`, 'info');
        } else {
            // Add to watchlist
            this.addToWatchlistBtn.classList.add('active', 'btn-primary');
            this.addToWatchlistBtn.classList.remove('btn-outline-primary');
            this.showToast(`Added to your watchlist`, 'success');
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
                        <a href="movie.html?id=${movie.id}" class="btn btn-sm btn-primary">Details</a>
                    </div>
                </div>
            </div>
        `;
        
        return movieCol;
    }
    
    showError(message) {
        if (this.movieDetailsContainer) {
            this.movieDetailsContainer.innerHTML = `
                <div class="container py-5">
                    <div class="alert alert-danger">
                        <h4 class="alert-heading">Error</h4>
                        <p>${message}</p>
                        <hr>
                        <p class="mb-0">
                            <a href="../index.html" class="alert-link">Go back to Home</a>
                        </p>
                    </div>
                </div>
            `;
        }
    }
    
    showToast(message, type = 'info') {
        // Create toast container if it doesn't exist
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        
        // Create toast element
        const toastEl = document.createElement('div');
        toastEl.className = `toast align-items-center text-white bg-${type} border-0 mb-2`;
        toastEl.setAttribute('role', 'alert');
        toastEl.setAttribute('aria-live', 'assertive');
        toastEl.setAttribute('aria-atomic', 'true');
        
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        toastContainer.appendChild(toastEl);
        
        // Initialize and show toast
        const toast = new bootstrap.Toast(toastEl, { autohide: true, delay: 5000 });
        toast.show();
        
        // Remove from DOM after hiding
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    window.moviePage = new MoviePage();
});