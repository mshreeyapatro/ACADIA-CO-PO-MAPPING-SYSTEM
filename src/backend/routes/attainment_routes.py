from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uuid

from database import get_db
import models
from services.attainment_service import calculate_co_attainment_fuzzy, calculate_po_attainment_fuzzy

router = APIRouter()

class MarkEntry(BaseModel):
    student_id: str | int
    question_id: str | int
    co: str
    marks_obtained: float
    max_marks: float

class SubmitMarksPayload(BaseModel):
    subject_id: str | int
    test_id: str | int
    marks: List[MarkEntry]
    co_po_mapping: Optional[Dict[str, Dict[str, float]]] = None

@router.post("/submit-marks")
def submit_marks(payload: SubmitMarksPayload, db: Session = Depends(get_db)):
    marks_list = [m.model_dump() for m in payload.marks]
    
    # Store in database
    db_marks = models.TestMarksModel(
        id=str(uuid.uuid4()),
        subject_id=str(payload.subject_id),
        test_id=str(payload.test_id),
        marks=marks_list,
        co_po_mapping=payload.co_po_mapping
    )
    db.add(db_marks)
    db.commit()
    
    return {"status": "success", "message": "Marks submitted successfully", "id": db_marks.id}

@router.get("/calculate-co")
def calculate_co(test_id: str, db: Session = Depends(get_db)):
    # Find the most recently submitted marks for this test_id
    db_entry = db.query(models.TestMarksModel).filter(models.TestMarksModel.test_id == test_id).order_by(models.TestMarksModel.id.desc()).first()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="Marks not found for this test_id")
        
    co_attainment = calculate_co_attainment_fuzzy(db_entry.marks)
    return {"CO": co_attainment}

@router.get("/calculate-po")
def calculate_po(test_id: str, db: Session = Depends(get_db)):
    db_entry = db.query(models.TestMarksModel).filter(models.TestMarksModel.test_id == test_id).order_by(models.TestMarksModel.id.desc()).first()
    
    if not db_entry:
        raise HTTPException(status_code=404, detail="Marks not found for this test_id")
        
    co_po_mapping = db_entry.co_po_mapping
    if not co_po_mapping:
        # Default mapping if none was provided
        co_po_mapping = {
            "CO1": {"PO1": 0.8, "PO2": 0.6},
            "CO2": {"PO2": 0.8, "PO3": 0.5}
        }
        
    co_attainment = calculate_co_attainment_fuzzy(db_entry.marks)
    po_attainment = calculate_po_attainment_fuzzy(co_attainment, co_po_mapping)
    
    return {"PO": po_attainment}
