// 사용: node bench/status_quality/cand/9_blue.mjs [점수=2500000] [shrink=0.9] — 후보 9(푸아송 원반 근사 솎기)를 잰다. 수준 배분은 기준(수준 비례).
import { evaluateThinner } from '../tune.mjs';
import { createBlueNoiseThinner } from '../../../server/scheduler/segment_budget/cand_9_blue.mjs';
const shrink = +process.argv[3] || 0.9;
const t0 = Date.now();
const r = await evaluateThinner({ count: +process.argv[2] || 2500000, createThinner: (p, a) => createBlueNoiseThinner(p, a, { shrink }) });
console.log(JSON.stringify({ shrink, ...r, ssims: r.ssims.map((x) => +x.toFixed(4)), ssimMin: +r.ssimMin.toFixed(4), ssimMean: +r.ssimMean.toFixed(4), seconds: (Date.now() - t0) / 1000 }));
