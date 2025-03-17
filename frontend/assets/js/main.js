/**
 * Main JavaScript for the Movie Recommendation System
 * Handles UI interactions and data display
 */

class MovieApp {
    constructor() {
        // DOM elements
        this.popularMoviesContainer = document.getElementById('popular-movies');
        this.genresContainer = document.getElementById('genres-container');
        this.searchForm = document.getElementById('search-form');
        this.searchInput = document.getElementById('search-input');
        
        this.init();
    }
    
    async init() {
        // Load initial data
        this.loadPopularMovies();
        this.loadGenres();
        this.bindEvents();
    }
    
    bindEvents() {
        // Search form submit
        if (this.searchForm) {
            this.searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const query = this.searchInput.value.trim();
                if (query) {
                    window.location.href = `pages/search-results.html?q=${encodeURIComponent(query)}`;
                }
            });
        }
    }
    
    async loadPopularMovies() {
        if (!this.popularMoviesContainer) return;
        
        try {
            const movies = await apiService.getPopularMovies();
            
            // Clear loading spinner
            this.popularMoviesContainer.innerHTML = '';
            
            // Display movies
            movies.forEach(movie => {
                this.popularMoviesContainer.appendChild(this.createMovieCard(movie));
            });
        } catch (error) {
            console.error('Error loading popular movies:', error);
            this.popularMoviesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        Failed to load popular movies. Please try again later.
                    </div>
                </div>
            `;
        }
    }
    
    async loadGenres() {
        if (!this.genresContainer) return;
        
        try {
            const genres = await apiService.getGenres();
            
            // Clear container
            this.genresContainer.innerHTML = '';
            
            // Display genres
            genres.forEach(genre => {
                const genreCard = document.createElement('div');
                genreCard.className = 'col-md-3 col-sm-4 col-6';
                genreCard.innerHTML = `
                    <div class="genre-card" data-genre-id="${genre.id}">
                        <h5>${genre.name}</h5>
                    </div>
                `;
                
                genreCard.querySelector('.genre-card').addEventListener('click', () => {
                    window.location.href = `pages/genre.html?id=${genre.id}&name=${encodeURIComponent(genre.name)}`;
                });
                
                this.genresContainer.appendChild(genreCard);
            });
        } catch (error) {
            console.error('Error loading genres:', error);
            this.genresContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger">
                        Failed to load genres. Please try again later.
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
                    <span class="movie-rating">${movie.vote_average.toFixed(1)}</span>
                </div>
                <div class="movie-card-body">
                    <h5 class="movie-title">${movie.title}</h5>
                    <div class="movie-genres">${genresHtml || releaseDate}</div>
                    <p class="movie-overview">${movie.overview || 'No description available.'}</p>
                    <div class="movie-card-footer">
                        <small class="text-muted">${releaseDate}</small>
                        <a href="pages/movie.html?id=${movie.tmdb_id}" class="btn btn-sm btn-primary">Details</a>
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
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.movieApp = new MovieApp();
});