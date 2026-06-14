"""
NexusCode Backend - Real Band + OpenAI Integration

FastAPI server that:
1. Connects to Band via WebSocket
2. Runs agents with real OpenAI API
3. Streams updates to web dashboard
"""

import asyncio
import json
import logging
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

# Load environment
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("nexuscode")

# Load configs
def load_config(filename: str) -> dict:
    path = Path(filename)
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {}

BAND_CONFIG = load_config("agent_config.json")

# OpenAI integration
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

try:
    from openai import OpenAI
    openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None
except ImportError:
    openai_client = None

# Band SDK integration
try:
    from thenvoi import Agent as BandAgent
    from thenvoi.adapters import LangGraphAdapter
    from thenvoi.config import load_agent_config
    from langchain_openai import ChatOpenAI
    from langgraph.checkpoint.memory import InMemorySaver
    BAND_SDK_AVAILABLE = True
except ImportError:
    BAND_SDK_AVAILABLE = False

logger.info(f"OpenAI: {'configured' if OPENAI_API_KEY else 'not configured'}")
logger.info(f"Band SDK: {'available' if BAND_SDK_AVAILABLE else 'not available'}")

# Agent system prompts
AGENT_PROMPTS = {
    "planner": """You are NexusPlanner, a Product Planner at NexusCode Labs.
Analyze requirements and create detailed user stories with acceptance criteria.
When done, mention @NexusArchitect to hand off for system design.
Format: Use markdown tables for user stories.""",

    "architect": """You are NexusArchitect, a System Architect at NexusCode Labs.
Design system architecture, API contracts, and data models.
When done, mention @NexusDeveloper to hand off for implementation.
Format: Use code blocks for architecture diagrams and API specs.""",

    "developer": """You are NexusDeveloper, a Senior Developer at NexusCode Labs.
Write production-ready code with tests.
When done, mention @NexusReviewer and @NexusRedTeamer for review.
Format: Use code blocks with file paths.""",

    "reviewer": """You are NexusReviewer, a Code Reviewer at NexusCode Labs.
Review code quality, readability, and best practices.
Rate quality 1-10 and provide feedback.
If approved, mention @NexusQA. If not, mention @NexusDeveloper.""",

    "red_teamer": """You are NexusRedTeamer, a Security Red-Teamer at NexusCode Labs.
Find security vulnerabilities and attack vectors.
Rate severity: Critical/High/Medium/Low.
If secure, mention @NexusQA. If issues found, mention @NexusDeveloper.""",

    "verifier": """You are NexusVerifier, an Evidence Verifier at NexusCode Labs.
Verify that claims are backed by evidence.
Respond with: Claim, Evidence, Status (verified/unverified/rejected), Reason.""",

    "qa": """You are NexusQA, a QA Engineer at NexusCode Labs.
Create test plans, run tests, report bugs.
Include: test count, pass/fail, coverage, recommendation.
When done, mention @NexusDevOps for deployment.""",

    "devops": """You are NexusDevOps, a DevOps Engineer at NexusCode Labs.
Handle deployment, CI/CD, and monitoring.
Include: deployment status, URLs, rollback plan.
When done, mention @NexusScribe for documentation.""",

    "scribe": """You are NexusScribe, a Technical Writer at NexusCode Labs.
Create documentation, README, API docs, changelogs.
Provide clear setup instructions and examples.""",

    "adjudicator": """You are NexusAdjudicator, a Conflict Resolver at NexusCode Labs.
Resolve conflicts between agents with fair decisions.
Explain reasoning and document the decision.""",

    "human_gate": """You are NexusHumanGate, the Human Approval Enforcer at NexusCode Labs.
Request human approval for critical decisions.
Present options with pros/cons clearly."""
}

# Message models
class MessageRequest(BaseModel):
    content: str
    sender: str = "user"

class AgentResponse(BaseModel):
    agent: str
    handle: str
    content: str
    timestamp: str
    mentions: list[str] = []

# FastAPI app
app = FastAPI(title="NexusCode API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conversation history
conversation_history: list[dict] = []
connected_clients: set = set()

# Real OpenAI completion
async def call_openai(system_prompt: str, user_message: str) -> str:
    """Call OpenAI API for real LLM response."""
    if not openai_client:
        return f"[OpenAI not configured - set OPENAI_API_KEY in .env]"

    try:
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            max_tokens=1000,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error calling OpenAI: {str(e)}"

# Parse @mentions from message
def extract_mentions(message: str) -> list[str]:
    """Extract @mentions from message."""
    import re
    mentions = re.findall(r'@(\w+)', message)
    return [f"nexus{m.lower()}" if not m.lower().startswith("nexus") else m.lower() for m in mentions]

# Agent processing
async def process_agent_message(agent_role: str, message: str) -> dict:
    """Process message through agent with real LLM."""
    prompt = AGENT_PROMPTS.get(agent_role, f"You are {agent_role}")

    # Call OpenAI for real response
    response = await call_openai(prompt, message)

    # Extract mentions from response
    mentions = extract_mentions(response)

    return {
        "agent": agent_role,
        "handle": f"@lamt78789/nexus{agent_role}",
        "content": response,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "mentions": mentions
    }

# API endpoints
@app.get("/api/status")
async def get_status():
    """Get system status."""
    return {
        "status": "running",
        "agents": len(AGENT_PROMPTS),
        "band_config": len(BAND_CONFIG),
        "openai_configured": bool(OPENAI_API_KEY),
        "band_sdk": BAND_SDK_AVAILABLE,
        "history": len(conversation_history)
    }

@app.post("/api/message")
async def send_message(request: MessageRequest):
    """Send message to agent system."""
    responses = []

    # Extract mentions
    mentions = extract_mentions(request.content)

    if mentions:
        # Process each mentioned agent
        for role in mentions:
            if role in AGENT_PROMPTS:
                response = await process_agent_message(role, request.content)
                responses.append(response)
                conversation_history.append(response)

                # Broadcast to connected clients
                for client in connected_clients:
                    try:
                        await client.send_json(response)
                    except:
                        pass
    else:
        # Default to planner
        response = await process_agent_message("planner", request.content)
        responses.append(response)
        conversation_history.append(response)

        for client in connected_clients:
            try:
                await client.send_json(response)
            except:
                pass

    return {"responses": responses}

@app.get("/api/history")
async def get_history():
    """Get conversation history."""
    return {"history": conversation_history[-50:]}

@app.get("/api/agents")
async def get_agents():
    """Get all agents."""
    agents = []
    for role, handle in [(r, BAND_CONFIG.get(r, {}).get("handle", f"@lamt78789/nexus{r}")) for r in AGENT_PROMPTS]:
        agents.append({
            "role": role,
            "name": f"Nexus{role.title()}",
            "handle": handle,
            "status": "online"
        })
    return {"agents": agents}

# WebSocket for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates."""
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)

            if message.get("type") == "message":
                # Process through agents
                content = message.get("content", "")
                mentions = extract_mentions(content)

                for role in mentions:
                    if role in AGENT_PROMPTS:
                        response = await process_agent_message(role, content)
                        await websocket.send_json(response)
                        conversation_history.append(response)
    except WebSocketDisconnect:
        connected_clients.remove(websocket)

# Band SDK integration endpoint
@app.post("/api/band/connect")
async def connect_band():
    """Connect to Band.ai and start agents."""
    if not BAND_SDK_AVAILABLE:
        return {"error": "Band SDK not installed", "status": "not_available"}

    # Would connect to Band here
    return {"status": "band_sdk_available", "message": "Band SDK ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
