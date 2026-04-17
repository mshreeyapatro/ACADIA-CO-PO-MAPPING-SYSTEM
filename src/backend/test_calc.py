import json
from services.calculation import calculate_co_attainment, calculate_po_attainment, calculate_confidence

questions = [
    {"id": "q1", "co": "CO1", "maxMarks": 10},
    {"id": "q2", "co": "CO2", "maxMarks": 10}
]
marks = {
    "1": {"q1": 8, "q2": 7},
    "2": {"q1": 5, "q2": 6}
}
students = [
    {"id": "1", "name": "A"},
    {"id": 2, "name": "B"}
]
matrix = {
    "CO1": {"PO1": 3, "PO2": 2},
    "CO2": {"PO2": 3, "PO3": 1}
}

co = calculate_co_attainment(questions, marks, students)
print("CO:", co)
po = calculate_po_attainment(co, matrix)
print("PO:", po)
conf = calculate_confidence(questions, marks, students, matrix)
print("CONF:", conf)
