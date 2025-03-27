const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let devices = {};

// dealing with socket connection
wss.on('connection', (ws) => {
    console.log('connect');

    // monitoring message
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // register
            if (data.type === 'register') {
                const { deviceId } = data;
                devices[deviceId] = ws;
                console.log(`Device ${deviceId} registered`);
            }

            // control
            if (data.type === 'control') {
                const { deviceId, command } = data;
                if (devices[deviceId]) {
                    devices[deviceId].send(JSON.stringify({ type: 'command', command }));
                    ws.send(JSON.stringify({ type: 'status', message: `Command ${command} sent to ${deviceId}` }));
                    console.log(`Send ${command} to ${deviceId}`);
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: `Device ${deviceId} not found` }));
                }
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // disconnect
    ws.on('close', () => {
        for (const [id, deviceWs] of Object.entries(devices)) {
            if (deviceWs === ws) {
                console.log(`Device ${id} disconnected`);
                delete devices[id];
                break;
            }
        }
    });
});

console.log('WebSocket is running on ws://localhost:8080');
