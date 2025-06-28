# PixelMind Labs

PixelMind Labs is an AI-driven web design and digital marketing toolkit. This repo
contains modular agents grouped into departments and a workflow orchestrator that
coordinates them.

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Run the orchestrator with a sample job:

```bash
python orchestrator/workflow_orchestrator.py
```

3. Optionally start the Streamlit dashboard:

```bash
streamlit run ui/streamlit_dashboard.py
```

## Project Structure

- `agents/` – individual agents organized by department
- `orchestrator/` – workflow management and JSON enforcement
- `tools/` – utilities like logo processing and feedback storage
- `history/` – output history per agent
- `data/feedback_db.json` – feedback data store
- `ui/` – dashboard scaffolding
