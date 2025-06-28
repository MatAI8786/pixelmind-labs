import streamlit as st
import json
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
