from sqlalchemy import Column, String, JSON
from database import Base

class StudentModel(Base):
    __tablename__ = "students"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    batch = Column(String, index=True)
    section = Column(String, index=True)

class ReportModel(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, index=True) 
    date = Column(String)
    test_name = Column(String)
    subject = Column(String)
    batch = Column(String)
    section = Column(String)
    
    questions = Column(JSON)
    marks = Column(JSON)
    students = Column(JSON)
    summary = Column(JSON)

class TestMarksModel(Base):
    __tablename__ = "test_marks"

    id = Column(String, primary_key=True, index=True)
    subject_id = Column(String, index=True)
    test_id = Column(String, index=True)
    marks = Column(JSON)
    co_po_mapping = Column(JSON, nullable=True)
