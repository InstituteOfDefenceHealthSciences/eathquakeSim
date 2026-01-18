export type InjuryType = 'multitrauma' | 'head' | 'thorax' | 'abdomen' | 'extremity' | 'crush' | 'minor';

export type SeverityClass = 'Minor' | 'Moderate' | 'Severe' | 'Critical';

export interface Patient {
  id: string;
  arrivalTime: number;
  injuryType: InjuryType;
  severityScore: number;
  severityClass: SeverityClass;
  currentNode: string;
  queueEntryTime: number;
  totalWaitTime: number;
  path: string[];
  discharged: boolean;
  deathTime?: number;
  deathLocation?: string;
  deathReason?: string;
  losWard?: number;
  losIcu?: number;
}

export interface StaffAgent {
  id: string;
  role: string;
  state: 'home' | 'traveling' | 'on_duty' | 'unavailable';
  arrivalTime?: number;
  showProbability: number;
}

export interface NodeMetrics {
  node: string;
  queueLength: number;
  utilization: number;
  p95Wait: number;
  deaths: number;
  color: 'green' | 'orange' | 'red';
}

export interface SimulationSnapshot {
  time: number;
  nodes: NodeMetrics[];
  totalPatients: number;
  totalDeaths: number;
  activeStaff: { [role: string]: number };
}

export interface RunSummary {
  scenario: string;
  policies: string[];
  totalPatients: number;
  totalDeaths: number;
  avgWaitTime: number;
  bottleneckEpisodes: number;
  duration: number;
}

export interface MonteCarloResult {
  summaries: RunSummary[];
  aggregatedMetrics: {
    meanTotalPatients: number;
    meanTotalDeaths: number;
    meanAvgWaitTime: number;
    meanBottleneckEpisodes: number;
  };
}

export interface SimulationConfig {
  scenario: 'daytime' | 'nighttime';
  baselineEDDaily: number;
  k1: number;
  k2: number;
  k3: number;
  policies: {
    p1: { active: boolean; time: number };
    p2: { active: boolean; time: number };
    p3: { active: boolean; time: number };
    p4: { active: boolean; time: number };
  };
  snapshotInterval: number;
  monteCarloRuns: number;
}