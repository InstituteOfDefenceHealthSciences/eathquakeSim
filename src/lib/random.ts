// Simple seeded random number generator
class SeededRandom {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  random(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  poisson(lambda: number): number {
    if (lambda < 30) {
      let L = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k++;
        p *= this.random();
      } while (p > L);
      return k - 1;
    } else {
      const c = 0.767 - 3.36 / lambda;
      const beta = Math.PI / Math.sqrt(3.0 * lambda);
      const alpha = beta * lambda;
      const k = Math.log(c) - lambda - Math.log(beta);
      let u, x, n;
      do {
        do {
          u = this.random();
          x = (alpha - Math.log((1.0 - u) / u)) / beta;
        } while (x <= -0.5);
        n = Math.floor(x + 0.5);
        u = this.random();
      } while (u >= 1.0 - Math.exp(-Math.exp(k + beta * x)));
      return n;
    }
  }

  triangular(min: number, mode: number, max: number): number {
    const u = this.random();
    if (u < (mode - min) / (max - min)) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }

  lognormal(mu: number, sigma: number): number {
    const z = Math.sqrt(-2 * Math.log(this.random())) * Math.cos(2 * Math.PI * this.random());
    return Math.exp(mu + sigma * z);
  }

  uniform(min: number, max: number): number {
    return min + (max - min) * this.random();
  }
}

export { SeededRandom };