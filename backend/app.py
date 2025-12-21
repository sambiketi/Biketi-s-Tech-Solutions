from flask import Flask, request, jsonify
from flask_cors import CORS
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import jwt
import bcrypt
from datetime import datetime, timedelta
from functools import wraps
import os
from dotenv import load_dotenv

# Load environment variables with priority
env_file = '.env.supabase' if os.path.exists('.env.supabase') else '.env'
load_dotenv(env_file)

# Also load production env vars if they exist
if os.path.exists('.env.production'):
    load_dotenv('.env.production', override=True)

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

# Configure CORS
cors_origins = os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://localhost:3000')
origins = [origin.strip() for origin in cors_origins.split(',')]

# Add Render frontend URL in production
if os.getenv('FLASK_ENV') == 'production':
    frontend_url = os.getenv('FRONTEND_URL', 'https://biketi-frontend.onrender.com')
    if frontend_url not in origins:
        origins.append(frontend_url)

CORS(app, resources={r"/*": {"origins": origins}})

# Database setup - Supabase compatible
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///agency.db')
# Force psycopg v3 for PostgreSQL (Python 3.13 compatible)
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )

engine = create_engine(
    DATABASE_URL,
    pool_size=5,
    max_overflow=10,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"sslmode": "require"} if DATABASE_URL.startswith("postgresql+psycopg://") else {}
)


SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models (keep your existing models)
class Service(Base):
    __tablename__ = 'services'
    
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(50), unique=True, nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text)
    icon = Column(String(50))
    category = Column(String(50), default='service')
    form_fields = Column(JSON, default=list)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    submissions = relationship("Submission", back_populates="service")

class Post(Base):
    __tablename__ = 'posts'
    
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(20), default='blog')  # 'blog' or 'case-study'
    slug = Column(String(255), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    excerpt = Column(String(300))
    cover_image_url = Column(Text)
    is_published = Column(Boolean, default=False)
    published_at = Column(DateTime)
    author_name = Column(String(100))
    meta_tags = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Course(Base):
    __tablename__ = 'courses'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text)
    difficulty = Column(String(20), default='beginner')
    duration_minutes = Column(Integer)
    thumbnail_url = Column(Text)
    content_url = Column(Text)
    price_cents = Column(Integer, default=0)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Submission(Base):
    __tablename__ = 'submissions'
    
    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey('services.id'), nullable=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    company = Column(String(100))
    phone = Column(String(20))
    message = Column(Text)
    status = Column(String(20), default='new')  # 'new', 'reviewed', 'contacted', 'archived'
    created_at = Column(DateTime, default=datetime.utcnow)
    
    service = relationship("Service", back_populates="submissions")
    files = relationship("SubmissionFile", back_populates="submission", cascade="all, delete-orphan")

class SubmissionFile(Base):
    __tablename__ = 'submission_files'
    
    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey('submissions.id'), nullable=False)
    original_name = Column(String(255), nullable=False)
    storage_path = Column(Text, nullable=False)
    file_type = Column(String(50))
    file_size_bytes = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    
    submission = relationship("Submission", back_populates="files")

class AdminUser(Base):
    __tablename__ = 'admin_users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), default='editor')  # 'admin' or 'editor'
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

# Create tables
Base.metadata.create_all(bind=engine)

# Helper functions
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except:
                return jsonify({'error': 'Token malformed'}), 401
        
        if not token:
            return jsonify({'error': 'Token missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            db = next(get_db())
            current_user = db.query(AdminUser).filter(AdminUser.id == data['user_id'], AdminUser.is_active == True).first()
            
            if not current_user:
                return jsonify({'error': 'User not found or inactive'}), 401
                
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(current_user, db, *args, **kwargs)
    
    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(current_user, *args, **kwargs):
        if current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(current_user, *args, **kwargs)
    return decorated

def generate_token(user_id, username, role):
    token = jwt.encode({
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=2)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return token

# Routes
@app.route('/')
def home():
    db_status = "connected" if engine else "disconnected"
    return jsonify({
        'message': 'Agency Platform API', 
        'version': '1.0.0',
        'environment': os.getenv('FLASK_ENV', 'development'),
        'database': db_status,
        'cors_origins': origins
    })

@app.route('/api/v1/health')
def health():
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return jsonify({
        'status': 'healthy', 
        'timestamp': datetime.utcnow().isoformat(),
        'database': db_status,
        'environment': os.getenv('FLASK_ENV', 'development')
    })

# Auth routes
@app.route('/api/v1/admin/login', methods=['POST'])
def admin_login():
    try:
        data = request.get_json()
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({'error': 'Username and password required'}), 400
        
        db = next(get_db())
        user = db.query(AdminUser).filter(AdminUser.username == username, AdminUser.is_active == True).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.commit()
        
        # Generate token
        token = generate_token(user.id, user.username, user.role)
        
        return jsonify({
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'role': user.role
            },
            'message': 'Login successful'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/admin/verify-token', methods=['POST'])
@token_required
def verify_token(current_user, db):
    return jsonify({'valid': True, 'user': {
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'role': current_user.role
    }})

# Dashboard routes
@app.route('/api/v1/admin/dashboard/stats', methods=['GET'])
@token_required
def get_dashboard_stats(current_user, db):
    try:
        total_submissions = db.query(Submission).count()
        new_submissions = db.query(Submission).filter(Submission.status == 'new').count()
        total_posts = db.query(Post).count()
        published_posts = db.query(Post).filter(Post.is_published == True).count()
        total_courses = db.query(Course).count()
        published_courses = db.query(Course).filter(Course.is_published == True).count()
        
        return jsonify({
            'stats': {
                'submissions': {
                    'total': total_submissions,
                    'new': new_submissions,
                    'reviewed': db.query(Submission).filter(Submission.status == 'reviewed').count(),
                    'contacted': db.query(Submission).filter(Submission.status == 'contacted').count()
                },
                'posts': {
                    'total': total_posts,
                    'published': published_posts,
                    'drafts': total_posts - published_posts
                },
                'courses': {
                    'total': total_courses,
                    'published': published_courses,
                    'drafts': total_courses - published_courses
                }
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Public routes
@app.route('/api/v1/services', methods=['GET'])
def get_services():
    try:
        db = next(get_db())
        services = db.query(Service).filter(Service.is_active == True).all()
        
        return jsonify([{
            'id': s.id,
            'slug': s.slug,
            'title': s.title,
            'description': s.description,
            'icon': s.icon,
            'category': s.category,
            'form_fields': s.form_fields or []
        } for s in services])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/services/<string:slug>', methods=['GET'])
def get_service(slug):
    try:
        db = next(get_db())
        service = db.query(Service).filter(Service.slug == slug, Service.is_active == True).first()
        
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        
        return jsonify({
            'id': service.id,
            'slug': service.slug,
            'title': service.title,
            'description': service.description,
            'icon': service.icon,
            'category': service.category,
            'form_fields': service.form_fields or []
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/services/<string:slug>/submit', methods=['POST'])
def submit_service_request(slug):
    try:
        db = next(get_db())
        service = db.query(Service).filter(Service.slug == slug, Service.is_active == True).first()
        
        if not service:
            return jsonify({'error': 'Service not found'}), 404
        
        data = request.get_json()
        
        submission = Submission(
            service_id=service.id,
            full_name=data.get('full_name', '').strip(),
            email=data.get('email', '').strip(),
            company=data.get('company', '').strip(),
            phone=data.get('phone', '').strip(),
            message=data.get('message', '').strip(),
            status='new'
        )
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
        return jsonify({
            'message': 'Submission received successfully',
            'submission_id': submission.id
        }), 201
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500

# Admin CRUD routes
@app.route('/api/v1/admin/submissions', methods=['GET'])
@token_required
def get_submissions(current_user, db):
    try:
        status_filter = request.args.get('status')
        service_filter = request.args.get('service')
        
        query = db.query(Submission)
        
        if status_filter:
            query = query.filter(Submission.status == status_filter)
        
        if service_filter:
            query = query.join(Service).filter(Service.slug == service_filter)
        
        submissions = query.order_by(Submission.created_at.desc()).all()
        
        return jsonify([{
            'id': s.id,
            'service_id': s.service_id,
            'service_slug': s.service.slug if s.service else None,
            'full_name': s.full_name,
            'email': s.email,
            'company': s.company,
            'phone': s.phone,
            'message': s.message,
            'status': s.status,
            'created_at': s.created_at.isoformat() if s.created_at else None
        } for s in submissions])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/v1/admin/submissions/<int:submission_id>', methods=['PUT'])
@token_required
def update_submission(current_user, db, submission_id):
    try:
        data = request.get_json()
        new_status = data.get('status')
        
        if new_status not in ['new', 'reviewed', 'contacted', 'archived']:
            return jsonify({'error': 'Invalid status'}), 400
        
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        submission.status = new_status
        db.commit()
        
        return jsonify({
            'message': 'Submission updated successfully',
            'submission': {
                'id': submission.id,
                'status': submission.status
            }
        })
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500

# Init demo data
@app.route('/api/v1/init-demo', methods=['POST'])
def init_demo_data():
    try:
        db = next(get_db())
        
        # Create admin user if none exists
        if db.query(AdminUser).count() == 0:
            admin = AdminUser(
                username='admin',
                email='admin@agency.com',
                role='admin',
                is_active=True
            )
            admin.set_password('admin123')
            db.add(admin)
        
        # Create services if none exist
        if db.query(Service).count() == 0:
            services = [
                Service(
                    slug='data-analysis',
                    title='Data Analysis',
                    description='Transform raw data into actionable insights with advanced analytics and visualization.',
                    icon='ChartBar',
                    category='analytics'
                ),
                Service(
                    slug='digital-marketing',
                    title='Digital Marketing',
                    description='Reach your target audience with data-driven marketing strategies and campaigns.',
                    icon='TrendingUp',
                    category='marketing'
                ),
                Service(
                    slug='graphic-design',
                    title='Graphic Design',
                    description='Create compelling visual identities that communicate your brand story effectively.',
                    icon='Palette',
                    category='design'
                ),
                Service(
                    slug='web-creation',
                    title='Web Creation',
                    description='Build modern, responsive websites and web applications that drive conversions.',
                    icon='Code',
                    category='development'
                )
            ]
            for service in services:
                db.add(service)
        
        db.commit()
        
        return jsonify({
            'message': 'Demo data initialized successfully',
            'admin_credentials': {
                'username': 'admin',
                'password': 'admin123'
            }
        })
        
    except Exception as e:
        db.rollback()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 Agency Platform API Starting...")
    print(f"📊 Health: GET http://localhost:5000/api/v1/health")
    print(f"🔐 Login: POST http://localhost:5000/api/v1/admin/login")
    print(f"📈 Dashboard: GET http://localhost:5000/api/v1/admin/dashboard/stats")
    print(f"🛠️  Init Demo: POST http://localhost:5000/api/v1/init-demo")
    print(f"👤 Default: admin / admin123")
    print(f"🌍 CORS Origins: {origins}")
    app.run(host='0.0.0.0', port=5000, debug=True)
