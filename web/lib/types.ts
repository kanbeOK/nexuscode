export interface Agent {
  id: string;
  name: string;
  role: string;
  description: string;
  status: 'active' | 'idle' | 'processing' | 'error';
  avatar: string;
  capabilities: string[];
  metrics: AgentMetrics;
  currentTask?: string;
  lastActive: string;
}

export interface AgentMetrics {
  tasksCompleted: number;
  successRate: number;
  avgResponseTime: number;
  uptime: number;
  totalTokensUsed: number;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agent: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  duration?: number;
  input?: string;
  output?: string;
  dependencies: string[];
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  agent: string;
  action: string;
  details: string;
  hash: string;
  previousHash: string;
  metadata: Record<string, string>;
}

export interface MemoryEntry {
  id: string;
  type: 'context' | 'decision' | 'error' | 'learning' | 'preference';
  content: string;
  tags: string[];
  agent: string;
  timestamp: string;
  relevance?: number;
}

export interface BandMessage {
  id: string;
  agent: string;
  content: string;
  mentions: string[];
  timestamp: string;
  type: 'message' | 'mention' | 'system' | 'alert';
}

export interface MetricsData {
  totalTasks: number;
  completedTasks: number;
  activeWorkflows: number;
  avgResponseTime: number;
  successRate: number;
  tokensUsed: number;
  costEstimate: number;
  uptime: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'down';
  components: {
    name: string;
    status: 'operational' | 'degraded' | 'down';
    latency: number;
  }[];
}
