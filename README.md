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

The script automatically adjusts `sys.path` so it can be executed directly
from the project root on any platform.

3. Optionally start the Streamlit dashboard:

```bash
streamlit run ui/streamlit_dashboard.py
```

Like the orchestrator script, the dashboard modifies `sys.path` at runtime, so
you can launch it from the project root without setting `PYTHONPATH`.

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
within the app. The dashboard now includes:

- Sidebar navigation for running individual agents or the full workflow
- A settings panel to paste an `OPENAI_API_KEY` at runtime
- Live log output showing recent runs
- A **Test All Agents** button for quick demos

When an OpenAI API key is provided, content and branding agents use GPT-3.5 to
generate richer copy and color palettes. Without a key, the app falls back to
stub demo responses.

```
streamlit run ui/streamlit_dashboard.py
```

Use the **Settings** tab to supply the API key. See `.env.example` for the
environment variable name.
