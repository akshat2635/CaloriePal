from groq import Groq
import json
from datetime import datetime, date, timedelta
from typing import List, Dict, Optional
from sqlalchemy.orm import Session, selectinload
from app.config import get_settings
from app.models.schemas import FoodEntry, FoodEntryWithTime
from app.models.db_models import User, FoodEntry as DBFoodEntry, MealItem as DBMealItem
from app.constants import (
    FOOD_PARSING_SYSTEM_MESSAGE,
    FOOD_PARSING_PROMPT_TEMPLATE,
    FOOD_PARSING_IMAGE_ONLY_PROMPT_TEMPLATE,
    FOOD_PARSING_WITH_IMAGE_INSTRUCTION,
    FOOD_PARSING_TEMPERATURE,
    FOOD_PARSING_MAX_TOKENS,
    MEAL_SUMMARY_SYSTEM_MESSAGE,
    MEAL_SUMMARY_PROMPT_TEMPLATE,
    MEAL_SUMMARY_TEMPERATURE,
    MEAL_SUMMARY_MAX_TOKENS,
    INSIGHTS_SYSTEM_MESSAGE,
    INSIGHTS_PROMPT_TEMPLATE,
    INSIGHTS_TEMPERATURE,
    INSIGHTS_MAX_TOKENS,
    ERROR_MESSAGES,
)


class CalorieService:
    def __init__(self):
        settings = get_settings()
        self.client = Groq(api_key=settings.groq_api_key)
        self.model = settings.groq_model
    
    def calculate_bmr(self, weight_kg: float, height_cm: float, age: int, gender: str) -> float:
        """Calculate Basal Metabolic Rate using Mifflin-St Jeor equation"""
        if gender.lower() == "male":
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
        else:  # female
            bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
        return round(bmr, 1)
    
    def calculate_tdee(self, bmr: float, lifestyle: str) -> float:
        """Calculate Total Daily Energy Expenditure based on activity level"""
        activity_multipliers = {
            "sedentary": 1.2,                    # Little or no exercise
            "lightly_active": 1.375,             # Light exercise 1-3 days/week
            "moderately_active": 1.55,           # Moderate exercise 3-5 days/week
            "very_active": 1.725,                # Hard exercise 6-7 days/week
            "extremely_active": 1.9              # Very hard exercise, physical job
        }
        multiplier = activity_multipliers.get(lifestyle.lower(), 1.55)  # default to moderately active
        tdee = bmr * multiplier
        return round(tdee, 1)
    
    def calculate_calorie_target(self, tdee: float, goal: str) -> float:
        """Calculate daily calorie target based on user's goal"""
        goal_adjustments = {
            "weight_loss": -500,        # 500 calorie deficit
            "maintenance": 0,           # Maintain current weight
            "muscle_building": 300      # 300 calorie surplus
        }
        adjustment = goal_adjustments.get(goal.lower(), 0)
        target = tdee + adjustment
        return round(target, 1)
    
    def calculate_macro_targets(self, calorie_target: float, weight_kg: float, goal: str) -> dict:
        """Calculate macro nutrient targets based on goal"""
        # Protein targets (in grams per kg body weight)
        protein_ratios = {
            "weight_loss": 1.8,         # Higher protein to preserve muscle
            "maintenance": 1.6,         # Moderate protein
            "muscle_building": 2.2      # Higher protein for muscle building
        }
        
        protein_g = weight_kg * protein_ratios.get(goal.lower(), 1.6)
        protein_calories = protein_g * 4  # 4 calories per gram
        
        # Fat: 25-30% of total calories
        fat_calories = calorie_target * 0.275  # 27.5% average
        fat_g = fat_calories / 9  # 9 calories per gram
        
        # Carbs: remaining calories
        carbs_calories = calorie_target - protein_calories - fat_calories
        carbs_g = carbs_calories / 4  # 4 calories per gram
        
        return {
            "calories": round(calorie_target, 1),
            "protein": round(protein_g, 1),
            "fat": round(fat_g, 1),
            "carbs": round(carbs_g, 1)
        }
    
    def parse_food_entry(self, user_input: str = "", images: Optional[List[str]] = None) -> List[FoodEntry]:
        """Parse user's natural language food input and/or images into structured entries using LLM"""
        
        # Build the message content based on what's provided
        content = []
        
        # Add text if provided
        if user_input and user_input.strip():
            text_prompt = FOOD_PARSING_PROMPT_TEMPLATE.format(user_input=user_input)
            if images:
                # If both text and images, add instruction for correlation
                text_prompt = FOOD_PARSING_WITH_IMAGE_INSTRUCTION + "\n\n" + text_prompt
            content.append({"type": "text", "text": text_prompt})
        elif images:
            # If only images, provide instruction to analyze images
            content.append({
                "type": "text", 
                "text": FOOD_PARSING_WITH_IMAGE_INSTRUCTION + "\n\n" + FOOD_PARSING_IMAGE_ONLY_PROMPT_TEMPLATE
            })
        else:
            # Neither text nor images provided
            return []
        
        # Add images if provided
        if images:
            for img_base64 in images:
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{img_base64}"
                    }
                })

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": FOOD_PARSING_SYSTEM_MESSAGE},
                    {"role": "user", "content": content}
                ],
                temperature=FOOD_PARSING_TEMPERATURE,
                max_tokens=FOOD_PARSING_MAX_TOKENS
            )
            
            response_content = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if response_content.startswith("```"):
                response_content = response_content.split("```")[1]
                if response_content.startswith("json"):
                    response_content = response_content[4:]
            response_content = response_content.strip()
            
            entries = json.loads(response_content)
            
            # Ensure it's a list
            if not isinstance(entries, list):
                entries = [entries]
            
            # Convert to FoodEntry objects
            return [FoodEntry(**entry) for entry in entries]
        
        except Exception as e:
            print(f"Error parsing food: {e}")
            return []
    
    def generate_meal_summary(self, food_items: List[FoodEntry], meal_type: str = "meal") -> str:
        """Generate a concise summary of food items for a combined meal entry"""
        
        # Create a list of food items for the prompt
        food_list = ", ".join([f"{entry.food} ({entry.portion})" for entry in food_items])
        
        prompt = MEAL_SUMMARY_PROMPT_TEMPLATE.format(
            meal_type=meal_type,
            food_items=food_list
        )
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": MEAL_SUMMARY_SYSTEM_MESSAGE},
                    {"role": "user", "content": prompt}
                ],
                temperature=MEAL_SUMMARY_TEMPERATURE,
                max_tokens=MEAL_SUMMARY_MAX_TOKENS
            )
            
            summary = response.choices[0].message.content.strip()
            # Remove any quotes if present
            summary = summary.strip('"').strip("'")
            return summary
        except Exception as e:
            print(f"Error generating meal summary: {e}")
            # Fallback to simple concatenation
            return f"{meal_type.title()} with {', '.join([entry.food for entry in food_items[:3]])}"
    
    def log_food(self, user_id: int, user_input: str, db: Session, images: Optional[List[str]] = None, 
                 combine_as_meal: bool = False, meal_type: str = None) -> List[FoodEntryWithTime]:
        """Log food from natural language input and/or images"""
        entries = self.parse_food_entry(user_input, images)
        
        if not entries:
            return []
        
        current_time = datetime.now().strftime("%H:%M")
        today = datetime.now().date()
        
        logged_entries = []
        
        # If combining as meal, create a single entry with summary
        if combine_as_meal and meal_type:
            raw_meal_name = (meal_type or "").strip()
            if raw_meal_name.lower() in {"breakfast", "lunch", "dinner", "snack", "snacks"}:
                display_meal_name = raw_meal_name.title()
            elif raw_meal_name:
                display_meal_name = raw_meal_name
            else:
                display_meal_name = "Meal"

            # Calculate totals
            total_calories = sum(e.calories for e in entries)
            total_protein = sum(e.protein for e in entries)
            total_fat = sum(e.fat for e in entries)
            total_carbs = sum(e.carbs for e in entries)
            
            # Generate meal summary
            meal_summary = self.generate_meal_summary(entries, display_meal_name)
            
            # Create single combined entry
            db_entry = DBFoodEntry(
                user_id=user_id,
                food=display_meal_name,
                portion=meal_summary,
                calories=total_calories,
                protein=total_protein,
                fat=total_fat,
                carbs=total_carbs,
                time=current_time,
                date=datetime.combine(today, datetime.min.time()),
                is_combined_meal=True,
                meal_summary=meal_summary,
            )
            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)

            for entry in entries:
                db.add(
                    DBMealItem(
                        meal_entry_id=db_entry.id,
                        food=entry.food,
                        portion=entry.portion,
                        calories=entry.calories,
                        protein=entry.protein,
                        fat=entry.fat,
                        carbs=entry.carbs,
                    )
                )

            db.commit()
            db.refresh(db_entry)
            
            logged_entries.append(FoodEntryWithTime(
                time=current_time,
                food=display_meal_name,
                portion=meal_summary,
                calories=total_calories,
                protein=total_protein,
                fat=total_fat,
                carbs=total_carbs,
                is_combined_meal=True,
                meal_summary=meal_summary,
                meal_items=entries,
            ))
        else:
            # Log individual entries
            for entry in entries:
                # Save to database
                db_entry = DBFoodEntry(
                    user_id=user_id,
                    food=entry.food,
                    portion=entry.portion,
                    calories=entry.calories,
                    protein=entry.protein,
                    fat=entry.fat,
                    carbs=entry.carbs,
                    time=current_time,
                    date=datetime.combine(today, datetime.min.time())
                )
                db.add(db_entry)
                db.commit()
                db.refresh(db_entry)
                
                logged_entries.append(FoodEntryWithTime(
                    time=current_time,
                    **entry.model_dump()
                ))
        
        return logged_entries
    
    def get_daily_summary(self, user_id: int, db: Session, target_date: date = None) -> Dict:
        """Get daily summary with AI insights"""
        
        if target_date is None:
            target_date = datetime.now().date()
        
        # Get user
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError(f"User with id {user_id} not found")
        
        # Get today's entries
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        entries = db.query(DBFoodEntry).filter(
            DBFoodEntry.user_id == user_id,
            DBFoodEntry.date >= start_of_day,
            DBFoodEntry.date <= end_of_day
        ).options(selectinload(DBFoodEntry.meal_items)).all()
        
        # Calculate BMI, BMR, TDEE, and targets
        height_m = user.height_cm / 100
        bmi = user.weight_kg / (height_m ** 2)
        bmr = self.calculate_bmr(user.weight_kg, user.height_cm, user.age, user.gender)
        tdee = self.calculate_tdee(bmr, user.lifestyle)
        calorie_target = self.calculate_calorie_target(tdee, user.goal)
        targets = self.calculate_macro_targets(calorie_target, user.weight_kg, user.goal)
        
        if not entries:
            remaining = {
                "calories": targets["calories"],
                "protein": targets["protein"],
                "fat": targets["fat"],
                "carbs": targets["carbs"]
            }
            
            return {
                "user": user,
                "entries": [],
                "total_calories": 0,
                "total_protein": 0,
                "total_fat": 0,
                "total_carbs": 0,
                "bmi": round(bmi, 1),
                "bmr": bmr,
                "tdee": tdee,
                "targets": targets,
                "remaining": remaining,
                "ai_insights": ERROR_MESSAGES["no_entries_today"]
            }
        
        # Calculate totals
        total_cal = sum(e.calories for e in entries)
        total_protein = sum(e.protein for e in entries)
        total_fat = sum(e.fat for e in entries)
        total_carbs = sum(e.carbs for e in entries)
        
        # Calculate remaining macros
        remaining = {
            "calories": round(targets["calories"] - total_cal, 1),
            "protein": round(targets["protein"] - total_protein, 1),
            "fat": round(targets["fat"] - total_fat, 1),
            "carbs": round(targets["carbs"] - total_carbs, 1)
        }
        
        # Get AI insights
        food_summary_lines = []
        for e in entries:
            if getattr(e, 'is_combined_meal', False) and e.meal_items:
                food_summary_lines.append(f"- {e.food} ({e.portion}): {e.calories} cal, {e.protein}g protein. Contains:")
                for item in e.meal_items:
                    food_summary_lines.append(f"  * {item.food} ({item.portion}): {item.calories} cal, {item.protein}g protein, {item.fat}g fat, {item.carbs}g carbs")
            else:
                food_summary_lines.append(f"- {e.food} ({e.portion}): {e.calories} cal, {e.protein}g protein, {e.fat}g fat, {e.carbs}g carbs")
                
        food_summary = "\n".join(food_summary_lines)
        
        insights_prompt = INSIGHTS_PROMPT_TEMPLATE.format(
            weight=user.weight_kg,
            height=user.height_cm,
            bmi=bmi,
            age=user.age,
            gender=user.gender,
            goal=user.goal,
            lifestyle=user.lifestyle,
            exercise=user.exercise_frequency,
            bmr=bmr,
            tdee=tdee,
            target_calories=calorie_target,
            target_protein=targets["protein"],
            target_fat=targets["fat"],
            target_carbs=targets["carbs"],
            food_summary=food_summary,
            total_cal=total_cal,
            total_protein=total_protein,
            total_fat=total_fat,
            total_carbs=total_carbs
        )

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": INSIGHTS_SYSTEM_MESSAGE},
                    {"role": "user", "content": insights_prompt}
                ],
                temperature=INSIGHTS_TEMPERATURE,
                max_tokens=INSIGHTS_MAX_TOKENS
            )
            
            insights = response.choices[0].message.content
        except Exception as e:
            insights = ERROR_MESSAGES["insights_generation_failed"].format(error=str(e))
        
        return {
            "user": user,
            "entries": entries,
            "total_calories": total_cal,
            "total_protein": total_protein,
            "total_fat": total_fat,
            "total_carbs": total_carbs,
            "bmi": round(bmi, 1),
            "bmr": bmr,
            "tdee": tdee,
            "targets": targets,
            "remaining": remaining,
            "ai_insights": insights
        }
    
    def get_entries(self, user_id: int, db: Session, target_date: date = None) -> List[DBFoodEntry]:
        """Get all entries for a specific date"""
        if target_date is None:
            target_date = datetime.now().date()
        
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        return db.query(DBFoodEntry).filter(
            DBFoodEntry.user_id == user_id,
            DBFoodEntry.date >= start_of_day,
            DBFoodEntry.date <= end_of_day
        ).options(selectinload(DBFoodEntry.meal_items)).all()
    
    def clear_entries(self, user_id: int, db: Session, target_date: date = None) -> int:
        """Clear all entries for a specific date (defaults to today). Returns count of deleted entries."""
        if target_date is None:
            target_date = datetime.now().date()
        
        start_of_day = datetime.combine(target_date, datetime.min.time())
        end_of_day = datetime.combine(target_date, datetime.max.time())
        
        # Count entries before deletion for return value
        entries_to_delete = db.query(DBFoodEntry).filter(
            DBFoodEntry.user_id == user_id,
            DBFoodEntry.date >= start_of_day,
            DBFoodEntry.date <= end_of_day
        ).all()
        
        count = len(entries_to_delete)
        if count > 0:
            entry_ids = [entry.id for entry in entries_to_delete]
            
            # Explicitly delete associated meal items to avoid orphans
            db.query(DBMealItem).filter(DBMealItem.meal_entry_id.in_(entry_ids)).delete(synchronize_session=False)
            
            # Delete entries for the specific date only
            db.query(DBFoodEntry).filter(
                DBFoodEntry.id.in_(entry_ids)
            ).delete(synchronize_session=False)
            
            db.commit()
        
        return count
    
    def get_weekly_progress(self, user_id: int, target_date: date, db: Session) -> Dict:
        """Get weekly progress with ranges for a given date"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
            
        # Determine the start (Monday) and end (Sunday) of the week for target_date
        # weekday() returns 0 for Monday, 6 for Sunday
        start_date = target_date - timedelta(days=target_date.weekday())
        end_date = start_date + timedelta(days=6)
        
        bmr = self.calculate_bmr(user.weight_kg, user.height_cm, user.age, user.gender)
        tdee = self.calculate_tdee(bmr, user.lifestyle)
        calorie_target = self.calculate_calorie_target(tdee, user.goal)
        macro_targets = self.calculate_macro_targets(calorie_target, user.weight_kg, user.goal)
        
        # Build targets with min/max ranges
        metrics = {
            "calories": { "target": calorie_target, "min": calorie_target - 100, "max": calorie_target + 100 },
            "protein": { "target": macro_targets["protein"], "min": macro_targets["protein"] - 10, "max": macro_targets["protein"] + 10 },
            "carbs": { "target": macro_targets["carbs"], "min": macro_targets["carbs"] - 10, "max": macro_targets["carbs"] + 10 },
            "fat": { "target": macro_targets["fat"], "min": macro_targets["fat"] - 10, "max": macro_targets["fat"] + 10 }
        }
        
        daily_data = []
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            day_start = datetime.combine(current_date, datetime.min.time())
            day_end = datetime.combine(current_date, datetime.max.time())
            
            entries = db.query(DBFoodEntry).filter(
                DBFoodEntry.user_id == user_id,
                DBFoodEntry.date >= day_start,
                DBFoodEntry.date <= day_end
            ).all()
            
            day_calories = sum(e.calories for e in entries)
            day_protein = sum(e.protein for e in entries)
            day_fat = sum(e.fat for e in entries)
            day_carbs = sum(e.carbs for e in entries)
            
            daily_data.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "day_name": current_date.strftime("%a"),
                "calories": round(day_calories, 1),
                "protein": round(day_protein, 1),
                "fat": round(day_fat, 1),
                "carbs": round(day_carbs, 1)
            })
            
        return {
            "week_start": start_date.strftime("%Y-%m-%d"),
            "week_end": end_date.strftime("%Y-%m-%d"),
            "metrics": metrics,
            "daily_data": daily_data
        }

    def get_historical_data(self, user_id: int, days: int, db: Session) -> Dict:
        """Get historical nutrition data for the last N days"""
        today = datetime.now().date()
        start_date = today - timedelta(days=days - 1)
        
        # Query to get daily aggregates
        daily_data = []
        total_calories = 0
        total_protein = 0
        total_fat = 0
        total_carbs = 0
        
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            day_start = datetime.combine(current_date, datetime.min.time())
            day_end = datetime.combine(current_date, datetime.max.time())
            
            entries = db.query(DBFoodEntry).filter(
                DBFoodEntry.user_id == user_id,
                DBFoodEntry.date >= day_start,
                DBFoodEntry.date <= day_end
            ).all()
            
            day_calories = sum(e.calories for e in entries)
            day_protein = sum(e.protein for e in entries)
            day_fat = sum(e.fat for e in entries)
            day_carbs = sum(e.carbs for e in entries)
            
            daily_data.append({
                "date": current_date.strftime("%Y-%m-%d"),
                "calories": round(day_calories, 1),
                "protein": round(day_protein, 1),
                "fat": round(day_fat, 1),
                "carbs": round(day_carbs, 1),
                "entry_count": len(entries)
            })
            
            total_calories += day_calories
            total_protein += day_protein
            total_fat += day_fat
            total_carbs += day_carbs
        
        # Calculate averages
        averages = {
            "calories": round(total_calories / days, 1),
            "protein": round(total_protein / days, 1),
            "fat": round(total_fat / days, 1),
            "carbs": round(total_carbs / days, 1)
        }
        
        totals = {
            "calories": round(total_calories, 1),
            "protein": round(total_protein, 1),
            "fat": round(total_fat, 1),
            "carbs": round(total_carbs, 1)
        }
        
        return {
            "period_days": days,
            "daily_data": daily_data,
            "averages": averages,
            "totals": totals
        }


# Singleton instance
calorie_service = CalorieService()
