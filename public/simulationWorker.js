// public/simulationWorker.js
self.onmessage = function(e) {
  const { type, config, runs } = e.data;

  if (type === 'runMonteCarlo') {
    const results = [];
    for (let i = 0; i < runs; i++) {
      // Dummy simulation result
      results.push({
        totalPatients: Math.floor(Math.random() * 1000) + 500,
        totalDeaths: Math.floor(Math.random() * 50) + 10,
        avgWaitTime: Math.random() * 60 + 30,
        bottleneckEpisodes: Math.floor(Math.random() * 20) + 5,
      });
      // Progress
      self.postMessage({ type: 'progress', progress: (i + 1) / runs * 100 });
    }
    self.postMessage({ type: 'complete', results });
  }
};