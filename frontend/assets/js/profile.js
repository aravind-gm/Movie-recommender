/**
 * Profile page JavaScript
 * Handles user profile display and management
 */

class ProfilePage {
    constructor() {
        // DOM elements
        this.profileUsername = document.getElementById('profile-username');
        this.profileEmail = document.getElementById('profile-email');
        this.moviesRatedCount = document.getElementById('movies-rated-count');
        this.moviesWatchedCount = document.getElementById('movies-watched-count');
        this.favoriteGenres = document.getElementById('favorite-genres');
        this.recentlyWatchedContainer = document.getElementById('recently-watched');
        this.watchlistContainer = document.getElementById('watchlist');
        this.editProfileForm = document.getElementById('edit-profile-form');
        this.loginBtnMain = document.getElementById('login-btn-main');
        this.registerBtnMain = document.getElementById('register-btn-main');
        
        // User data
        this.userData = null;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            await this.loadUserProfile();
        }
    }
    
    bindEvents() {
        // Edit profile form submit
        if (this.editProfileForm) {
            this.editProfileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }
        
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
    
    async loadUserProfile() {
        try {
            this.userData = await apiService.getCurrentUser();
            
            // Update profile information
            this.updateProfileDisplay();
            
            // Load watch history and watchlist
            this.loadWatchHistory();
            this.loadWatchlist();
            
        } catch (error) {
            console.error('Error loading user profile:', error);
            // Show an error message or handle as appropriate
        }
    }
    
    updateProfileDisplay() {
        if (!this.userData) return;
        
        // Update profile username and email
        if (this.profileUsername) {
            this.profileUsername.textContent = this.userData.username;
        }
        
        if (this.profileEmail) {
            this.profileEmail.textContent = this.userData.email;
        }
        
        // Update user statistics
        if (this.moviesRatedCount) {
            this.moviesRatedCount.textContent = this.userData.rated_movies?.length || 0;
        }
        
        if (this.moviesWatchedCount) {
            this.moviesWatchedCount.textContent = this.userData.watch_history?.length || 0;
        }
        
        if (this.favoriteGenres) {
            const genres = this.userData.preferences?.map(genre => genre.name).slice(0, 3).join(', ') || '-';
            this.favoriteGenres.textContent = genres;
        }
        
        // Populate edit profile form
        document.getElementById('edit-username').value = this.userData.username;
        document.getElementById('edit-email').value = this.userData.email;
    }
    
    async loadWatchHistory() {
        if (!this.recentlyWatchedContainer || !this.userData) return;
        
        const watchHistory = this.userData.watch_history || [];
        
        // Clear container
        this.recentlyWatchedContainer.innerHTML = '';
        
        if (watchHistory.length === 0) {
            this.recentlyWatchedContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p>You haven't watched any movies yet.</p>
                    <a href="../index.html" class="btn btn-primary">Browse Movies</a>
                </div>
            `;
            return;
        }
        
        // Display recent watch history (last 6 movies)
        watchHistory.slice(0, 6).forEach(movie => {
            this.recentlyWatchedContainer.appendChild(this.createMovieCard(movie));
        });
    }
    
    async loadWatchlist() {
        if (!this.watchlistContainer || !this.userData) return;
        
        const watchlist = this.userData.watchlist || [];
        
        // Clear container
        this.watchlistContainer.innerHTML = '';
        
        if (watchlist.length === 0) {
            this.watchlistContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p>Your watchlist is empty.</p>
                    <a href="../index.html" class="btn btn-primary">Browse Movies</a>
                </div>
            `;
            return;
        }
        
        // Display watchlist (up to 6 movies)
        watchlist.slice(0, 6).forEach(movie => {
            const movieCard = this.createMovieCard(movie);
            
            // Add remove from watchlist button
            const cardBody = movieCard.querySelector('.movie-card-body');
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-sm btn-outline-danger mt-2';
            removeBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Remove';
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.removeFromWatchlist(movie.id);
            });
            
            cardBody.appendChild(removeBtn);
            
            this.watchlistContainer.appendChild(movieCard);
        });
    }
    
    async updateProfile() {
        // In a real app, this would call the backend to update the user's profile
        const username = document.getElementById('edit-username').value;
        const email = document.getElementById('edit-email').value;
        const password = document.getElementById('edit-password').value;
        const avatarInput = document.getElementById('edit-avatar');
        
        // Show loading spinner
        const spinner = this.showLoadingSpinner();
        
        try {
            // Update user profile
            // For this demo, we'll just simulate the update
            
            // Update local user data
            this.userData.username = username;
            this.userData.email = email;
            
            // Hide modal
            const editProfileModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            editProfileModal.hide();
            
            // Update profile display
            this.updateProfileDisplay();
            
            // Hide loading spinner
            this.hideLoadingSpinner(spinner);
            
            // Show success message
            this.showToast('Profile updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error updating profile:', error);
            
            // Hide loading spinner
            this.hideLoadingSpinner(spinner);
            
            // Show error message
            this.showToast('Failed to update profile. Please try again later.', 'danger');
        }
    }
    
    async removeFromWatchlist(movieId) {
        // In a real app, this would call the backend to remove the movie from watchlist
        
        // For this demo, we'll just simulate the removal
        if (this.userData && this.userData.watchlist) {
            this.userData.watchlist = this.userData.watchlist.filter(movie => movie.id !== movieId);
            
            // Reload watchlist
            this.loadWatchlist();
            
            // Show success message
            this.showToast('Movie removed from watchlist', 'success');
        }
    }
    
    createMovieCard(movie) {
        const movieCol = document.createElement('div');
        movieCol.className = 'col-lg-4 col-sm-6 mb-4';
        
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
                    <div class="movie-card-footer">
                        <small class="text-muted">${releaseDate}</small>
                        <a href="movie.html?id=${movie.tmdb_id || movie.id}" class="btn btn-sm btn-primary">Details</a>
                    </div>
                </div>
            </div>
        `;
        
        return movieCol;
    }
    
    showLoadingSpinner() {
        const spinner = document.createElement('div');
        spinner.className = 'spinner-overlay';
        spinner.innerHTML = `
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;
        document.body.appendChild(spinner);
        return spinner;
    }
    
    hideLoadingSpinner(spinner) {
        if (spinner && spinner.parentNode) {
            spinner.parentNode.removeChild(spinner);
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
    window.profilePage = new ProfilePage();
});