# NexusCode Launch Script (PowerShell)
# Run this to start the multi-agent system

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  NexusCode - Multi-Agent Software Development Pipeline" -ForegroundColor Cyan
Write-Host "  Band of Agents Hackathon 2026" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check Python version
try {
    $pythonVersion = python --version 2>&1
    Write-Host "Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Python not found. Please install Python 3.11+" -ForegroundColor Red
    exit 1
}

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Warning: .env file not found." -ForegroundColor Yellow
    Write-Host "Please run: python setup.py" -ForegroundColor Yellow
    exit 1
}

# Check if agent_config.yaml exists
if (-not (Test-Path "agent_config.yaml")) {
    Write-Host "Warning: agent_config.yaml not found." -ForegroundColor Yellow
    Write-Host "Please run: python setup.py" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Starting NexusCode..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Option 1: Run demo (no Band connection)" -ForegroundColor White
Write-Host "Option 2: Run with Band.ai" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Running demo mode..." -ForegroundColor Green
        python demo.py
    }
    "2" {
        Write-Host ""
        Write-Host "Starting with Band.ai connection..." -ForegroundColor Green
        Write-Host "Make sure your Band.ai agents are registered!" -ForegroundColor Yellow
        python main.py
    }
    default {
        Write-Host "Invalid choice. Running demo mode..." -ForegroundColor Yellow
        python demo.py
    }
}

Read-Host "Press Enter to exit"
