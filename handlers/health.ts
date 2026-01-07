export function handleHealthCheck() {
    return new Response(JSON.stringify({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
}
