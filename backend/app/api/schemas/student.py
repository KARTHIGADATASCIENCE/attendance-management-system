from pydantic import BaseModel, EmailStr
from typing import Optional

class StudentCreate(BaseModel):
    name: str
    roll_number: str
    class_name: str
    email: Optional[str] = None

class StudentUpdate(BaseModel):
    name: Optional[str] = None
    roll_number: Optional[str] = None
    class_name: Optional[str] = None
    email: Optional[str] = None

class StudentOut(BaseModel):
    id: int
    name: str
    roll_number: str
    class_name: str
    email: Optional[str] = None

    class Config:
        from_attributes = True