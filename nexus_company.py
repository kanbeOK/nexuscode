"""
NexusCode 2.0 - Inspired by ChatDev
Virtual Software Company with Band.ai Coordination

Key improvements:
- Company hierarchy (CEO, CTO, Tech Lead)
- Chat Chain for dialogue phases
- Memory & Experience system
- YAML workflow configuration
- Code execution sandbox
"""

import json
from datetime import datetime

try:
    import yaml
except ImportError:
    yaml = None
from typing import Dict, List, Optional, Any
from enum import Enum
from pathlib import Path


class CompanyRole(Enum):
    CEO = "ceo"
    CTO = "cto"
    TECH_LEAD = "tech_lead"
    PLANNER = "planner"
    ARCHITECT = "architect"
    DEVELOPER = "developer"
    REVIEWER = "reviewer"
    QA = "qa"
    SCRIBE = "scribe"
    DESIGNER = "designer"


class PhaseType(Enum):
    REQUIREMENTS = "requirements"
    DESIGN = "design"
    IMPLEMENTATION = "implementation"
    REVIEW = "review"
    TESTING = "testing"
    DOCUMENTATION = "documentation"
    DEPLOYMENT = "deployment"


class ChatChain:
    """A chain of dialogue phases between agents"""

    def __init__(self, task_id: str, description: str):
        self.task_id = task_id
        self.description = description
        self.phases: List[Dict] = []
        self.current_phase = 0
        self.context = {}
        self.memory = []

    def add_phase(self, phase_type: PhaseType, agents: List[CompanyRole],
                  goal: str, max_turns: int = 5):
        phase = {
            "id": len(self.phases) + 1,
            "type": phase_type,
            "agents": agents,
            "goal": goal,
            "max_turns": max_turns,
            "current_turn": 0,
            "messages": [],
            "status": "pending"
        }
        self.phases.append(phase)
        return phase

    def start_phase(self, phase_id: int):
        if 0 < phase_id <= len(self.phases):
            self.phases[phase_id - 1]["status"] = "in_progress"
            self.current_phase = phase_id

    def complete_phase(self, phase_id: int, result: Any):
        if 0 < phase_id <= len(self.phases):
            self.phases[phase_id - 1]["status"] = "completed"
            self.phases[phase_id - 1]["result"] = result
            self.context[f"phase_{phase_id}"] = result

    def add_message(self, phase_id: int, sender: CompanyRole,
                    recipient: CompanyRole, content: str):
        if 0 < phase_id <= len(self.phases):
            message = {
                "sender": sender.value,
                "recipient": recipient.value,
                "content": content,
                "timestamp": datetime.now().isoformat()
            }
            self.phases[phase_id - 1]["messages"].append(message)

    def get_current_context(self) -> Dict:
        return {
            "task_id": self.task_id,
            "description": self.description,
            "current_phase": self.current_phase,
            "completed_phases": [p["id"] for p in self.phases if p["status"] == "completed"],
            "context": self.context
        }

    def to_dict(self) -> Dict:
        return {
            "task_id": self.task_id,
            "description": self.description,
            "phases": self.phases,
            "current_phase": self.current_phase,
            "context": self.context,
            "memory": self.memory
        }


class AgentMemory:
    """Memory system for agents to learn from experience"""

    def __init__(self, agent_role: CompanyRole):
        self.agent_role = agent_role
        self.experiences: List[Dict] = []
        self.knowledge_base: Dict[str, Any] = {}

    def add_experience(self, task_id: str, phase: str, outcome: str,
                       lessons_learned: List[str]):
        experience = {
            "task_id": task_id,
            "phase": phase,
            "outcome": outcome,
            "lessons_learned": lessons_learned,
            "timestamp": datetime.now().isoformat()
        }
        self.experiences.append(experience)

    def get_similar_experiences(self, phase: str, limit: int = 3) -> List[Dict]:
        similar = [e for e in self.experiences if e["phase"] == phase]
        return sorted(similar, key=lambda x: x["timestamp"], reverse=True)[:limit]

    def update_knowledge(self, key: str, value: Any):
        self.knowledge_base[key] = value

    def get_knowledge(self, key: str) -> Optional[Any]:
        return self.knowledge_base.get(key)


class NexusCompany:
    """Virtual software company orchestrating agents"""

    def __init__(self, company_name: str = "NexusCode"):
        self.company_name = company_name
        self.agents: Dict[CompanyRole, Dict] = {}
        self.chat_chains: List[ChatChain] = []
        self.memories: Dict[CompanyRole, AgentMemory] = {}
        self.active_tasks: List[str] = []

    def register_agent(self, role: CompanyRole, name: str,
                       system_prompt: str, model: str = "gpt-4o"):
        self.agents[role] = {
            "name": name,
            "role": role,
            "system_prompt": system_prompt,
            "model": model,
            "status": "idle"
        }
        self.memories[role] = AgentMemory(role)

    def create_project(self, description: str) -> ChatChain:
        task_id = f"PROJECT-{len(self.chat_chains) + 1:04d}"
        chain = ChatChain(task_id, description)

        # Define standard development phases (inspired by ChatDev)
        chain.add_phase(
            PhaseType.REQUIREMENTS,
            [CompanyRole.CEO, CompanyRole.PLANNER],
            "Analyze requirements and create user stories",
            max_turns=3
        )
        chain.add_phase(
            PhaseType.DESIGN,
            [CompanyRole.CTO, CompanyRole.ARCHITECT],
            "Design system architecture and technical specifications",
            max_turns=3
        )
        chain.add_phase(
            PhaseType.IMPLEMENTATION,
            [CompanyRole.TECH_LEAD, CompanyRole.DEVELOPER],
            "Implement code based on architecture",
            max_turns=5
        )
        chain.add_phase(
            PhaseType.REVIEW,
            [CompanyRole.REVIEWER, CompanyRole.DEVELOPER],
            "Review code quality and provide feedback",
            max_turns=3
        )
        chain.add_phase(
            PhaseType.TESTING,
            [CompanyRole.QA, CompanyRole.DEVELOPER],
            "Create and execute test plans",
            max_turns=3
        )
        chain.add_phase(
            PhaseType.DOCUMENTATION,
            [CompanyRole.SCRIBE, CompanyRole.TECH_LEAD],
            "Create comprehensive documentation",
            max_turns=2
        )

        self.chat_chains.append(chain)
        self.active_tasks.append(task_id)
        return chain

    def execute_phase(self, chain: ChatChain, phase_id: int,
                      human_input: Optional[str] = None) -> Dict:
        phase = chain.phases[phase_id - 1]
        chain.start_phase(phase_id)

        # Get context from previous phases
        context = chain.get_current_context()

        # Simulate agent collaboration
        result = {
            "phase_id": phase_id,
            "phase_type": phase["type"].value,
            "agents_involved": [a.value for a in phase["agents"]],
            "messages": [],
            "output": None
        }

        # Add role-specific logic
        if phase["type"] == PhaseType.REQUIREMENTS:
            result["output"] = self._handle_requirements(phase, context, human_input)
        elif phase["type"] == PhaseType.DESIGN:
            result["output"] = self._handle_design(phase, context, human_input)
        elif phase["type"] == PhaseType.IMPLEMENTATION:
            result["output"] = self._handle_implementation(phase, context, human_input)
        elif phase["type"] == PhaseType.REVIEW:
            result["output"] = self._handle_review(phase, context, human_input)
        elif phase["type"] == PhaseType.TESTING:
            result["output"] = self._handle_testing(phase, context, human_input)
        elif phase["type"] == PhaseType.DOCUMENTATION:
            result["output"] = self._handle_documentation(phase, context, human_input)

        chain.complete_phase(phase_id, result["output"])
        return result

    def _handle_requirements(self, phase: Dict, context: Dict,
                             human_input: Optional[str]) -> Dict:
        return {
            "user_stories": [
                {"id": "US-001", "title": "User Registration",
                 "description": "As a user, I want to register an account"},
                {"id": "US-002", "title": "User Login",
                 "description": "As a user, I want to login to my account"},
                {"id": "US-003", "title": "Password Reset",
                 "description": "As a user, I want to reset my password"}
            ],
            "acceptance_criteria": ["All endpoints return proper HTTP status codes",
                                    "Passwords are hashed with bcrypt",
                                    "JWT tokens expire after 24 hours"]
        }

    def _handle_design(self, phase: Dict, context: Dict,
                       human_input: Optional[str]) -> Dict:
        return {
            "architecture": "REST API with FastAPI",
            "components": ["Auth Service", "User Service", "Token Service"],
            "api_endpoints": [
                {"method": "POST", "path": "/auth/register", "description": "Register user"},
                {"method": "POST", "path": "/auth/login", "description": "Login user"},
                {"method": "POST", "path": "/auth/reset-password", "description": "Reset password"}
            ],
            "data_models": ["User", "Token", "PasswordReset"],
            "database": "PostgreSQL with SQLAlchemy ORM"
        }

    def _handle_implementation(self, phase: Dict, context: Dict,
                               human_input: Optional[str]) -> Dict:
        return {
            "files_created": ["app/main.py", "app/models/user.py",
                              "app/routes/auth.py", "app/services/auth_service.py"],
            "dependencies": ["fastapi", "sqlalchemy", "python-jose", "passlib"],
            "code_quality": "Follows PEP8, includes type hints and docstrings"
        }

    def _handle_review(self, phase: Dict, context: Dict,
                       human_input: Optional[str]) -> Dict:
        return {
            "status": "APPROVED",
            "quality_score": 8.5,
            "security_score": 9.0,
            "issues_found": [
                {"severity": "minor", "description": "Add rate limiting to login endpoint"},
                {"severity": "minor", "description": "Add input validation for email format"}
            ],
            "recommendations": ["Add API documentation with OpenAPI",
                                "Implement refresh token mechanism"]
        }

    def _handle_testing(self, phase: Dict, context: Dict,
                        human_input: Optional[str]) -> Dict:
        return {
            "test_plan": "Comprehensive unit and integration tests",
            "test_cases": 25,
            "coverage": "92%",
            "results": {
                "passed": 23,
                "failed": 0,
                "skipped": 2
            }
        }

    def _handle_documentation(self, phase: Dict, context: Dict,
                              human_input: Optional[str]) -> Dict:
        return {
            "readme": "Created with setup instructions and API reference",
            "api_docs": "OpenAPI specification generated",
            "user_guide": "Step-by-step usage guide",
            "changelog": "Version 1.0.0 initial release"
        }

    def get_project_status(self, chain: ChatChain) -> Dict:
        completed = sum(1 for p in chain.phases if p["status"] == "completed")
        total = len(chain.phases)
        return {
            "task_id": chain.task_id,
            "description": chain.description,
            "progress": f"{completed}/{total} phases",
            "percentage": (completed / total * 100) if total > 0 else 0,
            "current_phase": chain.current_phase,
            "phases": [{"id": p["id"], "type": p["type"].value,
                        "status": p["status"]} for p in chain.phases]
        }


def create_demo_company():
    company = NexusCompany("NexusCode Labs")

    # Register agents with detailed prompts
    company.register_agent(
        CompanyRole.CEO,
        "Visionary CEO",
        """You are the CEO of NexusCode Labs. Your role is to:
1. Understand business requirements from stakeholders
2. Prioritize features based on business value
3. Make high-level decisions about project scope
4. Ensure alignment between technical and business goals
5. Communicate with stakeholders and approve final deliverables

Always consider ROI, time-to-market, and user experience.""",
        "gpt-4o"
    )

    company.register_agent(
        CompanyRole.CTO,
        "Technical CTO",
        """You are the CTO of NexusCode Labs. Your role is to:
1. Make technology stack decisions
2. Review architectural designs
3. Ensure technical feasibility
4. Guide the technical team
5. Evaluate risks and trade-offs

Focus on scalability, maintainability, and security.""",
        "gpt-4o"
    )

    company.register_agent(
        CompanyRole.TECH_LEAD,
        "Tech Lead",
        """You are the Tech Lead at NexusCode Labs. Your role is to:
1. Break down tasks for developers
2. Set coding standards and best practices
3. Review code and provide guidance
4. Mentor junior developers
5. Ensure code quality and consistency

Emphasize clean code, testing, and documentation.""",
        "gpt-4o"
    )

    company.register_agent(
        CompanyRole.PLANNER,
        "Product Planner",
        """You are the Product Planner at NexusCode Labs. Your role is to:
1. Analyze feature requirements
2. Create detailed user stories
3. Define acceptance criteria
4. Estimate complexity and timeline
5. Identify dependencies

Use agile methodology and clear documentation.""",
        "gpt-4o"
    )

    company.register_agent(
        CompanyRole.ARCHITECT,
        "System Architect",
        """You are the System Architect at NexusCode Labs. Your role is to:
1. Design system architecture
2. Define API contracts
3. Create data models
4. Plan database schema
5. Identify integration points

Focus on scalability, performance, and security.""",
        "gpt-4o"
    )

    company.register_agent(
        CompanyRole.DEVELOPER,
        "Senior Developer",
        """You are a Senior Developer at NexusCode Labs. Your role is to:
1. Write clean, production-ready code
2. Follow coding standards
3. Write unit tests
4. Document your code
5. Collaborate with team members

Use best practices: SOLID principles, DRY, KISS.""",
        "gpt-4o"
    )

    company.register_agent(
        CompanyRole.REVIEWER,
        "Code Reviewer",
        """You are the Code Reviewer at NexusCode Labs. Your role is to:
1. Review code for quality and security
2. Check for best practices
3. Provide constructive feedback
4. Approve or request changes
5. Ensure code consistency

Focus on readability, maintainability, and security.""",
        "gpt-4o"
    )

    company.register_agent(
        CompanyRole.QA,
        "QA Engineer",
        """You are the QA Engineer at NexusCode Labs. Your role is to:
1. Create comprehensive test plans
2. Write automated tests
3. Execute test cases
4. Report bugs and issues
5. Verify fixes

Ensure high coverage and edge case handling.""",
        "gpt-4o"
    )

    company.register_agent(
        CompanyRole.SCRIBE,
        "Technical Writer",
        """You are the Technical Writer at NexusCode Labs. Your role is to:
1. Create README and setup guides
2. Write API documentation
3. Create user guides
4. Document architecture decisions
5. Maintain changelog

Write clear, concise, and helpful documentation.""",
        "gpt-4o"
    )

    return company


if __name__ == "__main__":
    company = create_demo_company()
    print(f"Created company: {company.company_name}")
    print(f"Registered agents: {len(company.agents)}")

    # Create a project
    chain = company.create_project("Build a user authentication system with JWT")

    # Execute all phases
    for i in range(1, len(chain.phases) + 1):
        result = company.execute_phase(chain, i)
        print(f"\nPhase {i} ({result['phase_type']}): {result['output']}")

    # Get project status
    status = company.get_project_status(chain)
    print(f"\nProject Status: {json.dumps(status, indent=2)}")
