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

## Workflows

Saved workflows are stored in the `workflows/` directory as JSON files. You can
import and export workflows through the web interface's top bar.

## Extending the System

To create new nodes for the editor, add React components under
`frontend/src/components/nodes` and the corresponding execution logic under
`backend/app/engine`.
