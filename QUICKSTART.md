# NexusCode Quick Start Guide

## 5-Minute Setup

### Step 1: Clone & Install

```bash
git clone https://github.com/yourusername/nexuscode.git
cd nexuscode
pip install -r requirements.txt
```

### Step 2: Get API Keys

1. **OpenAI API Key**: https://platform.openai.com/api-keys
2. **Band.ai Account**: https://app.band.ai (free signup)

### Step 3: Register Agents on Band

1. Go to https://app.band.ai/agents
2. Click "New Agent" → "External Agent"
3. Create 6 agents:
   - **Planner** - Product planning and user stories
   - **Architect** - System design and architecture
   - **Developer** - Code implementation
   - **Reviewer** - Code review and quality
   - **QA** - Testing and quality assurance
   - **Scribe** - Documentation

4. For each agent, copy:
   - Agent UUID (from settings page)
   - API Key (shown once on creation)

### Step 4: Configure

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` with your keys:
   ```
   OPENAI_API_KEY=sk-your-key
   BAND_API_KEY=band_your-key
   PLANNER_AGENT_ID=uuid-here
   ARCHITECT_AGENT_ID=uuid-here
   DEVELOPER_AGENT_ID=uuid-here
   REVIEWER_AGENT_ID=uuid-here
   QA_AGENT_ID=uuid-here
   SCRIBE_AGENT_ID=uuid-here
   ```

### Step 5: Run

```bash
python main.py
```

## Usage in Band.ai

1. Open Band.ai chat
2. Create a new room
3. Add all 6 agents
4. Send to Planner:
   ```
   @Planner Implement a user authentication system
   ```

5. Watch agents collaborate:
   - Planner → Architect → Developer → Reviewer → QA → Scribe

## Demo Mode

Run without Band connection:
```bash
python demo.py "Your feature request here"
```

## Project Structure

```
nexuscode/
├── agents/           # Agent implementations
│   ├── base.py      # Base agent class
│   ├── planner.py   # Product Planner
│   ├── architect.py # System Architect
│   ├── developer.py # Software Developer
│   ├── reviewer.py  # Code Reviewer
│   ├── qa.py        # QA Engineer
│   └── scribe.py    # Technical Writer
├── config.py        # Configuration
├── orchestrator.py  # Main orchestrator
├── main.py         # Entry point
└── demo.py         # Demo script
```

## Troubleshooting

### "Module not found" errors
```bash
pip install -r requirements.txt
```

### Band connection issues
1. Verify API keys in `.env`
2. Check agent UUIDs in `agent_config.yaml`
3. Ensure agents are registered on Band.ai

### Python version issues
Requires Python 3.11+. Check with:
```bash
python --version
```

## Next Steps

1. Customize agent system prompts in `config.py`
2. Add your own tools and integrations
3. Deploy to production
4. Contribute to the project!

## Support

- Band.ai Discord: https://discord.com/invite/5YkNXmYfjk
- GitHub Issues: https://github.com/yourusername/nexuscode/issues
