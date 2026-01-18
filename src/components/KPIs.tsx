'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { SimulationSnapshot } from '../types/simulation';

interface KPIsProps {
  snapshots: SimulationSnapshot[];
  totalDeaths: number;
  totalPatients: number;
}

export default function KPIs({ snapshots, totalDeaths, totalPatients }: KPIsProps) {
  // Prepare data for charts
  const timeSeriesData = snapshots.map(snapshot => ({
    time: (snapshot.time / 60).toFixed(1), // hours
    icuUtilization: snapshot.nodes.find(n => n.node === 'icu')?.utilization || 0,
    orUtilization: snapshot.nodes.find(n => n.node === 'or')?.utilization || 0,
    ctQueue: snapshot.nodes.find(n => n.node === 'imaging_queue')?.queueLength || 0,
  }));

  const mortalityData = [
    { location: 'Triage', deaths: 10 }, // dummy data
    { location: 'ED', deaths: 20 },
    { location: 'Imaging', deaths: 5 },
    { location: 'OR', deaths: 15 },
    { location: 'ICU', deaths: 25 },
    { location: 'Ward', deaths: 30 },
  ];

  const topBottlenecks = [
    { node: 'ICU', duration: 120 },
    { node: 'OR', duration: 100 },
    { node: 'ED', duration: 80 },
    { node: 'Imaging', duration: 60 },
    { node: 'Triage', duration: 40 },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Patients</h3>
          <p className="text-2xl font-bold">{totalPatients}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Deaths</h3>
          <p className="text-2xl font-bold text-red-600">{totalDeaths}</p>
        </div>
      </div>

      {/* Mortality by Location */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Mortality by Location</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mortalityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="location" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="deaths" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 Bottlenecks */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Top 5 Bottlenecks (RED Duration)</h3>
        <ul className="space-y-2">
          {topBottlenecks.map((bottleneck, index) => (
            <li key={bottleneck.node} className="flex justify-between">
              <span>{index + 1}. {bottleneck.node}</span>
              <span>{bottleneck.duration}h</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ICU Utilization Time Series */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">Utilization Time Series</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="icuUtilization" stroke="#8884d8" name="ICU" />
            <Line type="monotone" dataKey="orUtilization" stroke="#82ca9d" name="OR" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* CT Queue Time Series */}
      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">CT Queue Length</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="ctQueue" stroke="#ff7300" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}