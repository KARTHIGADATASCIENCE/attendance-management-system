import sys
sys.path.append('.')
from app.db.database import SessionLocal, engine, Base
from app.api.models.admin import Admin
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

db = SessionLocal()

existing = db.query(Admin).filter(Admin.username == "admin").first()
if existing:
    print("Admin already exists, updating password...")
    existing.hashed_password = hash_password("admin123")
else:
    print("Creating admin user...")
    admin = Admin(username="admin", hashed_password=hash_password("admin123"))
    db.add(admin)

db.commit()
db.close()
print("Done! Admin login: admin / admin123")
