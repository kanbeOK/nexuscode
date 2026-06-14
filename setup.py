"""
NexusCode Setup Script

This script helps you set up the NexusCode project.
Run this after installing dependencies.
"""

import os
import sys
from pathlib import Path


def check_python_version():
    if sys.version_info < (3, 11):
        print("Error: Python 3.11 or higher is required.")
        print(f"Current version: {sys.version}")
        sys.exit(1)
    print(f"Python {sys.version_info.major}.{sys.version_info.minor} - OK")


def check_dependencies():
    required_packages = [
        "langchain_openai",
        "langgraph",
        "thenvoi"
    ]

    missing = []
    for package in required_packages:
        try:
            __import__(package)
            print(f"  {package} - installed")
        except ImportError:
            missing.append(package)
            print(f"  {package} - MISSING")

    if missing:
        print("\nMissing packages. Install with:")
        print("  pip install -r requirements.txt")
        return False
    return True


def create_env_file():
    env_file = Path(".env")
    if env_file.exists():
        print("\n.env file already exists.")
        return

    print("\nCreating .env file...")
    env_content = """# NexusCode Environment Variables
# Get your OpenAI API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-key-here

# Get your Band API key from: https://app.band.ai/agents
BAND_API_KEY=band_your-band-api-key-here

# Agent UUIDs from Band.ai (create agents first)
PLANNER_AGENT_ID=your-planner-uuid
ARCHITECT_AGENT_ID=your-architect-uuid
DEVELOPER_AGENT_ID=your-developer-uuid
REVIEWER_AGENT_ID=your-reviewer-uuid
QA_AGENT_ID=your-qa-uuid
SCRIBE_AGENT_ID=your-scribe-uuid
"""
    with open(".env", "w") as f:
        f.write(env_content)
    print("Created .env file - Please update with your API keys")


def create_agent_config():
    config_file = Path("agent_config.yaml")
    if config_file.exists():
        print("\nagent_config.yaml already exists.")
        return

    print("\nCreating agent_config.yaml...")
    config_content = """# NexusCode Agent Configuration
# Get these values from https://app.band.ai/agents

planner:
  agent_id: "PLANNER_AGENT_ID"
  api_key: "BAND_API_KEY"

architect:
  agent_id: "ARCHITECT_AGENT_ID"
  api_key: "BAND_API_KEY"

developer:
  agent_id: "DEVELOPER_AGENT_ID"
  api_key: "BAND_API_KEY"

reviewer:
  agent_id: "REVIEWER_AGENT_ID"
  api_key: "BAND_API_KEY"

qa:
  agent_id: "QA_AGENT_ID"
  api_key: "BAND_API_KEY"

scribe:
  agent_id: "SCRIBE_AGENT_ID"
  api_key: "BAND_API_KEY"
"""
    with open("agent_config.yaml", "w") as f:
        f.write(config_content)
    print("Created agent_config.yaml")


def print_next_steps():
    print("\n" + "=" * 60)
    print("Setup Complete!")
    print("=" * 60)
    print("""
Next Steps:

1. Get your API keys:
   - OpenAI: https://platform.openai.com/api-keys
   - Band.ai: https://app.band.ai

2. Register 6 agents on Band.ai:
   a. Go to https://app.band.ai/agents
   b. Click "New Agent" -> "External Agent"
   c. Create agents: Planner, Architect, Developer, Reviewer, QA, Scribe
   d. Copy API keys and UUIDs

3. Update .env file with your keys

4. Update agent_config.yaml with agent UUIDs

5. Run the demo:
   python demo.py

6. Run with Band.ai:
   python main.py

7. Create a chat room on Band.ai and add all agents

8. Send a feature request to @Planner

For detailed instructions, see QUICKSTART.md
""")


def main():
    print("=" * 60)
    print("NexusCode Setup")
    print("=" * 60)

    print("\nChecking Python version...")
    check_python_version()

    print("\nChecking dependencies...")
    check_dependencies()

    create_env_file()
    create_agent_config()

    print_next_steps()


if __name__ == "__main__":
    main()
