import os
from pathlib import Path

def check_required_files():
    """Check if all required files exist before starting the server"""
    base_dir = Path(__file__).parent
    
    required_files = [
        "graph_final_8_precalc.pkl",
        "prohibited_items/logistics_data.json",
        "safety_analysis/incident_counts_by_node.json"
    ]
    
    missing_files = []
    for file_path in required_files:
        full_path = base_dir / file_path
        if not full_path.exists():
            missing_files.append(str(full_path))
    
    if missing_files:
        print("⚠️ Missing required files:")
        for file in missing_files:
            print(f"  - {file}")
        print("\nPlease ensure all required data files are included in your deployment.")
        return False
    
    print("✅ All required files found.")
    return True

if __name__ == "__main__":
    check_required_files()