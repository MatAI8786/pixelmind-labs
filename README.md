# PixelMind Labs

PixelMind Labs is a drag-and-drop AI workflow builder. The project is split into
a **FastAPI** backend and a **Next.js** frontend. You can run the services
either locally with Python and Node or by using the provided Docker setup.

## Prerequisites

* **Python** 3.11+
* **Node.js** 18+ (or the version specified in `frontend/package.json`)
* **npm** (comes with Node)
* [Docker](https://www.docker.com/) and Docker Compose (optional but
  recommended for a unified development environment)

## Environment Variables

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
```

At minimum you need an `OPENAI_API_KEY` for the backend to perform AI-related
tasks.

## Installing Backend Requirements

Install the Python dependencies inside the `backend` directory (or use the root
`requirements.txt` which mirrors the same list):

```bash
pip install -r backend/requirements.txt
```

The main packages are:

* **fastapi** – web framework for the API
* **uvicorn** – ASGI server used to run FastAPI
* **pydantic** – data validation
* **pydantic-settings** – configuration management
* **python-dotenv** – environment variable loading
* **openai** – integration with OpenAI APIs

## Installing Frontend Requirements

From the `frontend` directory install the Node dependencies:

```bash
cd frontend
npm install
```

Key runtime packages include **next**, **react**, **react-flow-renderer** and
**zustand**. Development uses **typescript** and **tailwindcss**.

## Running the Project

### Using Docker Compose

The simplest way to start both services is with Docker Compose. From the project
root run:

```bash
make dev
```

This builds the frontend and backend images and starts them. The frontend will
be available at <http://localhost:3000> and the backend API at
<http://localhost:8000>.

### Single Command (Local)

You can also run both servers locally without Docker. Install the root dev
dependencies and launch **both the FastAPI and Next.js servers** with a single command:

```bash
npm install
npm run dev  # starts frontend and backend together
```

The `dev` script uses [concurrently](https://www.npmjs.com/package/concurrently)
to start the FastAPI backend and the Next.js frontend at the same time.

### Running Manually

If you prefer to run the services without Docker:

1. **Backend** – from the `backend` folder start the API server:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Frontend** – in a separate terminal start the Next.js dev server:

   ```bash
   cd frontend
   npm run dev
   ```

## Running Tests

Frontend unit tests and Playwright end-to-end tests can be run with:

```bash
cd frontend
npm run lint
npm run test
npm run e2e
```

To execute the backend test suite:

```bash
pip install -r backend/requirements.txt
pytest
```

## Workflows

Saved workflows are stored in the `workflows/` directory as JSON files. You can
import and export workflows through the web interface's top bar.

## Extending the System

To create new nodes for the editor, add React components under
`frontend/src/components/nodes` and the corresponding execution logic under
`backend/app/engine`.

## API Health Check

Visit **Settings** to see a table of providers returned from `/api/providers`.
Each row shows a green ✓ or red ✗ status, the last check timestamp and the last
error message. Use the **Test** action to call `/api/providers/&lt;id&gt;/test` and
view the JSON response in a modal where you can copy the log.

## Testing LLM Nodes

When editing a workflow, select an LLM node and press **Test Node** in the side
panel. The frontend sends the node configuration to `/api/llm/test` and displays
the model's reply or an error message.

## Saving and Importing Workflows

Use the **Export JSON** button to download the current canvas. **Import JSON**
loads a file back into the editor, while **Save Workflow** stores the workflow on
the server via `/api/workflows/save`.

## Extending the Node Palette

Drag nodes such as LLM, Input, Output, Tool and Condition from the left palette
onto the canvas. Each node type has its own configuration options which are
serialized when exporting workflows.

## Dark Mode

The UI defaults to a dark theme. You can modify Tailwind classes or the
`_document.tsx` file if you wish to change this behavior.

## Node Panels and Key Testing

The **Settings** page displays all built-in providers such as Google, Gemini and
Binance. Use the **Test** button on any row to hit `/api/providers/{id}/test` and
inspect the JSON output. Results appear in a modal with a convenient **Copy log**
button.

## Connecting Nodes

Every node on the canvas exposes input and output sockets. Drag from a node's
output port onto another node's input port to create an edge. These edges are
stored in your workflow JSON when exporting or saving.

### Backend Key Test Endpoint

`POST /api/test/{provider}` accepts a JSON body containing an optional `key`
field. The backend loads credentials from your `.env` file when no key is
supplied and performs a small API call to verify access. A structured response
with status and logs is returned.
