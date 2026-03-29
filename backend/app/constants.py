"""
Constants and prompt templates for the AI Calorie Tracker application.

This file centralizes all prompts, system messages, and configuration constants
to make them easily modifiable without searching through the codebase.
"""

# ============================================================================
# AI MODEL CONFIGURATION
# ============================================================================

# Temperature settings for different LLM operations
FOOD_PARSING_TEMPERATURE = 0.1  # Low temperature for consistent parsing
INSIGHTS_TEMPERATURE = 0.7       # Higher temperature for creative insights
MEAL_SUMMARY_TEMPERATURE = 0.3   # Moderate temperature for meal summaries

# Token limits
FOOD_PARSING_MAX_TOKENS = 1000
INSIGHTS_MAX_TOKENS = 400
MEAL_SUMMARY_MAX_TOKENS = 150


# ============================================================================
# FOOD PARSING PROMPTS
# ============================================================================

FOOD_PARSING_SYSTEM_MESSAGE = (
    "You are a nutrition expert. Parse food descriptions and/or analyze food images into structured JSON. "
    "Return ONLY valid JSON array."
)

FOOD_PARSING_WITH_IMAGE_INSTRUCTION = """IMPORTANT: You are analyzing food items from both the text description AND the provided image(s).
- The text description may or may not match what's in the images
- Analyze both sources independently and combine all food items found
- If text describes foods not visible in images, include them based on the description
- If images show foods not mentioned in text, include them based on visual analysis
- For foods present in both, use the image for visual estimation and text for additional context"""

FOOD_PARSING_IMAGE_ONLY_PROMPT_TEMPLATE = """Analyze the food items in the provided image(s) and parse them into structured meal entries.

CONTEXT: This app is primarily used in India. Focus on Indian foods, cooking styles, and typical portion sizes commonly used in India.

IMPORTANT RULES:
1. Use SHORT, concise food names (max 2-3 words)
2. ONLY combine items that make NO SENSE separately:
   - Protein powder + water/milk = "Whey Shake" or "Protein Shake"
   - Oats + milk = "Oats w/ Milk"
   - Coffee/Tea + milk/sugar = "Coffee" or "Tea"
   - Cereal + milk = "Cereal w/ Milk"
3. KEEP SEPARATE for main meal components:
   - Keep chapati/roti, curry, dal, rice, sabzi as separate entries
   - Keep vegetables, proteins, grains separate
   - Each main dish component should be its own entry
4. Use Indian portion terminology when appropriate (bowl, katori, piece, serving, plate)

Return ONLY a JSON array. Each entry must have:
- "food": SHORT name (2-3 words max)
- "portion": amount (use Indian units when appropriate)
- "calories": estimated calories (number)
- "protein": grams (number)
- "fat": grams (number)
- "carbs": grams (number)

Return ONLY the JSON array, no explanations."""

FOOD_PARSING_PROMPT_TEMPLATE = """Parse this food description into structured meal entries: "{user_input}"

CONTEXT: This app is primarily used in India. Focus on Indian foods, cooking styles, and typical portion sizes commonly used in India.

IMPORTANT RULES:
1. Use SHORT, concise food names (max 2-3 words)
2. ONLY combine items that make NO SENSE separately:
   - Protein powder + water/milk = "Whey Shake" or "Protein Shake"
   - Oats + milk = "Oats w/ Milk"
   - Coffee/Tea + milk/sugar = "Coffee" or "Tea"
   - Cereal + milk = "Cereal w/ Milk"
   - Dosa + chutney/sambar mentioned together can be kept separate or together based on context
3. KEEP SEPARATE for main meal components:
   - Keep chapati/roti, curry, dal, rice, sabzi as separate entries
   - Keep vegetables, proteins, grains separate
   - Each main dish component should be its own entry
4. Use Indian portion terminology when appropriate (bowl, katori, piece, serving, plate)

Return ONLY a JSON array. Each entry must have:
- "food": SHORT name (2-3 words max)
- "portion": amount (use Indian units when appropriate)
- "calories": estimated calories (number)
- "protein": grams (number)
- "fat": grams (number)
- "carbs": grams (number)

Example input: "2 chapati with paneer curry and dal"
Example output: [{{"food": "Chapati", "portion": "2 pcs", "calories": <number>, "protein": <number>, "fat": <number>, "carbs": <number>}}, {{"food": "Paneer Curry", "portion": "1 bowl", "calories": <number>, "protein": <number>, "fat": <number>, "carbs": <number>}}, {{"food": "Dal", "portion": "1 bowl", "calories": <number>, "protein": <number>, "fat": <number>, "carbs": <number>}}]

Example input: "poha with chai"
Example output: [{{"food": "Poha", "portion": "1 plate", "calories": <number>, "protein": <number>, "fat": <number>, "carbs": <number>}}, {{"food": "Chai", "portion": "1 cup", "calories": <number>, "protein": <number>, "fat": <number>, "carbs": <number>}}]

Note: Replace <number> with your actual estimated values based on typical Indian portions and recipes.

Return ONLY the JSON array, no explanations."""


# ============================================================================
# MEAL SUMMARY PROMPTS (for combined meal entries)
# ============================================================================

MEAL_SUMMARY_SYSTEM_MESSAGE = (
    "You are a nutrition expert. Create concise meal summaries."
)

MEAL_SUMMARY_PROMPT_TEMPLATE = """Create a brief, natural summary of these food items for a {meal_type} entry:

{food_items}

Provide a short description (max 10 words) that captures the essence of the meal.
Examples:
- "Chapati, paneer curry, dal" -> "North Indian meal"
- "Rice, chicken curry, vegetables" -> "Chicken rice bowl"
- "Eggs, toast, juice" -> "Light breakfast"
- "Pasta, salad, garlic bread" -> "Italian meal"

Return ONLY the short description, nothing else."""


# ============================================================================
# NUTRITION INSIGHTS PROMPTS
# ============================================================================

INSIGHTS_SYSTEM_MESSAGE = (
    "You are a certified nutrition coach. Provide personalized, actionable insights."
)

INSIGHTS_PROMPT_TEMPLATE = """User Profile:
- Weight: {weight}kg, Height: {height}cm (BMI: {bmi:.1f})
- Age: {age}, Gender: {gender}
- Goal: {goal}
- Lifestyle: {lifestyle}
- Exercise: {exercise}

Today's meals:
{food_summary}

Totals: {total_cal:.0f} cal, {total_protein:.1f}g protein, {total_fat:.1f}g fat, {total_carbs:.1f}g carbs

Provide personalized insights (3-4 sentences) in UNDER 150 WORDS:
1. How well does this align with their goal?
2. Macronutrient balance assessment
3. Specific suggestions for improvement

IMPORTANT: Keep your response under 150 words. Be concise and actionable."""


# ============================================================================
# UI/RESPONSE MESSAGES
# ============================================================================

ERROR_MESSAGES = {
    "no_food_parsed": "Could not parse food items. Please provide more details.",
    "user_not_found": "User not found",
    "no_entries_today": "No entries logged today.",
    "insights_generation_failed": "Could not generate insights: {error}",
}

SUCCESS_MESSAGES = {
    "food_logged": "Successfully logged {count} food item(s)",
    "entries_cleared": "Cleared {count} entries for {date}",
    "entry_deleted": "Entry deleted successfully",
}
