import os
import sys
import json
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

# Ensure project root is on sys.path so Streamlit can find the orchestrator
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from orchestrator.workflow_orchestrator import run, AGENTS, run_agent

load_dotenv()  # load variables from .env if present

if "openai_api_key" not in st.session_state:
    st.session_state["openai_api_key"] = os.getenv("OPENAI_API_KEY", "")
    if st.session_state["openai_api_key"]:
        os.environ["OPENAI_API_KEY"] = st.session_state["openai_api_key"]

if "logs" not in st.session_state:
    st.session_state["logs"] = []

st.sidebar.title("PixelMind Labs")
page = st.sidebar.radio("Navigation", ["Workflow", "Run Agent", "Settings"])

st.title("PixelMind Labs Dashboard")

# Helper to record logs

def log_output(agent: str, output: dict) -> None:
    st.session_state["logs"].append({"agent": agent, "output": output})

if page == "Settings":
    st.subheader("Configuration")
    with st.form("settings_form"):
        api_key = st.text_input(
            "OpenAI API Key",
            type="password",
            value=st.session_state.get("openai_api_key", ""),
        )
        submitted = st.form_submit_button("Save")
        if submitted:
            st.session_state["openai_api_key"] = api_key
            if api_key:
                os.environ["OPENAI_API_KEY"] = api_key
            st.success("API key updated")
    if st.session_state.get("openai_api_key"):
        st.info("LLM features enabled")
    else:
        st.warning("No API key set. Using demo mode.")

elif page == "Run Agent":
    st.subheader("Run Individual Agent")
    agent_key = st.selectbox("Agent", list(AGENTS.keys()))
    params_text = st.text_area("Agent Parameters (JSON)", "{}")
    if st.button("Execute Agent"):
        try:
            params = json.loads(params_text or "{}")
        except json.JSONDecodeError:
            st.error("Invalid JSON parameters")
            params = None
        if params is not None:
            output = run_agent(agent_key, params)
            if hasattr(output, "__await__"):
                import asyncio

                output = asyncio.run(output)
            log_output(agent_key, output)
            with st.expander(f"Output: {agent_key}"):
                st.json(output)

elif page == "Workflow":
    st.subheader("Orchestrated Workflow")
    with st.form("workflow_form"):
        client_name = st.text_input("Client Name")
        logo_file = st.file_uploader("Logo File")
        topic = st.text_input("Topic")
        title = st.text_input("Page Title")
        submitted = st.form_submit_button("Run Workflow")

        if submitted:
            logo_path = None
            if logo_file is not None:
                logo_path = Path("uploaded_logo.png")
                logo_path.write_bytes(logo_file.read())
            job = {
                "client_name": client_name,
                "logo_path": str(logo_path) if logo_path else "",
                "topic": topic,
                "title": title,
            }
            output = run(job)
            for k, v in output.items():
                log_output(k, v)
            st.session_state["last_output"] = output

    if "last_output" in st.session_state:
        st.success("Workflow completed")
        tabs = st.tabs(list(st.session_state["last_output"].keys()))
        for idx, (agent, result) in enumerate(st.session_state["last_output"].items()):
            with tabs[idx]:
                st.json(result)

    if st.button("Test All Agents"):
        job = {
            "client_name": "Demo Co",
            "logo_path": "dummy_logo.png",
            "topic": "Demo",
            "title": "Demo Page",
        }
        output = run(job)
        for k, v in output.items():
            log_output(k, v)
        st.session_state["last_output"] = output
        st.experimental_rerun()

if st.session_state["logs"]:
    st.subheader("Run Log")
    for entry in st.session_state["logs"][-20:]:
        with st.expander(entry["agent"]):
            st.json(entry["output"])
