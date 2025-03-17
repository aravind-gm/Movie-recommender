from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class GenreResponse(BaseModel):
    id: int
    name: str
    
    # Replace Config class with model_config
    model_config = {
        "from_attributes": True  # Replaces orm_mode=True
    }

class MovieBase(BaseModel):
    tmdb_id: int
    title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    release_date: Optional[datetime] = None
    vote_average: Optional[float] = 0.0
    vote_count: Optional[int] = 0
    popularity: Optional[float] = 0.0

class MovieCreate(MovieBase):
    pass

class MovieResponse(MovieBase):
    id: int
    genres: List[GenreResponse] = []
    
    # Replace Config class with model_config 
    model_config = {
        "from_attributes": True  # Replaces orm_mode=True
    }

# Add new schemas for TMDb API responses

class TMDbMovieBase(BaseModel):
    id: int
    title: str
    overview: Optional[str] = None
    poster_path: Optional[str] = None
    release_date: Optional[str] = None  # TMDb returns date as string
    vote_average: Optional[float] = 0.0
    vote_count: Optional[int] = 0
    popularity: Optional[float] = 0.0
    genre_ids: Optional[List[int]] = []

class TMDbMovieResponse(BaseModel):
    results: List[TMDbMovieBase]
    page: int
    total_pages: int
    total_results: int

# Add schema for movie ratings
class MovieRating(BaseModel):
    movie_id: int
    rating: int
    
    model_config = {
        "from_attributes": True
    }

# Add schema for user preferences
class UserPreferences(BaseModel):
    genre_ids: List[int]