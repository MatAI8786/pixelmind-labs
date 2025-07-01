# PixelMind Labs

A drag-and-drop AI workflow builder built with Next.js and FastAPI.

## Development

```bash
make dev
```

This starts the frontend on http://localhost:3000 and the backend on http://localhost:8000.

Create a `.env` file based on `.env.example` with your API keys.

## Workflows

Saved workflows are stored in `workflows/` as JSON. Use the top bar to import/export workflows.

## Adding Nodes

Implement new node components in `frontend/src/components/nodes` and execution logic in `backend/app/engine`.
