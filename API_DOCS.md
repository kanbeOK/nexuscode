# NexusCode API Documentation

## Overview

NexusCode exposes a REST API for interacting with the multi-agent system. All agent communication happens through Band, but this API provides programmatic access for testing and integration.

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

```bash
Authorization: Bearer <your-api-key>
```

## Endpoints

### System

#### GET /status
Get system status.

**Response:**
```json
{
  "status": "running",
  "project": "nexuscode-project",
  "agents": 11,
  "phase": "ready",
  "audit_entries": 42,
  "memory_entries": 15
}
```

#### POST /initialize
Initialize the system.

**Response:**
```json
{
  "status": "initialized",
  "agents_registered": 11,
  "channels_created": 6
}
```

### Agents

#### GET /agents
List all agents.

**Response:**
```json
{
  "agents": [
    {
      "id": "planner_001",
      "role": "planner",
      "name": "NexusPlanner",
      "status": "idle",
      "capabilities": ["requirements_analysis", "user_stories"]
    },
    {
      "id": "architect_001",
      "role": "architect",
      "name": "NexusArchitect",
      "status": "idle",
      "capabilities": ["system_design", "api_contracts"]
    }
  ]
}
```

#### GET /agents/{id}
Get agent details.

### Tasks

#### POST /tasks
Create a new task.

**Request:**
```json
{
  "title": "User Authentication System",
  "description": "Implement JWT-based authentication with role-based access control",
  "priority": "high"
}
```

**Response:**
```json
{
  "id": "task_abc123",
  "title": "User Authentication System",
  "status": "pending",
  "created_at": "2026-06-13T22:00:00Z"
}
```

#### GET /tasks/{id}
Get task status.

#### GET /tasks
List all tasks.

### Workflow

#### POST /workflow/start
Start the development workflow.

**Request:**
```json
{
  "task_id": "task_abc123",
  "request": "Build a user authentication system"
}
```

**Response:**
```json
{
  "workflow_id": "wf_xyz789",
  "status": "started",
  "phase": "planning",
  "agents_involved": ["planner_001"]
}
```

#### GET /workflow/{id}
Get workflow status.

### Audit

#### GET /audit
Query audit trail.

**Query Parameters:**
- `event_type` - Filter by event type
- `agent_id` - Filter by agent
- `action` - Filter by action
- `since` - Start datetime
- `until` - End datetime
- `limit` - Max results (default: 100)

**Response:**
```json
{
  "entries": [
    {
      "sequence": 42,
      "timestamp": "2026-06-13T22:15:00Z",
      "event_type": "workflow",
      "agent_id": "planner_001",
      "action": "task_completed",
      "data_hash": "abc123...",
      "entry_hash": "def456..."
    }
  ],
  "total": 42
}
```

#### GET /audit/verify
Verify audit trail integrity.

**Response:**
```json
{
  "valid": true,
  "error": null,
  "entries_verified": 42
}
```

### Memory

#### POST /memory/store
Store knowledge.

**Request:**
```json
{
  "key": "architecture:auth",
  "content": "JWT-based authentication with refresh tokens",
  "tags": ["security", "auth"],
  "metadata": {"source": "planner_001"}
}
```

#### GET /memory/search
Search knowledge base.

**Query Parameters:**
- `query` - Search query
- `tags` - Filter by tags
- `limit` - Max results

**Response:**
```json
{
  "results": [
    {
      "key": "architecture:auth",
      "content": "JWT-based authentication with refresh tokens",
      "score": 0.95
    }
  ]
}
```

### Band

#### GET /band/channels
List Band channels.

#### GET /band/channels/{id}/messages
Get messages from a channel.

#### POST /band/channels/{id}/send
Send a message to a channel.

**Request:**
```json
{
  "sender": "human",
  "content": "@NexusPlanner Build a user auth system",
  "mentions": ["NexusPlanner"]
}
```

---

## WebSocket

Connect to `ws://localhost:8000/ws` for real-time updates.

### Events

```json
{
  "type": "agent_message",
  "agent": "NexusPlanner",
  "channel": "planning",
  "content": "Analyzing requirements...",
  "mentions": ["NexusArchitect"]
}
```

```json
{
  "type": "workflow_update",
  "workflow_id": "wf_xyz789",
  "phase": "design",
  "progress": 0.3
}
```

```json
{
  "type": "audit_entry",
  "sequence": 43,
  "event_type": "review",
  "action": "code_approved"
}
```

---

## SDK Usage

### Python

```python
from nexuscore.main import NexusCore

# Initialize
nexus = NexusCore()
nexus.initialize()

# Create task
task = nexus.add_task(
    title="User Auth System",
    description="JWT-based authentication"
)

# Run workflow
import asyncio
result = asyncio.run(nexus.run_workflow())

# Check audit trail
entries = nexus.audit.query(event_type="workflow")
is_valid, error = nexus.audit.verify_integrity()
```

### cURL

```bash
# Get status
curl http://localhost:8000/api/v1/status

# Create task
curl -X POST http://localhost:8000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Auth System", "description": "JWT auth"}'

# Start workflow
curl -X POST http://localhost:8000/api/v1/workflow/start \
  -H "Content-Type: application/json" \
  -d '{"task_id": "task_abc123", "request": "Build auth system"}'
```
