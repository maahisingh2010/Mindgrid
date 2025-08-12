from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ------------------ USER SCHEMAS ------------------ #
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    elo: Optional[int] = 0
    mind_tokens: Optional[int] = 0

    class Config:
        orm_mode = True

class Forum(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        from_attributes = True

class Thread(BaseModel):
    id: int
    title: str
    forum_id: int
    user_id: int

    class Config:
        from_attributes = True

class ThreadCreate(BaseModel):
    title: str
    forum_id: int

class Post(BaseModel):
    id: int
    content: str
    thread_id: int
    user_id: int

    class Config:
        from_attributes = True

class PostCreate(BaseModel):
    content: str
    thread_id: int

class Analysis(BaseModel):
    analysis: str

class UserStats(BaseModel):
    debates_won: int
    debates_lost: int
    debates_competed: int

class Badge(BaseModel):
    id: int
    name: str
    description: str

    class Config:
        from_attributes = True

class Streak(BaseModel):
    id: int
    user_id: int
    current_streak: int
    max_streak: int

    class Config:
        from_attributes = True

# ------------------ AUTH TOKEN ------------------ #
class Token(BaseModel):
    access_token: str
    token_type: str


# ------------------ DEBATE SCHEMAS ------------------ #
class DebateCreate(BaseModel):
    topic: str
    stance: str


class DebateOut(BaseModel):
    id: int
    topic: str
    stance: str
    user_id: int

    class Config:
        from_attributes = True


# ------------------ MESSAGE SCHEMAS ------------------ #
class MessageCreate(BaseModel):
    sender_id: Optional[int] = None
    content: str
    sender_type: str = 'user'


class MessageOut(BaseModel):
    id: int
    content: str
    sender_id: Optional[int] = None
    debate_id: int
    timestamp: datetime
    sender_type: str

    class Config:
        from_attributes = True
