# Contributing to NexusCode

Thank you for your interest in contributing to NexusCode! This document provides guidelines and information about contributing.

## Getting Started

1. Fork the repository
2. Clone your fork
3. Create a feature branch
4. Make your changes
5. Submit a pull request

## Development Setup

```bash
# Clone
git clone https://github.com/yourusername/nexuscode.git
cd nexuscode

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run tests
python -m pytest nexuscore/tests/ -v
```

## Code Style

- Follow PEP 8
- Use type hints
- Write docstrings for all public functions
- Keep functions under 50 lines
- Keep files under 500 lines

## Testing

```bash
# Run all tests
python -m pytest nexuscore/tests/ -v

# Run with coverage
python -m pytest nexuscore/tests/ --cov=nexuscore

# Run specific test
python -m pytest nexuscore/tests/test_agents.py -v
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Submit PR with clear description

## Code of Conduct

- Be respectful
- Welcome newcomers
- Focus on constructive feedback
- No harassment or discrimination

## Questions?

Open an issue or reach out on Discord.
