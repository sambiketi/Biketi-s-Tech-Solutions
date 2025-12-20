# Add this at the top of your existing app.py:
import os
from dotenv import load_dotenv

# Load environment based on FLASK_ENV
if os.getenv('FLASK_ENV') == 'production':
    load_dotenv('.env.production')
else:
    load_dotenv('.env')

# Update DATABASE_URL for Render PostgreSQL
DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
# Then the rest of your existing app.py continues...
