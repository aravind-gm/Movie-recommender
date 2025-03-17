import requests
from typing import List, Dict, Any, Optional
import os

class TMDBService:
    BASE_URL = "https://api.themoviedb.org/3"
    
    def __init__(self, api_key: str = None):
        api_key = "0bd68a06943ae5626db6781dba9948c5"
        self.api_key = api_key or os.getenv("TMDB_API_KEY")
        if not self.api_key:
            raise ValueError("TMDB API key is required")
    
    def _make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Dict:
        """Make a request to the TMDB API"""
        url = f"{self.BASE_URL}{endpoint}"
        params = params or {}
        params["api_key"] = self.api_key
        
        response = requests.get(url, params=params)
        response.raise_for_status()
        
        return response.json()
    
    def get_popular_movies(self, page: int = 1) -> Dict:
        """Get popular movies"""
        return self._make_request("/movie/popular", {"page": page})
    
    def get_movie_details(self, movie_id: int) -> Dict:
        """Get detailed information about a specific movie"""
        return self._make_request(f"/movie/{movie_id}")
    
    def search_movies(self, query: str, page: int = 1) -> Dict:
        """Search for movies by title"""
        return self._make_request("/search/movie", {"query": query, "page": page})
    
    def get_movie_recommendations(self, movie_id: int) -> Dict:
        """Get recommendations for a movie"""
        return self._make_request(f"/movie/{movie_id}/recommendations")
    
    def get_movie_genres(self) -> Dict:
        """Get all movie genres"""
        return self._make_request("/genre/movie/list")
    
    def discover_movies(self, params: Dict[str, Any]) -> Dict:
        """Discover movies with filters"""
        return self._make_request("/discover/movie", params)

# Create a singleton instance
tmdb_service = TMDBService()