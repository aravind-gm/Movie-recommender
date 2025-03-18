from sqlalchemy import Column, Integer, String, Float, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship
from app.models.database import Base
from datetime import datetime
from app.models.user import User  # Import User instead of defining it

# Many-to-many relationship table for movie genres
movie_genre = Table(
    'movie_genre',
    Base.metadata,
    Column('movie_id', Integer, ForeignKey('movies.id')),
    Column('genre_id', Integer, ForeignKey('genres.id'))
)

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    tmdb_id = Column(Integer, unique=True, index=True)
    title = Column(String, index=True)
    overview = Column(String)
    release_date = Column(DateTime)
    poster_path = Column(String)
    vote_average = Column(Float)
    vote_count = Column(Integer)
    popularity = Column(Float)
    
    # Relationships
    genres = relationship("Genre", secondary=movie_genre, back_populates="movies")
    viewers = relationship("User", secondary="user_movie", back_populates="watch_history")

class Genre(Base):
    __tablename__ = "genres"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    
    # Relationships
    movies = relationship("Movie", secondary=movie_genre, back_populates="genres")
    users = relationship("User", secondary="user_genre", back_populates="preferences")

class WatchHistory(Base):
    __tablename__ = "watch_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer, index=True)
    title = Column(String)
    poster_path = Column(String, nullable=True)
    watched_at = Column(DateTime, default=datetime.now)
    
    user = relationship("User", back_populates="watch_history_entries")

class Watchlist(Base):
    __tablename__ = "watchlists"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer, index=True)
    title = Column(String)
    poster_path = Column(String, nullable=True)
    added_at = Column(DateTime, default=datetime.now)
    
    user = relationship("User", back_populates="watchlist_entries")

class Rating(Base):
    __tablename__ = "ratings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    movie_id = Column(Integer, index=True)
    rating = Column(Integer)
    title = Column(String)
    poster_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    user = relationship("User", back_populates="ratings_entries")