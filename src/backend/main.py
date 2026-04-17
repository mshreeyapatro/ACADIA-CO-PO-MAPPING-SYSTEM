import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    import models
    from models.user import User
    from database import engine, get_db
    from sqlalchemy.orm import Session
    from fastapi import Depends
    from pydantic import BaseModel
    from typing import List, Dict, Any, Optional

    from services.calculation import (
        calculate_co_attainment,
        calculate_po_attainment,
        calculate_confidence
    )

    from routes.attainment_routes import router as attainment_router
    from routes.auth import router as auth_router

    # Create database tables safely
    models.Base.metadata.create_all(bind=engine)

    app.include_router(attainment_router)
    app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

    class Question(BaseModel):
        id: str | int
        co: str
        maxMarks: Optional[float | str] = 0

    class Student(BaseModel):
        id: str
        name: str
        batch: Optional[str] = ""
        section: Optional[str] = ""

    class CalculatePayload(BaseModel):
        questions: List[Question]
        marks: Dict[str, Dict[str, float | int]]
        students: List[Student]
        matrix: Dict[str, Dict[str, float]]

    @app.post("/api/calculate")
    def calculate(payload: CalculatePayload):
        print("Received payload:", payload.model_dump())
        questions_list = [q.model_dump() for q in payload.questions]
        marks_dict = payload.marks
        students_list = [s.model_dump() for s in payload.students]
        matrix_dict = payload.matrix

        co_results = calculate_co_attainment(questions_list, marks_dict, students_list)
        po_results = calculate_po_attainment(co_results, matrix_dict)
        confidence_data = calculate_confidence(questions_list, marks_dict, students_list, matrix_dict)
        
        return {
            "coAttainment": co_results,
            "poAttainment": po_results,
            "confidenceData": confidence_data
        }

    # ---- DATABASE CRUD API ----

    @app.get("/api/students")
    def get_students(db: Session = Depends(get_db)):
        return db.query(models.StudentModel).all()

    @app.post("/api/students/sync")
    def sync_students(students: List[Student], db: Session = Depends(get_db)):
        db.query(models.StudentModel).delete()
        for s in students:
            db.add(models.StudentModel(id=s.id, name=s.name, batch=s.batch, section=s.section))
        db.commit()
        return {"status": "synced"}

    class ReportPayload(BaseModel):
        id: str
        date: str
        testDetails: Dict[str, Any]
        questions: List[Dict[str, Any]]
        marks: Dict[str, Any]
        students: List[Dict[str, Any]]
        summary: Dict[str, Any]

    @app.get("/api/reports")
    def get_reports(db: Session = Depends(get_db)):
        reports = db.query(models.ReportModel).order_by(models.ReportModel.date.desc()).all()
        output = []
        for r in reports:
            output.append({
                "id": r.id,
                "date": r.date,
                "testDetails": {
                    "testName": r.test_name,
                    "subject": r.subject,
                    "batch": r.batch,
                    "section": r.section
                },
                "questions": r.questions,
                "marks": r.marks,
                "students": r.students,
                "summary": r.summary
            })
        return output

    @app.post("/api/reports")
    def save_report(report: ReportPayload, db: Session = Depends(get_db)):
        db_report = models.ReportModel(
            id=report.id,
            date=report.date,
            test_name=report.testDetails.get("testName", ""),
            subject=report.testDetails.get("subject", ""),
            batch=report.testDetails.get("batch", ""),
            section=report.testDetails.get("section", ""),
            questions=report.questions,
            marks=report.marks,
            students=report.students,
            summary=report.summary
        )
        db.add(db_report)
        db.commit()
        return {"status": "saved"}

except Exception as e:
    err_msg = traceback.format_exc()
    print("STARTUP ERROR:", err_msg)
    @app.api_route("/{path_name:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"])
    async def catch_all(request: Request, path_name: str):
        return JSONResponse(status_code=500, content={"detail": "Startup Error", "error": err_msg})