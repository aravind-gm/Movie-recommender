from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.models.database import get_db
from app.models.movie import Movie, Genre  # Added Genre import
from app.services.tmdb_service import tmdb_service
from app.services.recommendation_service import RecommendationService
from app.schemas.movie import MovieResponse

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])
recommendation_service = RecommendationService()

@router.get("/personalized", response_model=List[MovieResponse])
async def get_personalized_recommendations(
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    user_id: int = Query(None, description="Optional user ID for personalized recommendations")
):
    """Get personalized movie recommendations based on user preferences and watch history"""
    if user_id:
        # If user_id is provided, try to get recommendations for that user
        user = db.query(User).filter(User.id == user_id).first()
        if user and user.watch_history:
            # Get recommendations based on user's watch history and preferences
            recommended_movies = recommendation_service.get_recommendations_for_user(user, limit, db)
            return recommended_movies
    
    # Default: return popular movies
    response = tmdb_service.get_popular_movies()
    return response.get("results", [])[:limit]

@router.get("/similar/{movie_id}", response_model=List[MovieResponse])
async def get_similar_movies(
    movie_id: int,
    db: Session = Depends(get_db)
):
    """Get movies similar to the specified movie"""
    # Get recommendations from TMDB API
    response = tmdb_service.get_movie_recommendations(movie_id)
    
    return response.get("results", [])

@router.get("/by-genre/{genre_id}", response_model=List[MovieResponse])
async def get_recommendations_by_genre(
    genre_id: int,
    page: int = Query(1, ge=1),
    db: Session = Depends(get_db)
):
    """Get movie recommendations for a specific genre"""
    # Use the discover endpoint to get movies by genre
    response = tmdb_service.discover_movies({
        "with_genres": genre_id,
        "sort_by": "popularity.desc",
        "page": page
    })
    
    return response.get("results", [])

@router.post("/update-preferences/{user_id}", response_model=dict)
async def update_user_preferences(
    user_id: int,
    genre_ids: List[int],
    db: Session = Depends(get_db)
):
    """Update user genre preferences"""
    # Get user
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Clear current preferences
    user.preferences = []
    
    # Add new preferences
    for genre_id in genre_ids:
        genre = db.query(Genre).filter(Genre.id == genre_id).first()
        if genre:
            user.preferences.append(genre)
    
    db.commit()
    
    return {"success": True, "message": "Preferences updated successfully"}

# Added a simple endpoint to get a demo user or create one if it doesn't exist
@router.get("/demo-user", response_model=dict)
async def get_demo_user(db: Session = Depends(get_db)):
    """Get or create a demo user for testing"""
    # Check if demo user exists
    demo_user = db.query(User).filter(User.username == "demo_user").first()
    
    if not demo_user:
        # Create a new demo user
        demo_user = User(
            username="demo_user",
            email="demo@example.com"
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
    
    return {
        "id": demo_user.id,
        "username": demo_user.username,
        "message": "You can use this user ID for testing recommendations"
    }