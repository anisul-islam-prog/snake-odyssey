Backend — Setup & Run
=====================================

This README shows a complete sequence of commands to set up and run the backend using the `uv` package manager installed inside a project virtual environment. Follow steps in order.

Prerequisites
- Python 3.12+ installed and available as `python3` on your PATH.

1) Create and activate a project virtual environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

2) Where to install `uv` (important)

Do NOT install `uv` inside the same virtual environment you use for your application dependencies. `uv sync` manages and (re)creates an isolated environment for project dependencies; if `uv` itself is installed in the same venv, it can be removed or replaced when `uv sync` runs.

Recommended options (choose one):

- Option A — install `uv` with `pipx` (recommended): keeps tooling isolated from project and system Python.

```bash
# python3 -m pip install --user pipx
brew install pipx
#python3 -m 
pipx ensurepath
pipx install uv
```

- Option B — install `uv` in a separate tooling virtualenv (keeps the project venv untouched):

```bash
cd backend
python3 -m venv .venv-tools
source .venv-tools/bin/activate
python -m pip install --upgrade pip
python -m pip install uv
# when done you can deactivate the tools venv
deactivate
```

After choosing one of the options above, create your project app venv (next step) and keep it separate from the tooling venv.

3) Create and activate your project (app) virtual environment

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

4) Sync / install project dependencies using `uv`

This reads `pyproject.toml` and installs the declared dependencies into the environment managed by `uv` (it will create or refresh the environment it controls).

```bash
# if you installed uv with pipx, `uv` is on your PATH
# if you installed uv in .venv-tools, activate that venv to run `uv` commands
uv sync
```

4) Run the test suite using `uv`

```bash
uv run pytest -q
```

If `uv run pytest -q` completes successfully you should see the test summary.

5) Run the development server (Uvicorn) via `uv`

Start Uvicorn with autoreload on port 8080 and bind to all interfaces:

```bash
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

- Access the OpenAPI docs at: http://localhost:8080/docs  (or http://<your-host>:8080/docs)
- The server will be reachable on all interfaces at port 8080 (shown as *:8080 in some tools).

Environment variables
- Set a strong `SECRET_KEY` before running tests or the server in non-development environments. Example:

```bash
export SECRET_KEY="a-very-strong-secret-of-32-or-more-bytes"
```

Troubleshooting & alternatives
- If you cannot use `uv`, you can use the venv directly and install dependencies with pip:

```bash
# with venv activated
python -m pip install --upgrade pip
python -m pip install .
pytest -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8080
```

- If you prefer `uv` installed globally or via `pipx`, you may do so instead, but installing inside the project venv keeps the environment isolated.

Notes
- The codebase ships with a default `SECRET_KEY` in `app/config.py` for convenience; replace it with a strong secret in production.

Questions or next steps
- I can commit this README update and push the branch if you want — tell me to proceed.


Project setup (one-time)

1. From the repo root, change into the backend folder:

```bash
cd backend
```

2. Sync/install dependencies declared in `pyproject.toml`:

```bash
uv sync
```

Run the app (development)

Start Uvicorn with reload via `uv`:

```bash
cd backend
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`.

Run tests

Use `uv` to run the test suite in the synced environment:

```bash
cd backend
uv run pytest -q
```

Environment variables
- To change the JWT secret used by the app, set `SECRET_KEY` before running the server or tests. Example:

```bash
export SECRET_KEY="a-very-strong-secret-of-32-or-more-bytes"
```

Notes
- The default `SECRET_KEY` in `app/config.py` was lengthened to avoid insecure-key warnings from PyJWT; you should replace it with a strong secret in production.
- If you cannot install `uv` system-wide, use a local virtual environment instead:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install .
pytest -q
```

API Doc: [localhost:8080/docs](localhost:8080/docs)