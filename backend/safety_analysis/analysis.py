import json
import os
from pathlib import Path

# Get the current directory and construct paths relative to the module
BASE_DIR = Path(__file__).parent
JSON_PATH = BASE_DIR / "incident_counts_by_node.json"

# Load the JSON data with proper error handling
try:
    with open(JSON_PATH, "r") as f:
        incident_counts = json.load(f)
    print(f"✅ Incident data loaded successfully from {JSON_PATH}")
except FileNotFoundError:
    print(f"❌ Incident data file not found at {JSON_PATH}")
    incident_counts = {}

def get_incidents_for_places(places):
    """Fetch incident data for a list of places (nodes)."""
    result = []
    for place in places:
        if place in incident_counts:
            result.append({place: incident_counts[place]})
        else:
            result.append({place: "No incident have occured"})
    return result