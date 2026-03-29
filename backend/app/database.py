from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

# SQLite database URL
SQLALCHEMY_DATABASE_URL = settings.database_url

# Create engine
# connect_args={"check_same_thread": False} is only for SQLite
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # If using Postgres on Render, Render uses 'postgres://' but SQLAlchemy 1.4+ requires 'postgresql://'
    if SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
        SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def ensure_schema_compatibility():
    """Apply lightweight SQLite migrations for backward compatibility."""
    # Skip these SQLite-specific pragmas if we are using PostgreSQL
    if not SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
        return
        
    with engine.begin() as conn:
        existing_tables = {
            row[0]
            for row in conn.execute(
                text("SELECT name FROM sqlite_master WHERE type='table'")
            ).fetchall()
        }

        if "food_entries" not in existing_tables:
            return

        existing_columns = {
            row[1] for row in conn.execute(text("PRAGMA table_info(food_entries)")).fetchall()
        }

        if "is_combined_meal" not in existing_columns:
            conn.execute(
                text(
                    "ALTER TABLE food_entries ADD COLUMN is_combined_meal BOOLEAN DEFAULT 0"
                )
            )

        if "meal_summary" not in existing_columns:
            conn.execute(text("ALTER TABLE food_entries ADD COLUMN meal_summary VARCHAR"))


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
