from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.models.schemas import (
    UserRegister, Token, UserProfile, OnboardingData,
    LogFoodRequest, LogFoodResponse, DailySummary, UpdateProfileRequest,
    HistoricalComparison
)
from app.models.db_models import User
from app.database import get_db
from app.services.calorie_service import calorie_service
from app.auth import (
    get_password_hash, authenticate_user, create_access_token,
    get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES
)
from app.constants import SUCCESS_MESSAGES, ERROR_MESSAGES

router = APIRouter()


@router.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "message": "CaloriePal API is running"
    }


# Authentication Endpoints
@router.post("/auth/register", response_model=UserProfile, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if username already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    print(user_data)
    hashed_password = get_password_hash(user_data.password)
    print(hashed_password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        is_onboarded=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with username and password"""
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/auth/me", response_model=UserProfile)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current logged-in user information"""
    return current_user


@router.post("/auth/onboarding", response_model=UserProfile)
async def complete_onboarding(
    onboarding_data: OnboardingData,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete user onboarding with profile details"""
    current_user.name = onboarding_data.name
    current_user.weight_kg = onboarding_data.weight_kg
    current_user.height_cm = onboarding_data.height_cm
    current_user.age = onboarding_data.age
    current_user.gender = onboarding_data.gender
    current_user.goal = onboarding_data.goal
    current_user.lifestyle = onboarding_data.lifestyle
    current_user.exercise_frequency = onboarding_data.exercise_frequency
    current_user.is_onboarded = True
    
    db.commit()
    db.refresh(current_user)
    return current_user


# Food Logging Endpoints
@router.post("/log-food", response_model=LogFoodResponse)
async def log_food(
    request: LogFoodRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Log food from natural language description and/or images
    
    Example: {"description": "2 eggs and toast"}
    Example with image: {"description": "breakfast", "images": ["base64_encoded_image"]}
    Example image only: {"images": ["base64_encoded_image"]}
    Example combined meal: {"description": "rice and curry", "combine_as_meal": true, "meal_type": "lunch"}
    """
    try:
        # Check if at least one input is provided
        if not request.description.strip() and not request.images:
            raise HTTPException(
                status_code=400,
                detail="Please provide either a text description or upload an image"
            )
        
        # Validate meal_type if combine_as_meal is true
        if request.combine_as_meal and (not request.meal_type or not request.meal_type.strip()):
            raise HTTPException(
                status_code=400,
                detail="Please specify a meal type when combining as meal"
            )
        
        entries = calorie_service.log_food(
            current_user.id, 
            request.description, 
            db, 
            images=request.images,
            combine_as_meal=request.combine_as_meal,
            meal_type=request.meal_type
        )
        
        if not entries:
            raise HTTPException(
                status_code=400,
                detail=ERROR_MESSAGES["no_food_parsed"]
            )
        
        return LogFoodResponse(
            success=True,
            entries=entries,
            message=SUCCESS_MESSAGES["food_logged"].format(count=len(entries))
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary", response_model=DailySummary)
async def get_summary(
    date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get daily summary with AI-powered insights for a specific date (defaults to today)

    Provides totals and personalized nutrition advice based on user profile
    """
    try:
        from datetime import datetime, date as date_type
        target_date = datetime.strptime(date, "%Y-%m-%d").date() if date else date_type.today()
        summary = calorie_service.get_daily_summary(current_user.id, db, target_date=target_date)
        return DailySummary(**summary)
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/entries")
async def get_entries(
    date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all logged entries for a specific date (defaults to today)"""
    from datetime import datetime, date as date_type
    target_date = datetime.strptime(date, "%Y-%m-%d").date() if date else date_type.today()
    entries = calorie_service.get_entries(current_user.id, db, target_date=target_date)
    return {
        "entries": entries,
        "count": len(entries),
        "date": str(target_date)
    }


@router.delete("/entries")
async def clear_entries(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all logged entries for today only (does not affect historical data)"""
    from datetime import date as date_type
    today = date_type.today()
    deleted_count = calorie_service.clear_entries(current_user.id, db, target_date=today)
    return {
        "message": SUCCESS_MESSAGES["entries_cleared"].format(count=deleted_count, date=today),
        "success": True,
        "date": str(today)
    }


@router.delete("/entries/{entry_id}")
async def delete_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific food entry by ID (only if it belongs to the current user)"""
    from app.models.db_models import FoodEntry as DBFoodEntry, MealItem as DBMealItem
    
    entry = db.query(DBFoodEntry).filter(
        DBFoodEntry.id == entry_id,
        DBFoodEntry.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(
            status_code=404,
            detail="Entry not found or does not belong to you"
        )
    
    # Explicitly delete associated meal items if SQLite PRAGMAs aren't strictly on
    db.query(DBMealItem).filter(DBMealItem.meal_entry_id == entry.id).delete(synchronize_session=False)
    
    db.delete(entry)
    db.commit()
    
    return {
        "message": SUCCESS_MESSAGES["entry_deleted"],
        "success": True,
        "deleted_entry_id": entry_id
    }


@router.put("/profile", response_model=UserProfile)
async def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile"""
    update_data = request.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        if hasattr(current_user, key) and value is not None:
            setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/history", response_model=HistoricalComparison)
async def get_historical_data(
    days: int = 7,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get historical nutrition data for comparison
    
    Parameters:
    - days: Number of days to retrieve (default: 7, can be 7 or 30)
    
    Returns daily totals for protein, calories, fat, and carbs for the specified period
    """
    if days not in [7, 30]:
        raise HTTPException(
            status_code=400,
            detail="Days parameter must be either 7 or 30"
        )
    
    try:
        history = calorie_service.get_historical_data(current_user.id, days, db)
        return HistoricalComparison(**history)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/weekly-progress")
async def get_weekly_progress_data(
    date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get weekly progress for a specific date
    """
    from datetime import datetime
    try:
        if date:
            target_date = datetime.strptime(date, "%Y-%m-%d").date()
        else:
            target_date = datetime.now().date()
            
        return calorie_service.get_weekly_progress(current_user.id, target_date, db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

