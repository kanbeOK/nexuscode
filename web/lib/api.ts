/**
 * NexusCode API Client - Connects to real backend
 */

const API_BASE = typeof window !== 'undefined'
  ? (window as any).ENV_API_URL || 'http://localhost:8000'
  : 'http://localhost:8000';

export interface Agent {
  role: string;
  name: string;
  handle: string;
  status: string;
}

export interface Message {
  agent: string;
  handle: string;
  content: string;
  timestamp: string;
  mentions: string[];
}

export interface SystemStatus {
  status: string;
  agents: number;
  band_config: number;
  openai_configured: boolean;
  band_sdk: boolean;
  history: number;
}

// Fetch system status
export async function fetchStatus(): Promise<SystemStatus> {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    return await res.json();
  } catch {
    return { status: 'offline', agents: 0, band_config: 0, openai_configured: false, band_sdk: false, history: 0 };
  }
}

// Fetch all agents
export async function fetchAgents(): Promise<Agent[]> {
  try {
    const res = await fetch(`${API_BASE}/api/agents`);
    const data = await res.json();
    return data.agents || [];
  } catch {
    return [];
  }
}

// Send message to agent system
export async function sendMessage(content: string, sender: string = 'user'): Promise<Message[]> {
  try {
    const res = await fetch(`${API_BASE}/api/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, sender })
    });
    const data = await res.json();
    return data.responses || [];
  } catch {
    return [];
  }
}

// Fetch conversation history
export async function fetchHistory(): Promise<Message[]> {
  try {
    const res = await fetch(`${API_BASE}/api/history`);
    const data = await res.json();
    return data.history || [];
  } catch {
    return [];
  }
}

// WebSocket connection for real-time updates
export function connectWebSocket(onMessage: (msg: Message) => void): WebSocket | null {
  try {
    const ws = new WebSocket(`ws://localhost:8000/ws`);
    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      onMessage(msg);
    };
    ws.onerror = () => console.log('WebSocket connection failed');
    return ws;
  } catch {
    return null;
  }
}

// Workflow steps
export const WORKFLOW_STEPS = [
  { id: 'planner', agent: 'NexusPlanner', role: 'planner', color: '#3b82f6' },
  { id: 'architect', agent: 'NexusArchitect', role: 'architect', color: '#8b5cf6' },
  { id: 'developer', agent: 'NexusDeveloper', role: 'developer', color: '#10b981' },
  { id: 'reviewer', agent: 'NexusReviewer', role: 'reviewer', color: '#f59e0b' },
  { id: 'red_teamer', agent: 'NexusRedTeamer', role: 'red_teamer', color: '#ef4444' },
  { id: 'verifier', agent: 'NexusVerifier', role: 'verifier', color: '#06b6d4' },
  { id: 'qa', agent: 'NexusQA', role: 'qa', color: '#ec4899' },
  { id: 'devops', agent: 'NexusDevOps', role: 'devops', color: '#14b8a6' },
  { id: 'scribe', agent: 'NexusScribe', role: 'scribe', color: '#a855f7' },
];

// Mock data for demo mode (when backend is offline)
export function getMockAgents(): Agent[] {
  return WORKFLOW_STEPS.map(step => ({
    role: step.role,
    name: step.agent,
    handle: `@lamt78789/nexus${step.role}`,
    status: 'online'
  }));
}

export function getMockMessages(): Message[] {
  return [
    { agent: 'planner', handle: '@lamt78789/nexusplanner', content: 'Analyzing requirements...', timestamp: new Date().toISOString(), mentions: [] },
    { agent: 'architect', handle: '@lamt78789/nexusarchitect', content: 'Designing architecture...', timestamp: new Date().toISOString(), mentions: [] },
  ];
}
