def calculate_co_attainment(questions, marks, students):
    co_aggregates = {}
    
    for q in questions:
        co = q['co']
        q_id = str(q['id'])
        max_marks = float(q['maxMarks'])
        
        # Determine total obtained and max for this question across all students
        total_obtained = sum(float(marks.get(str(s['id']), {}).get(q_id, 0)) for s in students)
        total_max = max_marks * len(students)
        
        if co not in co_aggregates:
            co_aggregates[co] = {"obtained": 0.0, "max": 0.0}
            
        co_aggregates[co]["obtained"] += total_obtained
        co_aggregates[co]["max"] += total_max
        
    co_data = {}
    for co, data in co_aggregates.items():
        percent = (data["obtained"] / data["max"]) * 100 if data["max"] > 0 else 0
        target = 60
        is_achieved = percent >= target
        co_level = 3 if percent >= 70 else 2 if percent >= 60 else 1 if percent >= 50 else 0
        
        co_data[co] = {
            "attainmentPercentage": round(percent, 2),
            "coLevel": co_level,
            "target": target,
            "isAchieved": is_achieved
        }
        
    return co_data

def calculate_po_attainment(co_results, matrix):
    po_aggregates = {}
    po_weight_sums = {}
    
    for co, co_val in co_results.items():
        mapping = matrix.get(co, {})
        for po, weight in mapping.items():
            w = float(weight)
            if w > 0:
                if po not in po_aggregates:
                    po_aggregates[po] = 0.0
                    po_weight_sums[po] = 0.0
                
                po_aggregates[po] += co_val["attainmentPercentage"] * w
                po_weight_sums[po] += w
                
    po_data = {}
    for po in po_aggregates:
        # Proper normalization: sum(CO % * weight) / sum(weight)
        percent = po_aggregates[po] / po_weight_sums[po] if po_weight_sums[po] > 0 else 0
        
        po_level = 3 if percent >= 70 else 2 if percent >= 60 else 1 if percent >= 50 else 0
        
        po_data[po] = {
            "attainmentPercentage": round(percent, 2),
            "poLevel": po_level
        }
        
    return po_data

def calculate_confidence(questions, marks, students, matrix):
    po_stats = {}
    
    q_to_pos = {}
    for q in questions:
        q_id = str(q['id'])
        co = q.get('co')
        q_to_pos[q_id] = []
        if co in matrix:
            for po, weight in matrix[co].items():
                if float(weight) > 0:
                    q_to_pos[q_id].append(po)
                    if po not in po_stats:
                        po_stats[po] = {"total_possible": 0, "actual_evals": 0}

    student_ids = [str(s['id']) for s in students]
        
    for q in questions:
        q_id = str(q['id'])
        pos = q_to_pos.get(q_id, [])
        for po in pos:
            po_stats[po]["total_possible"] += len(student_ids)
            
            for s_id in student_ids:
                if s_id in marks and q_id in marks[s_id]:
                    po_stats[po]["actual_evals"] += 1
                    
    confidence_data = {}
    for po, stats in po_stats.items():
        total = stats["total_possible"]
        actual = stats["actual_evals"]
        
        conf = (actual / total) if total > 0 else 0
        indicator = "High" if conf >= 0.75 else "Medium" if conf >= 0.5 else "Low"
        
        confidence_data[po] = {
            "confidence": round(conf, 2),
            "count": actual,
            "indicator": indicator
        }
        
    return confidence_data

