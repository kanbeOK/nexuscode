'use client';

import { useEffect, useState, useRef } from 'react';
import { MetricsData } from '@/lib/types';

interface MetricsDashboardProps {
  metrics: MetricsData;
}

function AnimatedCounter({ value, duration = 1500, prefix = '', suffix = '' }: {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTimeRef = useRef<number>(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.round(eased * value));
      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      }
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [value, duration]);

  return <span className="font-mono tabular-nums">{prefix}{displayValue.toLocaleString()}{suffix}</span>;
}

function ProgressRing({ value, size = 56, strokeWidth = 4, color = '#00e5ff', label }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              filter: `drop-shadow(0 0 6px ${color}60)`,
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-bold font-mono" style={{ color }}>{Math.round(value)}%</span>
        </div>
      </div>
      <span className="text-[10px] text-nexus-dim uppercase tracking-wider">{label}</span>
    </div>
  );
}

function Sparkline({ data, color = '#00e5ff', width = 80, height = 32 }: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(...data, 1);
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / max) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#spark-${color.replace('#', '')})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
      />
    </svg>
  );
}

export default function MetricsDashboard({ metrics }: MetricsDashboardProps) {
  const completionRate = ((metrics.completedTasks / metrics.totalTasks) * 100);

  const sparkData1 = [23, 45, 32, 56, 41, 67, 52, 78, 63, 89, 74, 95];
  const sparkData2 = [12, 19, 15, 22, 18, 25, 20, 28, 24, 31, 27, 34];
  const sparkData3 = [5, 8, 6, 11, 9, 14, 12, 16, 13, 18, 15, 20];

  const metricCards = [
    {
      label: 'Total Tasks',
      value: metrics.totalTasks,
      color: '#00e5ff',
      gradient: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(0, 229, 255, 0.02))',
      borderColor: 'rgba(0, 229, 255, 0.15)',
      sparkData: sparkData1,
      subtext: `${metrics.totalTasks - metrics.completedTasks} pending`,
    },
    {
      label: 'Completed',
      value: metrics.completedTasks,
      color: '#00ff88',
      gradient: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 255, 136, 0.02))',
      borderColor: 'rgba(0, 255, 136, 0.15)',
      sparkData: sparkData2,
      subtext: `${completionRate.toFixed(1)}% rate`,
    },
    {
      label: 'Active Workflows',
      value: metrics.activeWorkflows,
      color: '#a855f7',
      gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.08), rgba(168, 85, 247, 0.02))',
      borderColor: 'rgba(168, 85, 247, 0.15)',
      sparkData: sparkData3,
      subtext: 'running now',
    },
    {
      label: 'Avg Response',
      value: parseFloat(metrics.avgResponseTime.toString()),
      color: '#00e5ff',
      gradient: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(168, 85, 247, 0.02))',
      borderColor: 'rgba(0, 229, 255, 0.12)',
      sparkData: sparkData1,
      subtext: 'seconds',
      suffix: 's',
    },
    {
      label: 'Success Rate',
      value: metrics.successRate,
      color: '#00ff88',
      gradient: 'linear-gradient(135deg, rgba(0, 255, 136, 0.08), rgba(0, 229, 255, 0.02))',
      borderColor: 'rgba(0, 255, 136, 0.12)',
      sparkData: sparkData2,
      subtext: 'system reliability',
      suffix: '%',
    },
    {
      label: 'Tokens Used',
      value: Math.round(metrics.tokensUsed / 1000000),
      color: '#ff9100',
      gradient: 'linear-gradient(135deg, rgba(255, 145, 0, 0.08), rgba(255, 145, 0, 0.02))',
      borderColor: 'rgba(255, 145, 0, 0.12)',
      sparkData: sparkData3,
      subtext: `Est. $${metrics.costEstimate.toFixed(2)}`,
      suffix: 'M',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {metricCards.map((metric, index) => (
          <div
            key={metric.label}
            className="glass-card p-4 group relative"
            style={{
              animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${index * 80}ms both`,
            }}
          >
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
              background: `radial-gradient(circle at 50% 50%, ${metric.color}10, transparent 70%)`,
            }}></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] text-nexus-dim uppercase tracking-wider font-medium">{metric.label}</span>
                <Sparkline data={metric.sparkData} color={metric.color} width={60} height={24} />
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black" style={{ color: metric.color }}>
                  <AnimatedCounter
                    value={metric.value}
                    suffix={metric.suffix || ''}
                    duration={1800 + index * 200}
                  />
                </span>
              </div>

              <p className="text-[10px] text-nexus-dim mt-1.5 font-mono">{metric.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 flex items-center gap-5">
          <ProgressRing value={completionRate} size={64} strokeWidth={5} color="#00e5ff" label="Tasks" />
          <div>
            <p className="text-xs text-nexus-dim uppercase tracking-wider mb-1">Completion Rate</p>
            <p className="text-xl font-bold neon-text font-mono">{completionRate.toFixed(1)}%</p>
            <p className="text-[10px] text-nexus-dim mt-0.5">{metrics.completedTasks} of {metrics.totalTasks}</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-5">
          <ProgressRing value={metrics.successRate} size={64} strokeWidth={5} color="#00ff88" label="Rate" />
          <div>
            <p className="text-xs text-nexus-dim uppercase tracking-wider mb-1">System Reliability</p>
            <p className="text-xl font-bold font-mono" style={{ color: '#00ff88' }}>{metrics.successRate}%</p>
            <p className="text-[10px] text-nexus-dim mt-0.5">across all agents</p>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-5">
          <ProgressRing value={Math.min((metrics.activeWorkflows / 10) * 100, 100)} size={64} strokeWidth={5} color="#a855f7" label="Active" />
          <div>
            <p className="text-xs text-nexus-dim uppercase tracking-wider mb-1">Parallel Workflows</p>
            <p className="text-xl font-bold font-mono" style={{ color: '#a855f7' }}>{metrics.activeWorkflows}</p>
            <p className="text-[10px] text-nexus-dim mt-0.5">running in parallel</p>
          </div>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs text-nexus-dim uppercase tracking-wider mb-3">Cost Estimate</p>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-2xl font-black font-mono" style={{ color: '#ff9100' }}>
              <AnimatedCounter value={Math.round(metrics.costEstimate * 100)} duration={2000} prefix="$" suffix="" />
            </span>
          </div>
          <div className="h-1.5 bg-nexus-bg/80 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min((metrics.costEstimate / 100) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #ff9100, #ff3d71)',
                boxShadow: '0 0 10px rgba(255, 145, 0, 0.4)',
              }}
            ></div>
          </div>
          <p className="text-[10px] text-nexus-dim mt-1.5 font-mono">{(metrics.tokensUsed / 1000000).toFixed(1)}M tokens</p>
        </div>
      </div>
    </div>
  );
}
