# ASCA Operations Dashboard

This is the internal operations dashboard built with Streamlit. It is located in
the `ops/` directory to keep it separate from the main application codebase.

## Prerequisites

- Python 3.8 or higher

## Setup

1.  **Navigate to the ops directory:**

    ```bash
    cd ops
    ```

2.  **Create a virtual environment (recommended):**

    ```bash
    python3 -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Running the App

```bash
streamlit run app.py
```

The app will be available at `http://localhost:8501`.

## Structure

- `app.py`: Main entry point.
- `requirements.txt`: Python dependencies.

## Deployment Notes

- **Separation**: This app is designed to be run as a standalone service,
  ideally behind a reverse proxy (e.g., `internal.asca.org` or `asca.org/ops`).
- **Security**: Ensure this app is protected by authentication (e.g., VPN, IP
  Whitelist, or OAuth proxy) before exposing it to the public internet.
