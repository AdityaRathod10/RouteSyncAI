import subprocess
import sys
import importlib
import pkg_resources

def check_imports_in_project():
    """Check for missing dependencies by scanning import statements"""
    
    common_missing = [
        'sqlalchemy',
        'alembic', 
        'psycopg2-binary',
        'redis',
        'celery',
        'openai',
        'python-jose',
        'passlib',
        'aiofiles',
        'python-slugify',
        'pydantic-settings',
        'loguru',
        'bcrypt',
        'cryptography'
    ]
    
    missing_deps = []
    
    for dep in common_missing:
        try:
            pkg_resources.get_distribution(dep)
            print(f"✅ {dep} is installed")
        except pkg_resources.DistributionNotFound:
            print(f"❌ {dep} is NOT installed")
            missing_deps.append(dep)
    
    if missing_deps:
        print(f"\n🔧 Install missing dependencies:")
        print(f"pip install {' '.join(missing_deps)}")
    else:
        print("\n✅ All common dependencies are installed!")

if __name__ == "__main__":
    check_imports_in_project()