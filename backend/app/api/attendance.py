from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import date
import csv, io

from app.db.database import get_db
from app.api.schemas.attendance import AttendanceCreate, BulkAttendanceCreate, AttendanceOut, AttendanceSummary
from app.api.models.attendance import Attendance
from app.api.models.student import Student
from app.api.deps import get_current_admin

router = APIRouter(prefix="/attendance", tags=["Attendance"])

@router.post("/", response_model=AttendanceOut)
def mark_attendance(data: AttendanceCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    existing = db.query(Attendance).filter(
        Attendance.student_id == data.student_id,
        Attendance.date == data.date
    ).first()
    if existing:
        existing.status = data.status
        db.commit()
        db.refresh(existing)
        return existing
    record = Attendance(**data.model_dump())
    db.add(record)
    db.commit()
    db.refresh(record)
    return record

@router.post("/bulk")
def bulk_mark_attendance(data: BulkAttendanceCreate, db: Session = Depends(get_db), _=Depends(get_current_admin)):
    for item in data.records:
        existing = db.query(Attendance).filter(
            Attendance.student_id == item.student_id,
            Attendance.date == data.date
        ).first()
        if existing:
            existing.status = item.status
        else:
            db.add(Attendance(student_id=item.student_id, date=data.date, status=item.status))
    db.commit()
    return {"message": f"{len(data.records)} records saved for {data.date}"}

@router.get("/", response_model=List[AttendanceOut])
def get_attendance(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    student_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    query = db.query(Attendance)
    if date_from:
        query = query.filter(Attendance.date >= date_from)
    if date_to:
        query = query.filter(Attendance.date <= date_to)
    if student_id:
        query = query.filter(Attendance.student_id == student_id)
    return query.all()

@router.get("/report", response_model=List[AttendanceSummary])
def attendance_report(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    students = db.query(Student).all()
    result = []
    for student in students:
        query = db.query(Attendance).filter(Attendance.student_id == student.id)
        if date_from:
            query = query.filter(Attendance.date >= date_from)
        if date_to:
            query = query.filter(Attendance.date <= date_to)
        records = query.all()
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        pct = round((present / total * 100), 2) if total > 0 else 0.0
        result.append(AttendanceSummary(
            student_id=student.id,
            student_name=student.name,
            roll_number=student.roll_number,
            total_days=total,
            present_days=present,
            attendance_percentage=pct
        ))
    return result

@router.get("/export/csv")
def export_csv(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    _=Depends(get_current_admin)
):
    students = db.query(Student).all()
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Student ID", "Name", "Roll Number", "Total Days", "Present", "Absent", "Attendance %"])
    for student in students:
        query = db.query(Attendance).filter(Attendance.student_id == student.id)
        if date_from:
            query = query.filter(Attendance.date >= date_from)
        if date_to:
            query = query.filter(Attendance.date <= date_to)
        records = query.all()
        total = len(records)
        present = sum(1 for r in records if r.status == "present")
        absent = total - present
        pct = round((present / total * 100), 2) if total > 0 else 0.0
        writer.writerow([student.id, student.name, student.roll_number, total, present, absent, pct])
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={
        "Content-Disposition": "attachment; filename=attendance_report.csv"
    })