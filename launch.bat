@echo off
REM NexusCode Launch Script
REM Run this to start the multi-agent system

echo ============================================================
echo   NexusCode - Multi-Agent Software Development Pipeline
echo   Band of Agents Hackathon 2026
echo ============================================================
echo.

REM Check Python version
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

REM Check if .env exists
if not exist .env (
    echo Warning: .env file not found.
    echo Please run: python setup.py
    pause
    exit /b 1
)

REM Check if agent_config.yaml exists
if not exist agent_config.yaml (
    echo Warning: agent_config.yaml not found.
    echo Please run: python setup.py
    pause
    exit /b 1
)

echo Starting NexusCode...
echo.
echo Option 1: Run demo (no Band connection)
echo Option 2: Run with Band.ai
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="1" (
    echo.
    echo Running demo mode...
    python demo.py
) else if "%choice%"=="2" (
    echo.
    echo Starting with Band.ai connection...
    echo Make sure your Band.ai agents are registered!
    python main.py
) else (
    echo Invalid choice. Running demo mode...
    python demo.py
)

pause
