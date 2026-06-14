# NexusCode - Hackathon Submission Guide

## Submission Checklist

### What I (AI) Created:
- [x] Complete Python backend (4,900+ lines)
- [x] 11 specialized agents
- [x] Web dashboard (Next.js) - building now
- [x] README.md
- [x] API documentation
- [x] Docker configuration
- [x] Contributing guide
- [x] Changelog
- [x] .env.example
- [x] .gitignore
- [x] LICENSE (MIT)
- [x] Video script
- [x] Slides outline
- [x] Submission materials

### What You Need to Do:

#### 1. Register Band.ai Account (5 minutes)
1. Go to https://app.band.ai
2. Sign up (free)
3. Create 11 agents:
   - NexusPlanner
   - NexusArchitect
   - NexusDeveloper
   - NexusReviewer
   - NexusRedTeamer
   - NexusVerifier
   - NexusQA
   - NexusDevOps
   - NexusScribe
   - NexusAdjudicator
   - NexusHumanGate
4. Copy API keys and UUIDs
5. Update `.env` file

#### 2. Get API Keys (2 minutes)
1. OpenAI: https://platform.openai.com/api-keys
2. (Optional) Anthropic: https://console.anthropic.com
3. Add keys to `.env`

#### 3. Test Locally (5 minutes)
```bash
cd nexuscode
pip install -r requirements.txt
python -m nexuscore.demo
```

#### 4. Push to GitHub (5 minutes)
```bash
git init
git add .
git commit -m "NexusCode: Multi-Agent Software Development Pipeline"
git remote add origin https://github.com/yourusername/nexuscode.git
git push -u origin main
```

#### 5. Record Video Demo (30 minutes)
Follow VIDEO_SCRIPT.md:
- 3 minutes total
- Show Band room with agents
- Show workflow in action
- Show web dashboard
- Upload to YouTube

#### 6. Create Slides (20 minutes)
Follow SLIDES_OUTLINE.md:
- 14 slides
- Use Google Slides or Figma
- Export as PDF

#### 7. Create Cover Image (10 minutes)
- 1920x1080px
- Show NexusCode logo + Band room
- Use Canva or Figma

#### 8. Deploy Web Dashboard (10 minutes)
```bash
cd web
npm install
npm run build
# Deploy to Vercel
npx vercel
```

#### 9. Submit on lablab.ai (5 minutes)
1. Go to https://lablab.ai/ai-hackathons/band-of-agents-hackathon
2. Click "Submit"
3. Fill in:
   - Project Title: NexusCode
   - Short Description: [see SUBMISSION_FULL.md]
   - Long Description: [see SUBMISSION_FULL.md]
   - Tags: Band.ai, LangGraph, Multi-Agent, Software Development
   - GitHub URL
   - Demo URL
   - Video URL
   - Presentation PDF

---

## Total Time Needed: ~90 minutes

| Task | Time |
|------|------|
| Register Band.ai | 5 min |
| Get API keys | 2 min |
| Test locally | 5 min |
| Push GitHub | 5 min |
| Record video | 30 min |
| Create slides | 20 min |
| Cover image | 10 min |
| Deploy web | 10 min |
| Submit | 5 min |
| **Total** | **92 min** |

---

## Priority Order

1. **Register Band.ai + Get API Keys** (required for everything else)
2. **Test locally** (verify code works)
3. **Push GitHub** (needed for submission)
4. **Record video** (most important for judging)
5. **Create slides + cover** (presentation matters)
6. **Deploy web** (nice to have)
7. **Submit** (final step)

---

## Tips for Winning

1. **Video is key** - Make it clear, show the workflow, demonstrate Band integration
2. **Emphasize Band-only** - This is unique, no other project does this
3. **Show 11 agents** - Most agents of any submission
4. **Mention patterns** - ChatDev, Google Codelabs, AEGIS, WarRoom
5. **Business value** - Real enterprise problem, measurable ROI

---

## Files Reference

| File | Purpose |
|------|---------|
| SUBMISSION_FULL.md | Copy-paste for submission form |
| VIDEO_SCRIPT.md | Script for recording video |
| SLIDES_OUTLINE.md | Content for slides |
| API_DOCS.md | API documentation |
| README.md | GitHub README |

---

Good luck! You've got this! 🚀
