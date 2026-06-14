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

export interface AuditEntry {
  sequence: number;
  timestamp: string;
  event_type: string;
  agent_id: string;
  action: string;
  data_hash: string;
  entry_hash: string;
}

export interface MemoryEntry {
  key: string;
  content: string;
  tags: string[];
  timestamp: string;
}
