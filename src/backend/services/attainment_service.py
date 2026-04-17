from typing import List, Dict, Any
from .fuzzy_logic import calculate_fuzzy_score

def calculate_co_attainment_fuzzy(marks_list: List[Dict[str, Any]]):
    """
    Groups marks by CO and computes percentage and fuzzy logic.
    marks_list looks like we received from frontend:
    [
        {
            "student_id": 1,
            "question_id": 1,
            "co": "CO1",
            "marks_obtained": 8,
            "max_marks": 10
        }, ...
    ]
    """
    co_totals = {}
    
    for entry in marks_list:
        co = entry.get("co")
        if not co:
            continue
            
        marks_obt = float(entry.get("marks_obtained", 0))
        max_marks = float(entry.get("max_marks", 0))
        
        if co not in co_totals:
            co_totals[co] = {"obtained": 0.0, "max": 0.0}
            
        co_totals[co]["obtained"] += marks_obt
        co_totals[co]["max"] += max_marks
        
    results = {}
    for co, data in co_totals.items():
        if data["max"] > 0:
            percentage = (data["obtained"] / data["max"]) * 100
        else:
            percentage = 0.0
            
        fuzzy_result = calculate_fuzzy_score(percentage)
        
        results[co] = {
            "percentage": round(percentage, 2),
            "fuzzy_score": round(fuzzy_result["fuzzy_score"], 2),
            "level": fuzzy_result["level"]
        }
        
    return results

def calculate_po_attainment_fuzzy(co_attainment: Dict[str, Any], co_po_mapping: Dict[str, Dict[str, float]]):
    """
    PO = Σ(CO_fuzzy_score × weight)
    """
    po_totals = {}
    
    for co, data in co_attainment.items():
        fuzzy_score = data.get("fuzzy_score", 0.0)
        
        mapping = co_po_mapping.get(co, {})
        for po, weight in mapping.items():
            if po not in po_totals:
                po_totals[po] = 0.0
            
            po_totals[po] += fuzzy_score * float(weight)
            
    # Round results
    results = {po: round(score, 2) for po, score in po_totals.items()}
    return results
