export function healthCheck(_req, res) {
  return res.json({
    status: 'ok',
    service: 'nestmart-backend',
    timestamp: new Date().toISOString()
  });
}
