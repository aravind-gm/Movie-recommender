/**
 * Authentication Handler for the Movie Recommendation System
 * Manages user authentication state and UI updates
 */

class AuthHandler {
    constructor() {
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.loginBtn = document.getElementById('login-btn') || document.getElementById('login-btn-main');
        this.registerBtn = document.getElementById('register-btn') || document.getElementById('register-btn-main');
        this.logoutBtn = document.getElementById('logout-btn');
        
        // Initialize modals safely
        this.initializeModals();

        this.isLoggedIn = false;
        this.currentUser = null;
        
        // DOM elements
        this.authButtons = document.getElementById('auth-buttons');
        this.userInfo = document.getElementById('user-info');
        this.usernameEl = document.getElementById('username');
        
        this.init();
    }

    initializeModals() {
        try {
            // Get modal elements
            this.loginModal = document.getElementById('loginModal');
            this.registerModal = document.getElementById('registerModal');
            
            if (this.loginModal) {
                if (typeof bootstrap !== 'undefined') {
                    this.loginModalInstance = bootstrap.Modal.getInstance(this.loginModal) || 
                                          new bootstrap.Modal(this.loginModal, {
                                              backdrop: true,
                                              keyboard: true,
                                              focus: true
                                          });
                }
            }
            
            if (this.registerModal) {
                if (typeof bootstrap !== 'undefined') {
                    this.registerModalInstance = bootstrap.Modal.getInstance(this.registerModal) || 
                                             new bootstrap.Modal(this.registerModal, {
                                                 backdrop: true,
                                                 keyboard: true,
                                                 focus: true
                                             });
                }
            }
        } catch (error) {
            console.error('Error initializing modals:', error);
        }
    }
    
    async init() {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
            try {
                this.currentUser = await apiService.getCurrentUser();
                this.isLoggedIn = true;
                this.updateUI();
            } catch (error) {
                console.error('Error getting current user:', error);
                localStorage.removeItem('token');
                this.isLoggedIn = false;
                this.updateUI();
            }
        } else {
            this.isLoggedIn = false;
            this.updateUI();
        }
        
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Login button click
        if (this.loginBtn) {
            this.loginBtn.addEventListener('click', () => {
                this.loginModalInstance?.show();
            });
        }
        
        // Register button click
        if (this.registerBtn) {
            this.registerBtn.addEventListener('click', () => {
                this.registerModalInstance?.show();
            });
        }
        
        // Logout button click
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
        
        // Login form submit
        if (this.loginForm) {
            this.loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Register form submit
        if (this.registerForm) {
            this.registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }
    }
    
    async handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        try {
            const response = await apiService.login(email, password);
            
            if (response.access_token) {
                localStorage.setItem('token', response.access_token);
                
                // Get user info
                this.currentUser = await apiService.getCurrentUser();
                this.isLoggedIn = true;
                
                // Update UI
                this.updateUI();
                this.loginModalInstance?.hide();
                
                // Show success message
                this.showToast('Login successful!', 'success');
                
                // Reload page to update content based on user
                window.location.reload();
            } else {
                throw new Error('Login failed: No access token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showToast(error.message || 'Login failed', 'danger');
        }
    }
    
    async handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        
        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'danger');
            return;
        }
        
        try {
            const response = await apiService.register(username, email, password);
            this.registerModalInstance.hide();
            this.showToast('Registration successful! Please log in.', 'success');
            this.loginModalInstance.show();
        } catch (error) {
            console.error('Registration error:', error);
            this.showToast('Registration failed: ' + error.message, 'danger');
        }
    }
    
    logout() {
        localStorage.removeItem('token');
        this.isLoggedIn = false;
        this.currentUser = null;
        this.updateUI();
        this.showToast('You have been logged out', 'info');
        
        // Redirect to home page if on a protected page
        const currentPage = window.location.pathname;
        if (currentPage.includes('/profile.html') || currentPage.includes('/recommendations.html')) {
            window.location.href = '/index.html';
        } else {
            window.location.reload();
        }
    }
    
    updateUI() {
        if (this.authButtons && this.userInfo) {
            if (this.isLoggedIn && this.currentUser) {
                this.authButtons.classList.add('d-none');
                this.userInfo.classList.remove('d-none');
                if (this.usernameEl) {
                    this.usernameEl.textContent = this.currentUser.username;
                }
            } else {
                this.authButtons.classList.remove('d-none');
                this.userInfo.classList.add('d-none');
            }
        }
        
        // Update other UI elements based on authentication state
        const authRequiredElements = document.querySelectorAll('.auth-required');
        const noAuthElements = document.querySelectorAll('.no-auth');
        
        authRequiredElements.forEach(element => {
            if (this.isLoggedIn) {
                element.classList.remove('d-none');
            } else {
                element.classList.add('d-none');
            }
        });
        
        noAuthElements.forEach(element => {
            if (this.isLoggedIn) {
                element.classList.add('d-none');
            } else {
                element.classList.remove('d-none');
            }
        });
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

// Initialize auth handler safely
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.authHandler = new AuthHandler();
    } catch (error) {
        console.error('Error initializing AuthHandler:', error);
    }
});