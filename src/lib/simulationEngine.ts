import { SeededRandom } from './random';
import { Patient, StaffAgent, NodeMetrics, SimulationSnapshot, RunSummary, SimulationConfig, InjuryType, SeverityClass } from '../types/simulation';

const HORIZON_HOURS = 72;
const HORIZON_MINUTES = HORIZON_HOURS * 60;

const BASE_CAPACITIES = {
  triage: 4,
  ed: 20,
  imaging: { ct: 1, ultrasound: 4, xray: 2 },
  resultReview: 4,
  or: 8,
  icu: 44,
  ward: 256,
  obs: 20,
  elevator: 2, // limited resource
};

const STAFF_ROLES = ['ED doctor', 'ED nurse', 'Surgeon', 'Anesthetist', 'ICU nurse', 'Ward nurse', 'Radiology tech', 'Porter'];

const TRIANGULAR_PARAMS = {
  'ED doctor': { min: 20, mode: 45, max: 120 },
  'ED nurse': { min: 15, mode: 40, max: 100 },
  'Surgeon': { min: 30, mode: 60, max: 180 },
  'Anesthetist': { min: 30, mode: 60, max: 180 },
  'Radiology tech': { min: 30, mode: 75, max: 180 },
  'Porter': { min: 20, mode: 50, max: 150 },
  'ICU nurse': { min: 20, mode: 50, max: 150 },
  'Ward nurse': { min: 20, mode: 50, max: 150 },
};

class SimulationEngine {
  private rng: SeededRandom;
  private config: SimulationConfig;
  private time: number = 0;
  private patients: Patient[] = [];
  private staff: StaffAgent[] = [];
  private eventQueue: Array<{ time: number; event: () => void }> = [];
  private resources: { [key: string]: number } = {};
  private queues: { [key: string]: Patient[] } = {};
  private nodeWaitTimes: { [key: string]: number[] } = {};
  private deaths: Array<{ patientId: string; time: number; location: string; reason: string }> = [];
  private snapshots: SimulationSnapshot[] = [];
  private patientIdCounter = 0;

  constructor(seed: number, config: SimulationConfig) {
    this.rng = new SeededRandom(seed);
    this.config = config;
    this.initializeResources();
    this.initializeStaff();
    this.initializeQueues();
  }

  private initializeResources() {
    this.resources = {
      triage: this.config.scenario === 'daytime' ? BASE_CAPACITIES.triage : 1,
      ed: this.config.scenario === 'daytime' ? BASE_CAPACITIES.ed : 2,
      ct: BASE_CAPACITIES.imaging.ct,
      ultrasound: BASE_CAPACITIES.imaging.ultrasound,
      xray: BASE_CAPACITIES.imaging.xray,
      resultReview: BASE_CAPACITIES.resultReview,
      or: BASE_CAPACITIES.or,
      icu: BASE_CAPACITIES.icu,
      ward: BASE_CAPACITIES.ward,
      obs: BASE_CAPACITIES.obs,
      elevator: BASE_CAPACITIES.elevator,
    };
  }

  private initializeStaff() {
    for (const role of STAFF_ROLES) {
      const count = this.config.scenario === 'daytime' ? 10 : 2; // rough estimate
      for (let i = 0; i < count; i++) {
        const agent: StaffAgent = {
          id: `${role}_${i}`,
          role,
          state: this.config.scenario === 'daytime' ? 'on_duty' : 'home',
          showProbability: this.rng.uniform(0.85, 0.95),
        };
        if (agent.state === 'home' && this.rng.random() < agent.showProbability) {
          const params = TRIANGULAR_PARAMS[role as keyof typeof TRIANGULAR_PARAMS];
          agent.arrivalTime = this.rng.triangular(params.min, params.mode, params.max);
          this.scheduleEvent(agent.arrivalTime, () => this.staffArrives(agent));
        }
        this.staff.push(agent);
      }
    }
  }

  private initializeQueues() {
    const nodes = ['arrival', 'triage_queue', 'triage_service', 'ed_queue', 'ed_service', 'imaging_queue', 'imaging_service', 'result_review_queue', 'result_review_service', 'obs', 'or_queue', 'in_or', 'icu_wait', 'icu', 'ward', 'discharge', 'transfer_out', 'elevator_queue'];
    for (const node of nodes) {
      this.queues[node] = [];
      this.nodeWaitTimes[node] = [];
    }
  }

  private scheduleEvent(time: number, event: () => void) {
    this.eventQueue.push({ time, event });
    this.eventQueue.sort((a, b) => a.time - b.time);
  }

  private staffArrives(agent: StaffAgent) {
    agent.state = 'on_duty';
    // Increase capacity based on role
    if (agent.role === 'ED doctor') this.resources.ed += 1;
    else if (agent.role === 'ED nurse') this.resources.triage += 1;
    // Add more as needed
  }

  private generatePatient(): Patient {
    const injuryTypes: InjuryType[] = ['multitrauma', 'head', 'thorax', 'abdomen', 'extremity', 'crush', 'minor'];
    const injuryType = injuryTypes[Math.floor(this.rng.random() * injuryTypes.length)];
    const severityScore = this.rng.uniform(0, 1);
    let severityClass: SeverityClass;
    if (severityScore < 0.25) severityClass = 'Minor';
    else if (severityScore < 0.5) severityClass = 'Moderate';
    else if (severityScore < 0.75) severityClass = 'Severe';
    else severityClass = 'Critical';

    return {
      id: `patient_${this.patientIdCounter++}`,
      arrivalTime: this.time,
      injuryType,
      severityScore,
      severityClass,
      currentNode: 'arrival',
      queueEntryTime: this.time,
      totalWaitTime: 0,
      path: ['arrival'],
      discharged: false,
    };
  }

  private processPatientFlow(patient: Patient) {
    // Implement the DES flow logic here
    // This is simplified; full implementation would be much longer
    // For now, just move through nodes with random times

    const nextNode = this.getNextNode(patient);
    if (nextNode) {
      patient.currentNode = nextNode;
      patient.path.push(nextNode);
      this.scheduleEvent(this.time + this.rng.uniform(10, 60), () => this.processPatientFlow(patient));
    } else {
      patient.discharged = true;
    }
  }

  private getNextNode(patient: Patient): string | null {
    // Simplified routing logic
    const current = patient.currentNode;
    if (current === 'arrival') return 'triage_queue';
    if (current === 'triage_queue') return 'triage_service';
    if (current === 'triage_service') return 'ed_queue';
    if (current === 'ed_queue') return 'ed_service';
    if (current === 'ed_service') {
      if (this.rng.random() < 0.5) return 'imaging_queue';
      return 'ward';
    }
    if (current === 'imaging_queue') return 'imaging_service';
    if (current === 'imaging_service') return 'result_review_queue';
    if (current === 'result_review_queue') return 'result_review_service';
    if (current === 'result_review_service') return 'ward';
    if (current === 'ward') return 'discharge';
    return null;
  }

  private checkMortality(patient: Patient) {
    // Simplified mortality check
    if (this.rng.random() < 0.01) { // 1% chance per check
      patient.deathTime = this.time;
      patient.deathLocation = patient.currentNode;
      patient.deathReason = 'Overload';
      this.deaths.push({
        patientId: patient.id,
        time: this.time,
        location: patient.currentNode,
        reason: 'Overload',
      });
    }
  }

  private takeSnapshot() {
    const nodes: NodeMetrics[] = [];
    for (const node in this.queues) {
      const queue = this.queues[node];
      const utilization = queue.length / (this.resources[node] || 1);
      const waits = this.nodeWaitTimes[node];
      const p95Wait = waits.length > 0 ? waits.sort((a, b) => a - b)[Math.floor(waits.length * 0.95)] : 0;
      const deaths = this.deaths.filter(d => d.location === node).length;
      let color: 'green' | 'orange' | 'red' = 'green';
      if (utilization > 0.95 && p95Wait > 10) color = 'red';
      else if (utilization > 0.85) color = 'orange';
      nodes.push({ node, queueLength: queue.length, utilization, p95Wait, deaths, color });
    }
    this.snapshots.push({
      time: this.time,
      nodes,
      totalPatients: this.patients.length,
      totalDeaths: this.deaths.length,
      activeStaff: this.getActiveStaffCount(),
    });
  }

  private getActiveStaffCount(): { [role: string]: number } {
    const counts: { [role: string]: number } = {};
    for (const agent of this.staff) {
      if (agent.state === 'on_duty') {
        counts[agent.role] = (counts[agent.role] || 0) + 1;
      }
    }
    return counts;
  }

  run(): { snapshots: SimulationSnapshot[]; deaths: any[]; patients: Patient[] } {
    // Schedule patient arrivals
    let nextArrival = 0;
    while (nextArrival < HORIZON_MINUTES) {
      const arrivals = this.getArrivalsAtTime(nextArrival);
      for (let i = 0; i < arrivals; i++) {
        this.scheduleEvent(nextArrival, () => {
          const patient = this.generatePatient();
          this.patients.push(patient);
          this.processPatientFlow(patient);
        });
      }
      nextArrival += 1; // per minute
    }

    // Schedule snapshots
    for (let t = 0; t <= HORIZON_MINUTES; t += this.config.snapshotInterval) {
      this.scheduleEvent(t, () => {
        this.time = t;
        this.takeSnapshot();
      });
    }

    // Process events
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!;
      this.time = event.time;
      event.event();
    }

    return { snapshots: this.snapshots, deaths: this.deaths, patients: this.patients };
  }

  private getArrivalsAtTime(time: number): number {
    const hour = time / 60;
    let multiplier = 1;
    if (hour < 6) multiplier = this.config.k1;
    else if (hour < 24) multiplier = this.config.k2;
    else multiplier = this.config.k3;
    const lambda = (this.config.baselineEDDaily / 24) * multiplier;
    return this.rng.poisson(lambda);
  }
}

export { SimulationEngine };