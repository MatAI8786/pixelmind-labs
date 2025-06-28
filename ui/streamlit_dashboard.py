import sys
from pathlib import Path
import streamlit as st
import json

# Ensure project root is on sys.path so Streamlit can find the orchestrator
# and agents packages when running ``streamlit run ui/streamlit_dashboard.py``.
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from orchestrator.workflow_orchestrator import run

st.title("PixelMind Labs Dashboard")

client_name = st.text_input("Client Name")
logo_path = st.text_input("Logo Path")
topic = st.text_input("Topic")
title = st.text_input("Page Title")

if st.button("Run Workflow"):
    job = {
        "client_name": client_name,
        "logo_path": logo_path,
        "topic": topic,
        "title": title,
    }
    output = run(job)
    st.json(output)
