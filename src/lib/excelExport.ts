import * as XLSX from 'xlsx';
import { SimulationSnapshot, Patient } from '../types/simulation';

export function exportToExcel(
  runSummary: any[],
  nodeTimeseries: SimulationSnapshot[],
  deathLog: any[],
  patientPathSummary: Patient[],
  bottleneckEpisodes: any[]
) {
  const workbook = XLSX.utils.book_new();

  // RUN_SUMMARY
  const runSummarySheet = XLSX.utils.json_to_sheet(runSummary);
  XLSX.utils.book_append_sheet(workbook, runSummarySheet, 'RUN_SUMMARY');

  // NODE_TIMESERIES
  const nodeTimeseriesData = nodeTimeseries.flatMap(snapshot =>
    snapshot.nodes.map(node => ({
      time: snapshot.time,
      node: node.node,
      queueLength: node.queueLength,
      utilization: node.utilization,
      p95Wait: node.p95Wait,
      deaths: node.deaths,
      color: node.color,
    }))
  );
  const nodeTimeseriesSheet = XLSX.utils.json_to_sheet(nodeTimeseriesData);
  XLSX.utils.book_append_sheet(workbook, nodeTimeseriesSheet, 'NODE_TIMESERIES');

  // DEATH_LOG
  const deathLogSheet = XLSX.utils.json_to_sheet(deathLog);
  XLSX.utils.book_append_sheet(workbook, deathLogSheet, 'DEATH_LOG');

  // PATIENT_PATH_SUMMARY
  const patientPathData = patientPathSummary.map(patient => ({
    id: patient.id,
    arrivalTime: patient.arrivalTime,
    injuryType: patient.injuryType,
    severityClass: patient.severityClass,
    path: patient.path.join(' -> '),
    discharged: patient.discharged,
    deathTime: patient.deathTime,
    deathLocation: patient.deathLocation,
    losWard: patient.losWard,
    losIcu: patient.losIcu,
  }));
  const patientPathSheet = XLSX.utils.json_to_sheet(patientPathData);
  XLSX.utils.book_append_sheet(workbook, patientPathSheet, 'PATIENT_PATH_SUMMARY');

  // BOTTLENECK_EPISODES
  const bottleneckSheet = XLSX.utils.json_to_sheet(bottleneckEpisodes);
  XLSX.utils.book_append_sheet(workbook, bottleneckSheet, 'BOTTLENECK_EPISODES');

  // Download
  XLSX.writeFile(workbook, 'earthquake_simulation_results.xlsx');
}