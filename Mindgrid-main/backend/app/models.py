from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from datetime import datetime

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    elo = Column(Integer, default=1000)
    mind_tokens = Column(Integer, default=0)
    debates = relationship("Debate", back_populates="user")
    messages = relationship("Message", back_populates="sender")


class Debate(Base):
    __tablename__ = "debates"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    topic = Column(String, nullable=False)
    stance = Column(String, nullable=False)
    winner = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="debates")
    messages = relationship("Message", back_populates="debate")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    debate_id = Column(Integer, ForeignKey("debates.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sender_type = Column(String, default='user')

    debate = relationship("Debate", back_populates="messages")
    sender = relationship("User", back_populates="messages")

class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=False)

class UserBadge(Base):
    __tablename__ = "user_badges"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_id = Column(Integer, ForeignKey("badges.id"), nullable=False)

class Streak(Base):
    __tablename__ = "streaks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    current_streak = Column(Integer, default=0)
    max_streak = Column(Integer, default=0)

class Forum(Base):
    __tablename__ = "forums"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=False)

class Thread(Base):
    __tablename__ = "threads"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    forum_id = Column(Integer, ForeignKey("forums.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    thread_id = Column(Integer, ForeignKey("threads.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
