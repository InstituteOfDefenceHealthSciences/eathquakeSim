# Earthquake Hospital Simulator

A fully working DES + ABM hybrid earthquake hospital simulator as a desktop-first web app.

## Features

- Discrete Event Simulation (DES) for patient flow, queues, and resource constraints
- Agent-Based Modeling (ABM) for staff arrival behavior and operational failures
- Real-time flow map with bottleneck detection and color coding
- Monte Carlo analysis with Web Workers for non-blocking UI
- Excel export of simulation results
- Responsive UI with min width 1280px

## Tech Stack

- Next.js 14 with TypeScript
- Tailwind CSS for styling
- Recharts for data visualization
- SheetJS for Excel export
- Web Workers for background simulation

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open http://localhost:3000

## Deployment

This app is deployed on Vercel. The production URL is: [Insert Vercel URL here]

To deploy your own instance:

1. Fork this repository
2. Connect to Vercel
3. Deploy automatically

## Usage

1. Select scenario (daytime/nighttime earthquake)
2. Configure baseline ED daily arrivals and wave multipliers (k1, k2, k3)
3. Enable/disable policies and set activation times
4. Set snapshot interval and Monte Carlo runs
5. Run visual simulation for real-time animation or Monte Carlo for aggregated results
6. Export results to Excel

## Simulation Details

- Horizon: 72 hours
- Patient arrivals follow Poisson distribution with wave surges
- Trauma severity affects triage, routing, and mortality
- LOS modeled with lognormal distributions and multipliers
- Bottlenecks detected based on utilization >95% and wait times
- No artificial caps; system overloads naturally

## Excel Export Sheets

- RUN_SUMMARY: Overall run statistics
- NODE_TIMESERIES: Time-series data for each node
- DEATH_LOG: Detailed death records
- PATIENT_PATH_SUMMARY: Patient journey summaries
- BOTTLENECK_EPISODES: Bottleneck event logs