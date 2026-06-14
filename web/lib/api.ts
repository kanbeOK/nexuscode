import {
  Agent,
  Workflow,
  WorkflowStep,
  AuditEntry,
  MemoryEntry,
  BandMessage,
  MetricsData,
  SystemStatus,
} from './types';

const AGENTS: Agent[] = [
  {
    id: 'planner',
    name: 'NexusPlanner',
    role: 'Strategic Planner',
    description: 'Analyzes requirements and creates high-level project plans with milestone definitions and resource allocation.',
    status: 'active',
    avatar: '🎯',
    capabilities: ['Requirement Analysis', 'Roadmap Creation', 'Resource Planning', 'Risk Assessment'],
    metrics: { tasksCompleted: 1247, successRate: 98.7, avgResponseTime: 2.3, uptime: 99.9, totalTokensUsed: 2840000 },
    currentTask: 'Analyzing Q4 product roadmap requirements',
    lastActive: '2026-06-14T00:01:00Z',
  },
  {
    id: 'architect',
    name: 'NexusArchitect',
    role: 'System Architect',
    description: 'Designs system architecture, defines technical patterns, and creates detailed component specifications.',
    status: 'active',
    avatar: '🏗️',
    capabilities: ['Architecture Design', 'Pattern Recognition', 'Component Specification', 'Tech Stack Selection'],
    metrics: { tasksCompleted: 892, successRate: 99.2, avgResponseTime: 3.1, uptime: 99.8, totalTokensUsed: 3120000 },
    currentTask: 'Designing microservices architecture for payment module',
    lastActive: '2026-06-14T00:02:00Z',
  },
  {
    id: 'developer',
    name: 'NexusDeveloper',
    role: 'Full-Stack Developer',
    description: 'Writes production-quality code across multiple languages and frameworks with best practices.',
    status: 'processing',
    avatar: '💻',
    capabilities: ['Code Generation', 'Refactoring', 'API Development', 'Database Design', 'Frontend Development'],
    metrics: { tasksCompleted: 3421, successRate: 97.8, avgResponseTime: 4.2, uptime: 99.7, totalTokensUsed: 8940000 },
    currentTask: 'Implementing user authentication flow with OAuth2',
    lastActive: '2026-06-14T00:03:00Z',
  },
  {
    id: 'reviewer',
    name: 'NexusReviewer',
    role: 'Code Reviewer',
    description: 'Performs thorough code reviews focusing on quality, standards compliance, and best practices.',
    status: 'active',
    avatar: '🔍',
    capabilities: ['Code Review', 'Best Practices', 'Standards Compliance', 'Performance Analysis'],
    metrics: { tasksCompleted: 2156, successRate: 99.5, avgResponseTime: 1.8, uptime: 99.9, totalTokensUsed: 4230000 },
    currentTask: 'Reviewing pull request #482: Payment gateway integration',
    lastActive: '2026-06-14T00:02:30Z',
  },
  {
    id: 'redteamer',
    name: 'NexusRedTeam',
    role: 'Security Analyst',
    description: 'Identifies security vulnerabilities, performs threat modeling, and ensures secure coding practices.',
    status: 'active',
    avatar: '🛡️',
    capabilities: ['Security Audit', 'Vulnerability Detection', 'Threat Modeling', 'Penetration Testing'],
    metrics: { tasksCompleted: 987, successRate: 99.8, avgResponseTime: 2.7, uptime: 99.9, totalTokensUsed: 2670000 },
    currentTask: 'Running OWASP Top 10 security scan on authentication module',
    lastActive: '2026-06-14T00:01:45Z',
  },
  {
    id: 'qa',
    name: 'NexusQA',
    role: 'Quality Assurance',
    description: 'Creates and executes comprehensive test suites including unit, integration, and e2e tests.',
    status: 'active',
    avatar: '🧪',
    capabilities: ['Test Generation', 'Test Planning', 'E2E Testing', 'Performance Testing', 'Regression Analysis'],
    metrics: { tasksCompleted: 4523, successRate: 98.9, avgResponseTime: 3.5, uptime: 99.8, totalTokensUsed: 6120000 },
    currentTask: 'Generating integration tests for payment processing pipeline',
    lastActive: '2026-06-14T00:03:10Z',
  },
  {
    id: 'devops',
    name: 'NexusDevOps',
    role: 'DevOps Engineer',
    description: 'Manages CI/CD pipelines, infrastructure as code, container orchestration, and deployment strategies.',
    status: 'idle',
    avatar: '🚀',
    capabilities: ['CI/CD Pipeline', 'Infrastructure as Code', 'Container Management', 'Deployment Automation', 'Monitoring'],
    metrics: { tasksCompleted: 1876, successRate: 99.4, avgResponseTime: 5.1, uptime: 99.9, totalTokensUsed: 3450000 },
    lastActive: '2026-06-14T00:00:30Z',
  },
  {
    id: 'scribe',
    name: 'NexusScribe',
    role: 'Technical Writer',
    description: 'Generates comprehensive documentation, API references, user guides, and technical specifications.',
    status: 'active',
    avatar: '📝',
    capabilities: ['Documentation', 'API Reference', 'User Guides', 'Changelog Generation', 'README Creation'],
    metrics: { tasksCompleted: 1534, successRate: 99.1, avgResponseTime: 2.0, uptime: 99.9, totalTokensUsed: 2890000 },
    currentTask: 'Updating API documentation for v2.4 release',
    lastActive: '2026-06-14T00:02:15Z',
  },
  {
    id: 'debugger',
    name: 'NexusDebugger',
    role: 'Debug Specialist',
    description: 'Identifies and resolves complex bugs, performs root cause analysis, and implements fixes.',
    status: 'active',
    avatar: '🐛',
    capabilities: ['Bug Detection', 'Root Cause Analysis', 'Stack Trace Analysis', 'Memory Leak Detection'],
    metrics: { tasksCompleted: 2890, successRate: 98.5, avgResponseTime: 2.9, uptime: 99.8, totalTokensUsed: 4780000 },
    currentTask: 'Investigating race condition in concurrent request handler',
    lastActive: '2026-06-14T00:03:20Z',
  },
  {
    id: 'optimizer',
    name: 'NexusOptimizer',
    role: 'Performance Engineer',
    description: 'Optimizes code performance, identifies bottlenecks, and implements efficiency improvements.',
    status: 'idle',
    avatar: '⚡',
    capabilities: ['Performance Profiling', 'Bottleneck Analysis', 'Algorithm Optimization', 'Memory Optimization'],
    metrics: { tasksCompleted: 1123, successRate: 99.3, avgResponseTime: 3.8, uptime: 99.9, totalTokensUsed: 2340000 },
    lastActive: '2026-06-13T23:58:00Z',
  },
  {
    id: 'integrator',
    name: 'NexusIntegrator',
    role: 'Integration Specialist',
    description: 'Manages third-party integrations, API connections, and system interoperability.',
    status: 'active',
    avatar: '🔗',
    capabilities: ['API Integration', 'Webhook Management', 'Data Synchronization', 'Service Mesh'],
    metrics: { tasksCompleted: 1678, successRate: 99.0, avgResponseTime: 4.5, uptime: 99.7, totalTokensUsed: 3560000 },
    currentTask: 'Configuring Stripe payment API integration',
    lastActive: '2026-06-14T00:01:30Z',
  },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'step-1',
    name: 'Requirements Analysis',
    agent: 'planner',
    status: 'completed',
    startTime: '2026-06-14T00:00:00Z',
    endTime: '2026-06-14T00:05:00Z',
    duration: 300,
    input: 'User stories and business requirements for payment module',
    output: 'Structured requirement document with acceptance criteria',
    dependencies: [],
  },
  {
    id: 'step-2',
    name: 'Architecture Design',
    agent: 'architect',
    status: 'completed',
    startTime: '2026-06-14T00:05:00Z',
    endTime: '2026-06-14T00:15:00Z',
    duration: 600,
    input: 'Requirement document from Planner',
    output: 'Technical architecture with component diagrams',
    dependencies: ['step-1'],
  },
  {
    id: 'step-3',
    name: 'Implementation',
    agent: 'developer',
    status: 'active',
    startTime: '2026-06-14T00:15:00Z',
    input: 'Architecture specifications',
    output: '',
    dependencies: ['step-2'],
  },
  {
    id: 'step-4',
    name: 'Code Review',
    agent: 'reviewer',
    status: 'pending',
    input: 'Code implementation',
    output: '',
    dependencies: ['step-3'],
  },
  {
    id: 'step-5',
    name: 'Security Audit',
    agent: 'redteamer',
    status: 'pending',
    input: 'Code implementation',
    output: '',
    dependencies: ['step-3'],
  },
  {
    id: 'step-6',
    name: 'Quality Assurance',
    agent: 'qa',
    status: 'pending',
    input: 'Reviewed and secured code',
    output: '',
    dependencies: ['step-4', 'step-5'],
  },
  {
    id: 'step-7',
    name: 'Deployment',
    agent: 'devops',
    status: 'pending',
    input: 'Tested and approved code',
    output: '',
    dependencies: ['step-6'],
  },
  {
    id: 'step-8',
    name: 'Documentation',
    agent: 'scribe',
    status: 'pending',
    input: 'Complete feature implementation',
    output: '',
    dependencies: ['step-6'],
  },
];

const AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-06-14T00:05:00Z',
    agent: 'planner',
    action: 'requirements_analyzed',
    details: 'Completed analysis of 24 user stories for payment module. Generated structured requirement document with 8 acceptance criteria per story.',
    hash: 'a3f2b8c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    previousHash: '0000000000000000000000000000000000000000000000000000000000000000',
    metadata: { project: 'payment-module', version: '1.0.0', stories_count: '24' },
  },
  {
    id: 'audit-002',
    timestamp: '2026-06-14T00:15:00Z',
    agent: 'architect',
    action: 'architecture_designed',
    details: 'Designed microservices architecture with 6 core services. Selected event-driven pattern with message queue for async communication.',
    hash: 'b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3',
    previousHash: 'a3f2b8c9d1e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0',
    metadata: { services_count: '6', pattern: 'event-driven', message_queue: 'RabbitMQ' },
  },
  {
    id: 'audit-003',
    timestamp: '2026-06-14T00:30:00Z',
    agent: 'developer',
    action: 'code_committed',
    details: 'Implemented PaymentService with Stripe integration. Added 12 new files, modified 3 existing. Total lines: 2,847.',
    hash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
    previousHash: 'b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3',
    metadata: { files_added: '12', files_modified: '3', lines_added: '2847' },
  },
  {
    id: 'audit-004',
    timestamp: '2026-06-14T00:45:00Z',
    agent: 'reviewer',
    action: 'review_completed',
    details: 'Code review passed with 3 minor suggestions. No critical issues found. Performance rating: 9.2/10.',
    hash: 'd6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5',
    previousHash: 'c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4',
    metadata: { rating: '9.2', suggestions: '3', critical_issues: '0' },
  },
  {
    id: 'audit-005',
    timestamp: '2026-06-14T01:00:00Z',
    agent: 'redteamer',
    action: 'security_scan_complete',
    details: 'OWASP Top 10 scan completed. No vulnerabilities found. All inputs properly sanitized. Authentication flow validated.',
    hash: 'e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6',
    previousHash: 'd6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5',
    metadata: { vulnerabilities: '0', scans_performed: '15', compliance: 'OWASP-Top10' },
  },
  {
    id: 'audit-006',
    timestamp: '2026-06-14T01:15:00Z',
    agent: 'qa',
    action: 'tests_executed',
    details: 'Test suite completed: 847 passed, 0 failed, 2 skipped. Coverage: 94.2%. E2E tests: 156 scenarios validated.',
    hash: 'f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7',
    previousHash: 'e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6',
    metadata: { passed: '847', failed: '0', coverage: '94.2', e2e_scenarios: '156' },
  },
  {
    id: 'audit-007',
    timestamp: '2026-06-14T01:30:00Z',
    agent: 'devops',
    action: 'deployment_initiated',
    details: 'Initiating blue-green deployment to production. Infrastructure provisioned via Terraform. Docker images built and pushed.',
    hash: 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
    previousHash: 'f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7',
    metadata: { strategy: 'blue-green', infra: 'terraform', registry: 'ecr' },
  },
  {
    id: 'audit-008',
    timestamp: '2026-06-14T01:45:00Z',
    agent: 'scribe',
    action: 'documentation_generated',
    details: 'API documentation updated for v2.4. Added 47 new endpoint descriptions. Generated OpenAPI spec and developer guide.',
    hash: 'b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9',
    previousHash: 'a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8',
    metadata: { endpoints_documented: '47', format: 'OpenAPI-3.0', guide_pages: '23' },
  },
];

const MEMORY_ENTRIES: MemoryEntry[] = [
  {
    id: 'mem-001',
    type: 'decision',
    content: 'Selected event-driven microservices architecture for payment module to ensure scalability and fault tolerance. RabbitMQ chosen as message broker for reliable delivery.',
    tags: ['architecture', 'microservices', 'payment', 'rabbitmq'],
    agent: 'architect',
    timestamp: '2026-06-14T00:15:00Z',
  },
  {
    id: 'mem-002',
    type: 'context',
    content: 'Customer requirement: Payment processing must support Stripe, PayPal, and bank transfers. PCI-DSS compliance mandatory. Transaction limits: $10,000 per transaction.',
    tags: ['requirements', 'payment', 'compliance', 'pci-dss'],
    agent: 'planner',
    timestamp: '2026-06-14T00:05:00Z',
  },
  {
    id: 'mem-003',
    type: 'learning',
    content: 'Previous Stripe integration had issues with webhook signature verification. Ensure using stripe-webhooks package with proper secret rotation.',
    tags: ['stripe', 'webhook', 'security', 'lesson-learned'],
    agent: 'developer',
    timestamp: '2026-06-13T18:00:00Z',
  },
  {
    id: 'mem-004',
    type: 'error',
    content: 'Race condition detected in concurrent payment processing. Fixed by implementing optimistic locking with version field in Payment entity.',
    tags: ['bug', 'race-condition', 'concurrency', 'payment'],
    agent: 'debugger',
    timestamp: '2026-06-13T22:30:00Z',
  },
  {
    id: 'mem-005',
    type: 'preference',
    content: 'Team prefers using Jest for unit tests and Cypress for E2E tests. All tests must maintain >90% code coverage. Mock external API calls in integration tests.',
    tags: ['testing', 'jest', 'cypress', 'coverage'],
    agent: 'qa',
    timestamp: '2026-06-12T10:00:00Z',
  },
  {
    id: 'mem-006',
    type: 'decision',
    content: 'Deployed using blue-green strategy to minimize downtime. Canary releases for high-risk changes. All deployments require security scan approval.',
    tags: ['deployment', 'blue-green', 'canary', 'security'],
    agent: 'devops',
    timestamp: '2026-06-13T14:00:00Z',
  },
  {
    id: 'mem-007',
    type: 'context',
    content: 'Payment module must integrate with existing user service and order service. Shared database for user data, separate schema for payment transactions.',
    tags: ['integration', 'database', 'payment', 'user-service'],
    agent: 'integrator',
    timestamp: '2026-06-13T16:00:00Z',
  },
  {
    id: 'mem-008',
    type: 'learning',
    content: 'Performance bottleneck identified in transaction history query. Added composite index on (user_id, created_at) reduced query time from 2.3s to 45ms.',
    tags: ['performance', 'database', 'optimization', 'index'],
    agent: 'optimizer',
    timestamp: '2026-06-13T20:00:00Z',
  },
  {
    id: 'mem-009',
    type: 'decision',
    content: 'API versioning strategy: URL-based (/api/v1/, /api/v2/). Deprecation policy: 6 months support for old versions. Breaking changes require major version bump.',
    tags: ['api', 'versioning', 'deprecation', 'policy'],
    agent: 'architect',
    timestamp: '2026-06-12T09:00:00Z',
  },
  {
    id: 'mem-010',
    type: 'context',
    content: 'Target performance metrics: API response time <200ms (p95), 99.9% uptime, support 10,000 concurrent users. Current baseline: 180ms avg, 99.95% uptime.',
    tags: ['performance', 'sla', 'baseline', 'targets'],
    agent: 'optimizer',
    timestamp: '2026-06-12T11:00:00Z',
  },
];

const BAND_MESSAGES: BandMessage[] = [
  {
    id: 'msg-001',
    agent: 'planner',
    content: 'Just finished analyzing the Q4 roadmap. We have 24 user stories prioritized for the payment module. @architect please review the architecture requirements.',
    mentions: ['architect'],
    timestamp: '2026-06-14T00:00:00Z',
    type: 'message',
  },
  {
    id: 'msg-002',
    agent: 'architect',
    content: 'Received the requirements. I recommend an event-driven microservices pattern. @developer will implement the core payment service while I define the API contracts.',
    mentions: ['developer'],
    timestamp: '2026-06-14T00:05:00Z',
    type: 'message',
  },
  {
    id: 'msg-003',
    agent: 'developer',
    content: 'Starting implementation. Using TypeScript with Express for the API gateway. @reviewer I\'ll tag you when the first PR is ready for review.',
    mentions: ['reviewer'],
    timestamp: '2026-06-14T00:15:00Z',
    type: 'message',
  },
  {
    id: 'msg-004',
    agent: 'redteamer',
    content: '@developer Quick heads up: ensure all payment endpoints have rate limiting and input validation. I\'ll run security scans once the PR is up.',
    mentions: ['developer'],
    timestamp: '2026-06-14T00:20:00Z',
    type: 'alert',
  },
  {
    id: 'msg-005',
    agent: 'qa',
    content: 'Test plan ready for the payment module. I\'ve identified 156 E2E scenarios covering happy paths and edge cases. @integrator are the API contracts finalized?',
    mentions: ['integrator'],
    timestamp: '2026-06-14T00:25:00Z',
    type: 'message',
  },
  {
    id: 'msg-006',
    agent: 'integrator',
    content: '@qa Yes, API contracts are v2.4.0 finalized. Shared the OpenAPI spec in the docs channel. Stripe sandbox credentials are ready for testing.',
    mentions: ['qa'],
    timestamp: '2026-06-14T00:28:00Z',
    type: 'message',
  },
  {
    id: 'msg-007',
    agent: 'optimizer',
    content: '@developer Consider adding database connection pooling early. Based on historical data, payment queries will need optimized indexing. I\'ll review after initial implementation.',
    mentions: ['developer'],
    timestamp: '2026-06-14T00:30:00Z',
    type: 'message',
  },
  {
    id: 'msg-008',
    agent: 'debugger',
    content: 'Monitoring shows potential memory spike in staging. @devops can you check the container metrics? Might need to adjust resource limits.',
    mentions: ['devops'],
    timestamp: '2026-06-14T00:35:00Z',
    type: 'alert',
  },
  {
    id: 'msg-009',
    agent: 'devops',
    content: '@debugger Checked. Container memory at 78% with current load. Increasing limits to 2GB and scaling replicas to 3. Deploying fix now.',
    mentions: ['debugger'],
    timestamp: '2026-06-14T00:38:00Z',
    type: 'message',
  },
  {
    id: 'msg-010',
    agent: 'scribe',
    content: 'Documentation for the payment module is 60% complete. @developer please provide inline comments for the complex transaction handling logic.',
    mentions: ['developer'],
    timestamp: '2026-06-14T00:40:00Z',
    type: 'message',
  },
  {
    id: 'msg-011',
    agent: 'reviewer',
    content: 'Code review for PR #482 complete. 3 minor suggestions, no blocking issues. @redteamer ready for your security scan.',
    mentions: ['redteamer'],
    timestamp: '2026-06-14T00:45:00Z',
    type: 'message',
  },
  {
    id: 'msg-012',
    agent: 'planner',
    content: 'Great progress team! We\'re on track for the June 20th release. @scribe please ensure all deliverables are documented by EOD Friday.',
    mentions: ['scribe'],
    timestamp: '2026-06-14T00:50:00Z',
    type: 'system',
  },
];

const METRICS: MetricsData = {
  totalTasks: 15427,
  completedTasks: 14891,
  activeWorkflows: 12,
  avgResponseTime: 3.2,
  successRate: 99.1,
  tokensUsed: 48950000,
  costEstimate: 245.75,
  uptime: 99.95,
};

const SYSTEM_STATUS: SystemStatus = {
  overall: 'healthy',
  components: [
    { name: 'API Gateway', status: 'operational', latency: 12 },
    { name: 'Agent Orchestrator', status: 'operational', latency: 8 },
    { name: 'Message Queue', status: 'operational', latency: 3 },
    { name: 'Database', status: 'operational', latency: 5 },
    { name: 'Cache Layer', status: 'operational', latency: 1 },
    { name: 'Monitoring', status: 'operational', latency: 15 },
    { name: 'Log Aggregator', status: 'degraded', latency: 45 },
    { name: 'Backup Service', status: 'operational', latency: 20 },
  ],
};

export async function fetchAgents(): Promise<Agent[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return AGENTS;
}

export async function fetchAgent(id: string): Promise<Agent | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return AGENTS.find((a) => a.id === id);
}

export async function fetchWorkflow(): Promise<Workflow> {
  await new Promise((resolve) => setTimeout(resolve, 400));
  const completedSteps = WORKFLOW_STEPS.filter((s) => s.status === 'completed').length;
  const totalSteps = WORKFLOW_STEPS.length;
  return {
    id: 'wf-001',
    name: 'Payment Module Development',
    steps: WORKFLOW_STEPS,
    status: 'running',
    progress: Math.round((completedSteps / totalSteps) * 100),
    createdAt: '2026-06-14T00:00:00Z',
    updatedAt: '2026-06-14T01:00:00Z',
  };
}

export async function fetchAuditLog(): Promise<AuditEntry[]> {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return AUDIT_ENTRIES;
}

export async function fetchMemoryEntries(query?: string): Promise<MemoryEntry[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  if (!query) return MEMORY_ENTRIES;
  const lower = query.toLowerCase();
  return MEMORY_ENTRIES.filter(
    (m) =>
      m.content.toLowerCase().includes(lower) ||
      m.tags.some((t) => t.toLowerCase().includes(lower))
  ).map((m) => ({
    ...m,
    relevance: m.content.toLowerCase().includes(lower) ? 0.95 : 0.7,
  }));
}

export async function fetchBandMessages(): Promise<BandMessage[]> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return BAND_MESSAGES;
}

export async function fetchMetrics(): Promise<MetricsData> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return METRICS;
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return SYSTEM_STATUS;
}
