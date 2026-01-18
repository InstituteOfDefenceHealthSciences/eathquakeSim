'use client';

import { useState } from 'react';
import { SimulationConfig } from '../types/simulation';

interface ControlsProps {
  config: SimulationConfig;
  onConfigChange: (config: SimulationConfig) => void;
  onRunVisual: () => void;
  onRunMonteCarlo: () => void;
  onExportExcel: () => void;
  onReset: () => void;
  isRunning: boolean;
  progress: number;
}

export default function Controls({
  config,
  onConfigChange,
  onRunVisual,
  onRunMonteCarlo,
  onExportExcel,
  onReset,
  isRunning,
  progress,
}: ControlsProps) {
  const updateConfig = (updates: Partial<SimulationConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Scenario</label>
        <select
          value={config.scenario}
          onChange={(e) => updateConfig({ scenario: e.target.value as 'daytime' | 'nighttime' })}
          className="w-full p-2 border rounded"
          disabled={isRunning}
        >
          <option value="daytime">Daytime Earthquake</option>
          <option value="nighttime">Nighttime Earthquake</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Baseline ED Daily</label>
        <input
          type="number"
          value={config.baselineEDDaily}
          onChange={(e) => updateConfig({ baselineEDDaily: Number(e.target.value) })}
          className="w-full p-2 border rounded"
          disabled={isRunning}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-sm font-medium">K1</label>
          <input
            type="number"
            step="0.1"
            value={config.k1}
            onChange={(e) => updateConfig({ k1: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            disabled={isRunning}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">K2</label>
          <input
            type="number"
            step="0.1"
            value={config.k2}
            onChange={(e) => updateConfig({ k2: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            disabled={isRunning}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">K3</label>
          <input
            type="number"
            step="0.1"
            value={config.k3}
            onChange={(e) => updateConfig({ k3: Number(e.target.value) })}
            className="w-full p-2 border rounded"
            disabled={isRunning}
          />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium">Policies</h3>
        {Object.entries(config.policies).map(([key, policy]) => (
          <div key={key} className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={policy.active}
              onChange={(e) => updateConfig({
                policies: { ...config.policies, [key]: { ...policy, active: e.target.checked } }
              })}
              disabled={isRunning}
            />
            <span className="text-sm">{key.toUpperCase()}</span>
            <select
              value={policy.time}
              onChange={(e) => updateConfig({
                policies: { ...config.policies, [key]: { ...policy, time: Number(e.target.value) } }
              })}
              className="p-1 border rounded text-sm"
              disabled={isRunning}
            >
              <option value={12}>12h</option>
              <option value={24}>24h</option>
              <option value={36}>36h</option>
              <option value={48}>48h</option>
            </select>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium">Snapshot Interval (min)</label>
        <input
          type="number"
          min="1"
          max="10"
          value={config.snapshotInterval}
          onChange={(e) => updateConfig({ snapshotInterval: Number(e.target.value) })}
          className="w-full p-2 border rounded"
          disabled={isRunning}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Monte Carlo Runs</label>
        <select
          value={config.monteCarloRuns}
          onChange={(e) => updateConfig({ monteCarloRuns: Number(e.target.value) })}
          className="w-full p-2 border rounded"
          disabled={isRunning}
        >
          <option value={100}>100</option>
          <option value={500}>500</option>
          <option value={1000}>1000</option>
        </select>
      </div>

      <div className="space-y-2">
        <button
          onClick={onRunVisual}
          disabled={isRunning}
          className="w-full bg-blue-500 text-white p-2 rounded disabled:opacity-50"
        >
          Run Visual Simulation
        </button>
        <button
          onClick={onRunMonteCarlo}
          disabled={isRunning}
          className="w-full bg-green-500 text-white p-2 rounded disabled:opacity-50"
        >
          Run Monte Carlo
        </button>
        <button
          onClick={onExportExcel}
          className="w-full bg-purple-500 text-white p-2 rounded"
        >
          Export Excel
        </button>
        <button
          onClick={onReset}
          className="w-full bg-gray-500 text-white p-2 rounded"
        >
          Reset
        </button>
      </div>

      {isRunning && (
        <div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-sm text-center mt-1">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}