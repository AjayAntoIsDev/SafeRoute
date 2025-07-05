structured = f"""
{{
    "floods": {{
        "probability": "<float>",  # Probability of flooding
        "risk_level": "<str>",      # Risk level (Low, Medium, High)
        "recommendations": [
            "<str>"  # List of safety recommendations
        ],
        "analysis": "<str>"  # Detailed analysis of the flooding risk
    }},
    "cyclone": {{
        "probability": "<float>",  # Probability of cyclone
        "risk_level": "<str>",      # Risk level (Low, Medium, High)
        "recommendations": [
            "<str>"  # List of safety recommendations
        ],
        "analysis": "<str>"  # Detailed analysis of the cyclone risk
    }},
    "earthquakes": {{
        "probability": "<float>",  # Probability of earthquake
        "risk_level": "<str>",      # Risk level (Low, Medium, High)
        "recommendations": [
            "<str>"  # List of safety recommendations
        ],
        "analysis": "<str>"  # Detailed analysis of the earthquake risk
    }},
    "droughts": {{
        "probability": "<float>",  # Probability of drought
        "risk_level": "<str>",      # Risk level (Low, Medium, High)
        "recommendations": [
            "<str>"  # List of safety recommendations
        ],
        "analysis": "<str>"  # Detailed analysis of the drought risk
    }},
    "landslides": {{
        "probability": "<float>",  # Probability of landslides
        "risk_level": "<str>",      # Risk level (Low, Medium, High)
        "recommendations": [
            "<str>"  # List of safety recommendations
        ],
        "analysis": "<str>"  # Detailed analysis of the landslide risk
    }},
    "conclusion": {{
        "probability": "<float>",  # Overall probability of a natural disaster occurring
        "risk_level": "<str>",      # Overall risk level (Low, Medium, High)
        "primary_threats": [
            "<str>"  # List of primary threats (e.g., "flooding", "cyclone")
        ],
        "recommendations": [
            "<str>"  # Overall recommendations to prepare for disaster
        ],
        "analysis": "<str>"  # Overall analysis of the disaster situation
    }}
}}
"""

print(structured)
