from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import Base, engine
from app.api.models import admin, student, attendance  # registers all models
from app.api import auth, students, attendance as attendance_router
from app.core.security import hash_password
from app.db.database import SessionLocal
from app.api.models.admin import Admin

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Attendance Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(attendance_router.router)

@app.on_event("startup")
def seed_admin():
    db = SessionLocal()
    try:
        existing = db.query(Admin).filter(Admin.username == "admin").first()
        if not existing:
            db.add(Admin(username="admin", hashed_password=hash_password("admin123")))
            db.commit()
            print("✅ Default admin created: admin / admin123")
    finally:
        db.close()

@app.get("/")
def root():
    return {"message": "Attendance Management System API is running"}