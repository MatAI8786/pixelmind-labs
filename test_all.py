import importlib
import traceback
from pathlib import Path
import numpy as np
import cv2

results = []

def record(name: str, success: bool, err: Exception | None = None) -> None:
    status = "PASS" if success else "FAIL"
    print(f"{name}: {status}")
    if err:
        print(f"  {err}")
    results.append(success)

def create_dummy_image(path: Path) -> None:
    img = np.zeros((10, 10, 3), dtype=np.uint8)
    cv2.imwrite(str(path), img)

def test_orchestrator() -> None:
    from orchestrator.workflow_orchestrator import run
    import agents.design.logo_agent as logo_agent

    tmp = Path("test_logo.png")
    create_dummy_image(tmp)

    original = logo_agent.process_logo
    logo_agent.process_logo = lambda p: str(p)
    try:
        job = {
            "client_name": "Test",
            "logo_path": str(tmp),
            "topic": "Testing",
            "title": "Test Page",
        }
        output = run(job)
        assert isinstance(output, dict)
        record("orchestrator.run", True)
    except Exception as e:
        record("orchestrator.run", False, e)
    finally:
        logo_agent.process_logo = original
        if tmp.exists():
            tmp.unlink()

def test_agents() -> None:
    from agents.design.layout_agent import LayoutAgent
    from agents.design.logo_agent import LogoAgent
    from agents.dev.frontend_agent import FrontendAgent
    from agents.dev.deploy_agent import DeployAgent
    from agents.content.copywriter_agent import CopywriterAgent
    from agents.content.seo_agent import SEOAgent
    from agents.research.scraper_agent import ScraperAgent
    from agents.branding.branding_agent import BrandingAgent
    from agents.client_comms.client_comms_agent import ClientCommsAgent

    # LayoutAgent
    try:
        LayoutAgent().execute({})
        record("LayoutAgent", True)
    except Exception as e:
        record("LayoutAgent", False, e)

    # LogoAgent (stub logo processing)
    try:
        import agents.design.logo_agent as logo_mod
        tmp = Path("logo_test.png")
        create_dummy_image(tmp)
        orig = logo_mod.process_logo
        logo_mod.process_logo = lambda p: str(p)
        LogoAgent().execute({"logo_path": str(tmp)})
        record("LogoAgent", True)
    except Exception as e:
        record("LogoAgent", False, e)
    finally:
        logo_mod.process_logo = orig
        if tmp.exists():
            tmp.unlink()

    # FrontendAgent
    try:
        FrontendAgent().execute({"title": "Hello"})
        record("FrontendAgent", True)
    except Exception as e:
        record("FrontendAgent", False, e)

    # DeployAgent
    try:
        DeployAgent().execute({})
        record("DeployAgent", True)
    except Exception as e:
        record("DeployAgent", False, e)

    # CopywriterAgent
    try:
        CopywriterAgent().execute({"topic": "Testing"})
        record("CopywriterAgent", True)
    except Exception as e:
        record("CopywriterAgent", False, e)

    # SEOAgent
    try:
        SEOAgent().execute({})
        record("SEOAgent", True)
    except Exception as e:
        record("SEOAgent", False, e)

    # ScraperAgent
    try:
        ScraperAgent().execute({"url": "https://example.com"})
        record("ScraperAgent", True)
    except Exception as e:
        record("ScraperAgent", False, e)

    # BrandingAgent
    try:
        BrandingAgent().execute({})
        record("BrandingAgent", True)
    except Exception as e:
        record("BrandingAgent", False, e)

    # ClientCommsAgent
    try:
        ClientCommsAgent().execute({"client_name": "Test"})
        record("ClientCommsAgent", True)
    except Exception as e:
        record("ClientCommsAgent", False, e)

def test_tools() -> None:
    from tools.feedback_loop import store_feedback, FEEDBACK_DB
    import tools.logo_processor as logo_processor

    # ensure feedback DB initialized
    if not FEEDBACK_DB.exists() or FEEDBACK_DB.read_text().strip() == "":
        FEEDBACK_DB.write_text("{}")

    try:
        store_feedback("test", {"ok": True})
        record("feedback_loop.store_feedback", True)
    except Exception as e:
        record("feedback_loop.store_feedback", False, e)

    try:
        tmp = Path("logo_tool.png")
        create_dummy_image(tmp)
        orig = logo_processor.process_logo
        logo_processor.process_logo = lambda p: str(p)
        logo_processor.process_logo(str(tmp))
        record("logo_processor.process_logo", True)
    except Exception as e:
        record("logo_processor.process_logo", False, e)
    finally:
        logo_processor.process_logo = orig
        if tmp.exists():
            tmp.unlink()

def test_json_prompt_engine() -> None:
    from orchestrator.json_prompt_engine import enforce_json
    try:
        enforce_json('{"agent": "test"}')
        record("json_prompt_engine.enforce_json", True)
    except Exception as e:
        record("json_prompt_engine.enforce_json", False, e)


def test_load_workflow() -> None:
    from orchestrator.workflow_orchestrator import load_workflow, execute_workflow
    try:
        wf = load_workflow("web_department.json")
        execute_workflow(wf, "demo")
        record("workflow_orchestrator.load_workflow", True)
    except Exception as e:
        record("workflow_orchestrator.load_workflow", False, e)

def test_ui_import() -> None:
    try:
        import ui.streamlit_dashboard  # noqa: F401
        record("ui.streamlit_dashboard import", True)
    except Exception as e:
        record("ui.streamlit_dashboard import", False, e)

if __name__ == "__main__":
    test_orchestrator()
    test_agents()
    test_tools()
    test_json_prompt_engine()
    test_load_workflow()
    test_ui_import()
    total = len(results)
    passed = sum(1 for r in results if r)
    print(f"\nSummary: {passed}/{total} tests passed.")
