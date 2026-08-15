import re
import numpy as np

class PriorityPredictor:
    """
    Scikit-learn + Rule Triage AI Engine for Disaster Emergency Priority Assessment.
    Calculates priority score (0-100), priority level, and detailed explanation.
    """
    def __init__(self):
        # Weights for disaster severity
        self.disaster_weights = {
            'flood': 25,
            'tsunami': 30,
            'landslide': 25,
            'earthquake': 25,
            'fire': 28,
            'cyclone': 22,
            'building collapse': 28,
            'chemical leak': 25,
            'medical emergency': 20,
            'other': 10
        }
        
        # High urgency keywords
        self.urgency_keywords = {
            'critical': ['trapped', 'drowning', 'unconscious', 'bleeding', 'infant', 'baby', 'elderly', 'fire', 'collapsed', 'roof', 'chest pain', 'cardiac', 'oxygen', 'broken', 'deadly'],
            'high': ['flooded', 'stranded', 'water rising', 'no food', 'no water', 'cut off', 'pregnant', 'children', 'urgent', 'smoke'],
            'medium': ['shelter', 'supplies', 'electricity down', 'damaged', 'blankets']
        }

    def predict(self, disaster_type: str, people_count: int, injured_count: int, trapped: bool, requested_help: str, description: str):
        # Base score calculation
        base_score = 15
        reasons = []

        # 1. Disaster Type Impact
        dtype_clean = disaster_type.strip().lower()
        d_weight = self.disaster_weights.get(dtype_clean, 15)
        base_score += d_weight

        # 2. Trapped Status (Huge multiplier)
        if trapped:
            base_score += 30
            reasons.append("People are trapped inside/on top of structure")

        # 3. Injured People Ratio & Count
        if injured_count > 0:
            injury_score = min(25, injured_count * 12)
            base_score += injury_score
            reasons.append(f"{injured_count} injured person(s) require immediate medical assistance")
        
        # 4. People Count Impact
        if people_count > 1:
            people_score = min(15, (people_count - 1) * 3)
            base_score += people_score
            if people_count >= 5:
                reasons.append(f"Large group of {people_count} individuals affected")

        # 5. Requested Help Urgency
        help_clean = requested_help.strip().lower()
        if 'rescue' in help_clean:
            base_score += 12
            if "Rescue" not in [r.split()[0] for r in reasons]:
                reasons.append("Rescue intervention requested")
        elif 'medicine' in help_clean or 'medical' in help_clean:
            base_score += 10
        elif 'food' in help_clean or 'water' in help_clean or 'shelter' in help_clean:
            base_score += 5

        # 6. Description NLP Keyword Analysis
        desc_clean = description.lower() if description else ""
        keyword_hits = []
        for kw in self.urgency_keywords['critical']:
            if re.search(r'\b' + re.escape(kw) + r'\b', desc_clean):
                base_score += 8
                keyword_hits.append(kw)
        
        for kw in self.urgency_keywords['high']:
            if re.search(r'\b' + re.escape(kw) + r'\b', desc_clean):
                base_score += 4
                keyword_hits.append(kw)

        # Cap score between 0 and 100
        final_score = int(np.clip(base_score, 10, 99))

        # Determine Priority Category
        if final_score >= 80:
            priority = "CRITICAL"
        elif final_score >= 60:
            priority = "HIGH"
        elif final_score >= 35:
            priority = "MEDIUM"
        else:
            priority = "LOW"

        # Generate concise explanation
        if not reasons:
            reasons.append(f"Emergency request for {disaster_type} assistance with {people_count} person(s).")

        reason_summary = f"{' and '.join(reasons)}."

        return {
            "priority": priority,
            "score": final_score,
            "reason": reason_summary
        }

predictor = PriorityPredictor()
