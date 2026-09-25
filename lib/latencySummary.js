// nearest-rank percentile of an ascending sorted array
function percentile(sorted, p) {
  return sorted[Math.max(0, Math.ceil(p / 100 * sorted.length) - 1)];
}

function latencySummary(latencies) {
  if (latencies.length === 0) {
    return null;
  }

  var sorted = latencies.slice().sort(function(a, b) { return a - b; });
  var sum = sorted.reduce(function(total, latency) { return total + latency; }, 0);

  return {
    mean: Math.round(sum / sorted.length),
    p50: percentile(sorted, 50),
    p90: percentile(sorted, 90),
    p99: percentile(sorted, 99),
    max: sorted[sorted.length - 1]
  };
}

function formatLatencySummary(summary) {
  return 'Latency: mean ' + summary.mean + 'ms, p50 ' + summary.p50 + 'ms, p90 ' +
    summary.p90 + 'ms, p99 ' + summary.p99 + 'ms, max ' + summary.max + 'ms';
}

module.exports = latencySummary;
module.exports.format = formatLatencySummary;
