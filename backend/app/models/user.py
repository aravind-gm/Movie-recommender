from sqlalchemy import Boolean, Column, Integer, String, Table, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.models.database import Base
from datetime import datetime
import bcrypt

# Many-to-many relationship table for user preferences (genres)
user_genre = Table(
    'user_genre',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('genre_id', Integer, ForeignKey('genres.id'))
)

# Many-to-many relationship table for user watch history
user_movie = Table(
    'user_movie',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('movie_id', Integer, ForeignKey('movies.id')),
    Column('rating', Integer, nullable=True),
    Column('watched_at', DateTime, default=datetime.utcnow)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    avatar_url = Column(String, nullable=True)
    
    # Relationships
    preferences = relationship("Genre", secondary=user_genre, back_populates="users")
    watch_history = relationship("Movie", secondary=user_movie, back_populates="viewers")
    
    # New relationships for the entities defined in movie.py
    watchlist_entries = relationship("Watchlist", back_populates="user", cascade="all, delete-orphan")
    watch_history_entries = relationship("WatchHistory", back_populates="user", cascade="all, delete-orphan")
    ratings_entries = relationship("Rating", back_populates="user", cascade="all, delete-orphan")
    
    def set_password(self, password):
        self.hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    
    def verify_password(self, password):
        return bcrypt.checkpw(password.encode(), self.hashed_password.encode())