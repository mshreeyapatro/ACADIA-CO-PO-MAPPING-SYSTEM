def fuzzify(percentage: float):
    """
    Fuzzifies the percentage (0-100) into Low, Medium, and High memberships [0-1].
    Rules:
    Low: 0-40 (peaks at 0, goes to 0 at 40)
    Medium: 30-70 (peaks around 50, goes to 0 at 30 and 70)
    High: 60-100 (peaks at 100, goes to 0 at 60)
    """
    calc_mem = lambda x, a, b, c, d: max(0, min((x-a)/(b-a) if b>a else 1, 1, (d-x)/(d-c) if d>c else 1))
    
    # Simple triangular / trapezoidal membership
    low = max(0, min(1, (40 - percentage) / 40)) if percentage <= 40 else 0
    
    medium = 0
    if 30 < percentage <= 50:
        medium = (percentage - 30) / 20
    elif 50 < percentage < 70:
        medium = (70 - percentage) / 20
        
    high = max(0, min(1, (percentage - 60) / 40)) if percentage >= 60 else 0
    
    return low, medium, high

def apply_rules(low: float, medium: float, high: float):
    """
    Mamdani rule inference.
    High -> Strong (0.7-1.0)
    Medium -> Moderate (0.4-0.7)
    Low -> Weak (0.0-0.4)
    Returns firing strengths.
    """
    weak = low
    moderate = medium
    strong = high
    return weak, moderate, strong

def defuzzify_centroid(weak: float, moderate: float, strong: float) -> float:
    """
    Defuzzify using a simplified centroid method.
    We'll represent the output sets with discrete points and calculate center of gravity.
    Weak center: 0.2
    Moderate center: 0.55
    Strong center: 0.85
    """
    centers = {"weak": 0.2, "moderate": 0.55, "strong": 0.85}
    
    numerator = weak * centers["weak"] + moderate * centers["moderate"] + strong * centers["strong"]
    denominator = weak + moderate + strong
    
    if denominator == 0:
        return 0.0
    
    score = numerator / denominator
    return score

def get_fuzzy_level(score: float) -> str:
    """Gets linguistic level for the defuzzified score."""
    if score >= 0.7:
        return "Strong"
    elif score >= 0.4:
        return "Moderate"
    else:
        return "Weak"

def calculate_fuzzy_score(percentage: float):
    """End to end fuzzy calculation."""
    low, med, high = fuzzify(percentage)
    weak, mod, strong = apply_rules(low, med, high)
    score = defuzzify_centroid(weak, mod, strong)
    return {
        "fuzzy_score": score,
        "level": get_fuzzy_level(score)
    }
