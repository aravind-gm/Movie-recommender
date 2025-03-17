from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    # If you're removing authentication completely, you could make password optional
    # or keep it for future use
    password: Optional[str] = None

class UserResponse(UserBase):
    id: int
    is_active: bool = True
    created_at: Optional[datetime] = None
    
    # Updated for Pydantic v2
    model_config = {
        "from_attributes": True  # This replaces orm_mode=True
    }

# If you want to keep token handling for future use
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None
    username: Optional[str] = None
    exp: Optional[datetime] = None

# New simplified user schema for non-authentication purposes
class UserPublic(BaseModel):
    id: int
    username: str
    
    model_config = {
        "from_attributes": True
    }

# Schema for updating user preferences
class UserPreferencesUpdate(BaseModel):
    genre_ids: List[int] = []

# Schema for user's movie history
class UserWatchHistory(BaseModel):
    movie_ids: List[int] = []

# Schema for user's movie ratings
class UserMovieRating(BaseModel):
    movie_id: int
    rating: int = Field(..., ge=1, le=10)