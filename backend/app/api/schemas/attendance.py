from pydantic import BaseModel
from typing import List
from datetime import date
from app.api.models.attendance import StatusEnum

class AttendanceCreate(BaseModel):
    student_id: int
    date: date
    status: StatusEnum

class BulkAttendanceItem(BaseModel):
    student_id: int
    status: StatusEnum

class BulkAttendanceCreate(BaseModel):
    date: date
    records: List[BulkAttendanceItem]

class AttendanceOut(BaseModel):
    id: int
    student_id: int
    date: date
    status: StatusEnum

    class Config:
        from_attributes = True

class AttendanceSummary(BaseModel):
    student_id: int
    student_name: str
    roll_number: str
    total_days: int
    present_days: int
    attendance_percentage: float