from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=True)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    goal = Column(String, nullable=True)  # weight_loss, maintenance, muscle_building
    lifestyle = Column(String, nullable=True)
    exercise_frequency = Column(String, nullable=True)
    is_onboarded = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship
    food_entries = relationship("FoodEntry", back_populates="user", cascade="all, delete-orphan")


class FoodEntry(Base):
    __tablename__ = "food_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    food = Column(String, nullable=False)
    portion = Column(String, nullable=False)
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    time = Column(String, nullable=False)  # HH:MM format
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_combined_meal = Column(Boolean, default=False)
    meal_summary = Column(String, nullable=True)
    
    # Relationship
    user = relationship("User", back_populates="food_entries")
    meal_items = relationship("MealItem", back_populates="meal_entry", cascade="all, delete-orphan")


class MealItem(Base):
    __tablename__ = "meal_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_entry_id = Column(Integer, ForeignKey("food_entries.id"), nullable=False, index=True)
    food = Column(String, nullable=False)
    portion = Column(String, nullable=False)
    calories = Column(Float, nullable=False)
    protein = Column(Float, nullable=False)
    fat = Column(Float, nullable=False)
    carbs = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    meal_entry = relationship("FoodEntry", back_populates="meal_items")
