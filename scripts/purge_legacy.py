import shutil
from pathlib import Path

LEGACY_DIRS = ['agents', 'orchestrator', 'ui', 'history', 'tests']

for d in LEGACY_DIRS:
    path = Path(d)
    if path.exists():
        shutil.rmtree(path)
        print(f"Removed {path}")
