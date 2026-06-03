from sqlalchemy import Column, Integer, String
from app.db.database import Base

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    roll_number = Column(String(20), unique=True, nullable=False)
    class_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, nullable=True)