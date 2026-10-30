const buckets = new Map();
function rateLimit({ windowMs = 60_000, max = 60, key = req => `${req.ip || req.socket.remoteAddress}:${req.path}` } = {}) {
  return (req, res, next) => {
    const now = Date.now();
    const id = key(req);
    let bucket = buckets.get(id);
    if (!bucket || now >= bucket.resetAt) bucket = { count: 0, resetAt: now + windowMs };
    bucket.count += 1;
    buckets.set(id, bucket);
    if (buckets.size > 20_000) for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, max - bucket.count)));
    res.setHeader('RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
    if (bucket.count > max) return res.status(429).json({ status: 'error', code: 'RATE_LIMITED', message: 'Too many requests. Please wait and try again.' });
    next();
  };
}
rateLimit._buckets = buckets;
rateLimit.reset = () => buckets.clear();
module.exports = rateLimit;
