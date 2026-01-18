'use client';

import { useState, useEffect } from 'react';
import Controls from '../components/Controls';
import FlowMap from '../components/FlowMap';
import KPIs from '../components/KPIs';
import { SimulationConfig, SimulationSnapshot, NodeMetrics, Patient } from '../types/simulation';
// import { SimulationEngine } from '../lib/simulationEngine'; // Will use later

export default function Home() {
  const [config, setConfig] = useState<SimulationConfig>({
    scenario: 'daytime',
    baselineEDDaily: 100,
    k1: 10,
    k2: 4,
    k3: 1.5,
    policies: {
      p1: { active: false, time: 12 },
      p2: { active: false, time: 12 },
      p3: { active: false, time: 12 },
      p4: { active: false, time: 12 },
    },
    snapshotInterval: 5,
    monteCarloRuns: 500,
  });

  const [snapshots, setSnapshots] = useState<SimulationSnapshot[]>([]);
  const [currentSnapshotIndex, setCurrentSnapshotIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalDeaths, setTotalDeaths] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);

  // Dummy data for now
  const dummyNodes: NodeMetrics[] = [
    { node: 'arrival', queueLength: 0, utilization: 0, p95Wait: 0, deaths: 0, color: 'green' },
    { node: 'triage_queue', queueLength: 5, utilization: 0.8, p95Wait: 15, deaths: 0, color: 'orange' },
    { node: 'triage_service', queueLength: 0, utilization: 0.6, p95Wait: 10, deaths: 0, color: 'green' },
    { node: 'ed_queue', queueLength: 20, utilization: 0.95, p95Wait: 45, deaths: 2, color: 'red' },
    { node: 'ed_service', queueLength: 0, utilization: 0.9, p95Wait: 30, deaths: 0, color: 'orange' },
    { node: 'imaging_queue', queueLength: 15, utilization: 1.0, p95Wait: 60, deaths: 1, color: 'red' },
    { node: 'imaging_service', queueLength: 0, utilization: 0.8, p95Wait: 20, deaths: 0, color: 'orange' },
    { node: 'result_review_queue', queueLength: 8, utilization: 0.7, p95Wait: 25, deaths: 0, color: 'green' },
    { node: 'result_review_service', queueLength: 0, utilization: 0.5, p95Wait: 15, deaths: 0, color: 'green' },
    { node: 'obs', queueLength: 3, utilization: 0.3, p95Wait: 5, deaths: 0, color: 'green' },
    { node: 'or_queue', queueLength: 12, utilization: 0.9, p95Wait: 50, deaths: 3, color: 'red' },
    { node: 'in_or', queueLength: 0, utilization: 0.85, p95Wait: 40, deaths: 1, color: 'orange' },
    { node: 'icu_wait', queueLength: 10, utilization: 0.95, p95Wait: 55, deaths: 2, color: 'red' },
    { node: 'icu', queueLength: 0, utilization: 0.92, p95Wait: 35, deaths: 5, color: 'red' },
    { node: 'ward', queueLength: 25, utilization: 0.8, p95Wait: 20, deaths: 4, color: 'orange' },
    { node: 'discharge', queueLength: 0, utilization: 0, p95Wait: 0, deaths: 0, color: 'green' },
    { node: 'transfer_out', queueLength: 0, utilization: 0, p95Wait: 0, deaths: 0, color: 'green' },
    { node: 'elevator_queue', queueLength: 6, utilization: 0.9, p95Wait: 30, deaths: 1, color: 'orange' },
  ];

  const dummySnapshots: SimulationSnapshot[] = [
    {
      time: 0,
      nodes: dummyNodes.map(n => ({ ...n, queueLength: 0, utilization: 0 })),
      totalPatients: 0,
      totalDeaths: 0,
      activeStaff: {},
    },
    {
      time: 60,
      nodes: dummyNodes,
      totalPatients: 50,
      totalDeaths: 5,
      activeStaff: { 'ED doctor': 5, 'ED nurse': 8 },
    },
  ];

  useEffect(() => {
    setSnapshots(dummySnapshots);
    setTotalDeaths(5);
    setTotalPatients(50);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRunVisual = () => {
    setIsRunning(true);
    setProgress(0);
    // Simulate running
    let i = 0;
    const interval = setInterval(() => {
      setProgress((i / 10) * 100);
      setCurrentSnapshotIndex(i % dummySnapshots.length);
      i++;
      if (i > 10) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 500);
  };

  const handleRunMonteCarlo = () => {
    setIsRunning(true);
    setProgress(0);
    const worker = new Worker('/simulationWorker.js');
    worker.postMessage({ type: 'runMonteCarlo', config, runs: config.monteCarloRuns });
    worker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        setProgress(e.data.progress);
      } else if (e.data.type === 'complete') {
        console.log('Monte Carlo results:', e.data.results);
        setIsRunning(false);
        worker.terminate();
      }
    };
  };

  const handleExportExcel = () => {
    import('../lib/excelExport').then(({ exportToExcel }) => {
      const runSummary = [{ scenario: config.scenario, totalPatients, totalDeaths }];
      const deathLog = [{ patientId: 'p1', time: 100, location: 'icu', reason: 'Overload' }];
      const patientPathSummary: Patient[] = [];
      const bottleneckEpisodes = [{ node: 'icu', start: 50, end: 100, duration: 50 }];
      exportToExcel(runSummary, snapshots, deathLog, patientPathSummary, bottleneckEpisodes);
    });
  };

  const handleReset = () => {
    setSnapshots([]);
    setCurrentSnapshotIndex(0);
    setProgress(0);
    setTotalDeaths(0);
    setTotalPatients(0);
  };

  const currentSnapshot = snapshots[currentSnapshotIndex] || { nodes: [], totalPatients: 0, totalDeaths: 0 };

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Earthquake Hospital Simulator</h1>
        <div className="grid grid-cols-12 gap-4 min-h-[80vh]">
          {/* Left Controls */}
          <div className="col-span-3 bg-white p-4 rounded shadow overflow-y-auto max-h-[80vh]">
            <Controls
              config={config}
              onConfigChange={setConfig}
              onRunVisual={handleRunVisual}
              onRunMonteCarlo={handleRunMonteCarlo}
              onExportExcel={handleExportExcel}
              onReset={handleReset}
              isRunning={isRunning}
              progress={progress}
            />
          </div>
          {/* Center Flow Map */}
          <div className="col-span-6 bg-white p-4 rounded shadow">
            <FlowMap nodes={currentSnapshot.nodes} />
          </div>
          {/* Right KPIs & Charts */}
          <div className="col-span-3 bg-white p-4 rounded shadow overflow-y-auto max-h-[80vh]">
            <KPIs
              snapshots={snapshots}
              totalDeaths={totalDeaths}
              totalPatients={totalPatients}
            />
          </div>
        </div>
      </div>
    </main>
  );
}