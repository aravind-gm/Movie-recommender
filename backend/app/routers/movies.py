from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.database import get_db
from app.models.movie import Movie, Genre
from app.services.tmdb_service import tmdb_service
from app.schemas.movie import MovieResponse, GenreResponse
from datetime import datetime

router = APIRouter(prefix="/movies", tags=["Movies"])

@router.get("/popular", response_model=List[MovieResponse])
async def get_popular_movies(
    page: int = Query(1, ge=1), 
    db: Session = Depends(get_db)
):
    """Get popular movies from TMDB"""
    response = tmdb_service.get_popular_movies(page)
    
    # Process and save movies to the database
    movies = []
    for movie_data in response.get("results", []):
        # Check if movie exists in database
        db_movie = db.query(Movie).filter(Movie.tmdb_id == movie_data["id"]).first()
        
        if not db_movie:
            # Create new movie record
            db_movie = Movie(
                tmdb_id=movie_data["id"],
                title=movie_data["title"],
                overview=movie_data["overview"],
                release_date=datetime.strptime(movie_data["release_date"], "%Y-%m-%d") if movie_data.get("release_date") else None,
                poster_path=movie_data["poster_path"],
                vote_average=movie_data["vote_average"],
                vote_count=movie_data["vote_count"],
                popularity=movie_data["popularity"],
            )
            
            # Add genres
            for genre_id in movie_data.get("genre_ids", []):
                genre = db.query(Genre).filter(Genre.id == genre_id).first()
                if genre:
                    db_movie.genres.append(genre)
                    
            db.add(db_movie)
            db.commit()
            db.refresh(db_movie)
        
        movies.append(db_movie)
    
    return movies

@router.get("/search", response_model=List[MovieResponse])
async def search_movies(
    query: str,
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db)
):
    """Search for movies by title"""
    response = tmdb_service.search_movies(query, page)
    
    # Process results (similar to popular movies)
    movies = []
    for movie_data in response.get("results", []):
        if movie_data.get("poster_path") and movie_data.get("release_date"):
            movies.append(movie_data)
    
    return movies

@router.get("/genres", response_model=List[GenreResponse])
async def get_genres(db: Session = Depends(get_db)):
    """Get all movie genres"""
    genres = db.query(Genre).all()
    
    if not genres:
        # If genres don't exist in the database, fetch from TMDB API
        response = tmdb_service.get_movie_genres()
        
        for genre_data in response.get("genres", []):
            genre = Genre(id=genre_data["id"], name=genre_data["name"])
            db.add(genre)
        
        db.commit()
        genres = db.query(Genre).all()
    
    return genres

@router.get("/{movie_id}", response_model=MovieResponse)
async def get_movie_details(
    movie_id: int,
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific movie"""
    # Check if movie exists in database
    db_movie = db.query(Movie).filter(Movie.tmdb_id == movie_id).first()
    
    if not db_movie:
        # If not in database, fetch from TMDB API
        movie_data = tmdb_service.get_movie_details(movie_id)
        
        # Create new movie record (similar to popular movies)
        # You would need to implement this part
        
    return db_movie

@router.post("/{movie_id}/rate", response_model=dict)
async def rate_movie(
    movie_id: int,
    rating: int = Query(..., ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Rate a movie (1-10 scale)"""
    # Check if movie exists in database
    db_movie = db.query(Movie).filter(Movie.tmdb_id == movie_id).first()
    
    if not db_movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # Without authentication, we can't associate ratings with users
    # For now, just return a success message
    return {"success": True, "message": "Rating received (but not saved to user profile)"}