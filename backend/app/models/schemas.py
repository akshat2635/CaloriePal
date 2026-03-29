from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict
from datetime import datetime


# Authentication Schemas
class UserRegister(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


# User Profile Schemas
class OnboardingData(BaseModel):
    name: str = Field(..., description="User's name")
    weight_kg: float = Field(..., description="Weight in kilograms", gt=0)
    height_cm: float = Field(..., description="Height in centimeters", gt=0)
    age: int = Field(..., description="Age in years", gt=0, lt=150)
    gender: str = Field(..., description="Gender: male or female")
    goal: str = Field(..., description="Goal: weight_loss, maintenance, or muscle_building")
    lifestyle: str = Field(..., description="Activity level: sedentary, moderately active, very active")
    exercise_frequency: str = Field(..., description="Exercise frequency description")


class UserProfile(BaseModel):
    id: int
    username: str
    email: str
    name: Optional[str] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    goal: Optional[str] = None
    lifestyle: Optional[str] = None
    exercise_frequency: Optional[str] = None
    is_onboarded: bool = False
    
    class Config:
        from_attributes = True


class FoodEntry(BaseModel):
    food: str = Field(..., description="Food name")
    portion: str = Field(..., description="Portion size")
    calories: float = Field(..., description="Calories", ge=0)
    protein: float = Field(..., description="Protein in grams", ge=0)
    fat: float = Field(..., description="Fat in grams", ge=0)
    carbs: float = Field(..., description="Carbs in grams", ge=0)


class MealItem(FoodEntry):
    id: Optional[int] = None

    class Config:
        from_attributes = True


class FoodEntryWithTime(FoodEntry):
    time: str = Field(..., description="Time of entry (HH:MM)")
    is_combined_meal: bool = Field(False, description="Whether this entry is a combined meal")
    meal_summary: Optional[str] = Field(None, description="AI-generated summary for combined meal")
    meal_items: Optional[List[MealItem]] = Field(
        default=None,
        description="Individual parsed items included in a combined meal",
    )

    class Config:
        from_attributes = True


class FoodEntryDB(FoodEntryWithTime):
    id: int
    user_id: int
    date: datetime
    
    class Config:
        from_attributes = True


class LogFoodRequest(BaseModel):
    description: str = Field("", description="Natural language food description")
    images: Optional[List[str]] = Field(None, description="List of base64 encoded images")
    combine_as_meal: bool = Field(False, description="Whether to combine items as a single meal entry")
    meal_type: Optional[str] = Field(
        None,
        description="Meal name for combined entries (e.g. breakfast, lunch, dinner, snacks, or custom)",
    )


class LogFoodResponse(BaseModel):
    success: bool
    entries: List[FoodEntryWithTime]
    message: str


class MacroTargets(BaseModel):
    calories: float = Field(..., description="Daily calorie target")
    protein: float = Field(..., description="Daily protein target in grams")
    fat: float = Field(..., description="Daily fat target in grams")
    carbs: float = Field(..., description="Daily carbs target in grams")


class MacroRemaining(BaseModel):
    calories: float = Field(..., description="Remaining calories")
    protein: float = Field(..., description="Remaining protein in grams")
    fat: float = Field(..., description="Remaining fat in grams")
    carbs: float = Field(..., description="Remaining carbs in grams")


class DailySummary(BaseModel):
    user: UserProfile
    entries: List[FoodEntryDB]
    total_calories: float
    total_protein: float
    total_fat: float
    total_carbs: float
    bmi: float
    bmr: float = Field(..., description="Basal Metabolic Rate")
    tdee: float = Field(..., description="Total Daily Energy Expenditure")
    targets: MacroTargets = Field(..., description="Daily macro targets")
    remaining: MacroRemaining = Field(..., description="Remaining macros")
    ai_insights: str


class UpdateProfileRequest(BaseModel):
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    goal: Optional[str] = None
    lifestyle: Optional[str] = None
    exercise_frequency: Optional[str] = None


class DailyNutritionSummary(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    calories: float = Field(..., description="Total calories for the day")
    protein: float = Field(..., description="Total protein in grams")
    fat: float = Field(..., description="Total fat in grams")
    carbs: float = Field(..., description="Total carbs in grams")
    entry_count: int = Field(..., description="Number of food entries")


class HistoricalComparison(BaseModel):
    period_days: int = Field(..., description="Number of days in history (7 or 30)")
    daily_data: List[DailyNutritionSummary] = Field(..., description="Daily nutrition data")
    averages: Dict[str, float] = Field(..., description="Average values for the period")
    totals: Dict[str, float] = Field(..., description="Total values for the period")
