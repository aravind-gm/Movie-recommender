/**
 * Preferences page JavaScript
 * Handles user preferences management
 */

class PreferencesPage {
    constructor() {
        // DOM elements
        this.genresContainer = document.getElementById('genres-container');
        this.preferencesForm = document.getElementById('preferences-form');
        this.loginBtnMain = document.getElementById('login-btn-main');
        this.registerBtnMain = document.getElementById('register-btn-main');
        
        // User preferences
        this.userGenres = [];
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            await this.loadGenres();
            await this.loadUserPreferences();
        }
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
        
        // Preferences form submit
        if (this.preferencesForm) {
            this.preferencesForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.savePreferences();
            });
        }
    }
    
    async loadGenres() {
        if (!this.genresContainer) return;
        
        try {
            const genres = await apiService.getGenres();
            
            // Clear loading spinner
            this.genresContainer.innerHTML = '';
            
            // Display genres as checkboxes
            genres.forEach(genre => {
                const genreDiv = document.createElement('div');
                
                genreDiv.innerHTML = `
                    <input type="checkbox" class="preference-checkbox" id="genre-${genre.id}" value="${genre.id}">
                    <label for="genre-${genre.id}" class="preference-label">${genre.name}</label>
                `;
                
                this.genresContainer.appendChild(genreDiv);
            });
            
        } catch (error) {
            console.error('Error loading genres:', error);
            this.genresContainer.innerHTML = `
                <div class="alert alert-danger">
                    Failed to load genres. Please try again later.
                </div>
            `;
        }
    }
    
    async loadUserPreferences() {
        try {
            // In a real app, we would fetch the user's preferences from the backend
            const currentUser = await apiService.getCurrentUser();
            
            if (currentUser && currentUser.preferences) {
                // Set selected genres
                currentUser.preferences.forEach(genre => {
                    const checkbox = document.getElementById(`genre-${genre.id}`);
                    if (checkbox) checkbox.checked = true;
                });
                
                this.userGenres = currentUser.preferences.map(genre => genre.id);
            }
            
            // Set other preferences if they exist
            // This would depend on your backend implementation
            
        } catch (error) {
            console.error('Error loading user preferences:', error);
            // Show an error message or handle as appropriate
        }
    }
    
    async savePreferences() {
        // Show loading spinner
        const spinner = this.showLoadingSpinner();
        
        try {
            // Collect selected genres
            const genreCheckboxes = document.querySelectorAll('.preference-checkbox:checked');
            const selectedGenreIds = Array.from(genreCheckboxes).map(cb => parseInt(cb.value));
            
            // Collect other preferences
            const minYear = document.getElementById('release-year-min').value;
            const maxYear = document.getElementById('release-year-max').value;
            const minRating = document.getElementById('minimum-rating').value;
            const preferPopular = document.getElementById('prefer-popular').checked;
            const preferClassics = document.getElementById('prefer-classics').checked;
            const preferIndependent = document.getElementById('prefer-independent').checked;
            
            // Save genres to the backend (only these would affect recommendations)
            await apiService.updatePreferences(selectedGenreIds);
            
            // In a real app, we would save all preferences to the backend
            // For this example, we're just simulating it
            
            // Update user's local preferences
            this.userGenres = selectedGenreIds;
            
            // Hide loading spinner
            this.hideLoadingSpinner(spinner);
            
            // Show success message
            this.showToast('Preferences saved successfully!', 'success');
            
            // Redirect to recommendations page
            setTimeout(() => {
                window.location.href = 'recommendations.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error saving preferences:', error);
            
            // Hide loading spinner
            this.hideLoadingSpinner(spinner);
            
            // Show error message
            this.showToast('Failed to save preferences. Please try again later.', 'danger');
        }
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
    window.preferencesPage = new PreferencesPage();
});