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

## Testing

You can manually test the workflow by running the orchestrator script. This will
invoke each agent in sequence and log outputs under the `history/` directory.

```bash
python orchestrator/workflow_orchestrator.py
```

The bottom of `workflow_orchestrator.py` contains a `sample_job` dictionary
used for this demo. Modify its values to experiment with different inputs.

For an interactive test interface, start the Streamlit dashboard:

```bash
streamlit run ui/streamlit_dashboard.py
```

Enter the job details in the form and click **Run Workflow** to see the results
within the app.
