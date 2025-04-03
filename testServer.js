// testServer.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });
const devices = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received:', data);

        if (data.message_type === 'register') {
            const deviceId = Date.now(); // 简单生成唯一 ID
            devices.set(deviceId, ws);
            ws.send(JSON.stringify({
                message_type: 'registered',
                device_id: deviceId
            }));
            console.log(`Registered device ${deviceId} as ${data.device_type}`);
        }

        if (data.message_type === 'ack') {
            console.log(`Device ${data.device_id} updated to ${data.status}`);
        }
    });

    ws.on('close', () => {
        for (const [id, deviceWs] of devices) {
            if (deviceWs === ws) {
                devices.delete(id);
                console.log(`Device ${id} disconnected`);
                break;
            }
        }
    });
});

// 模拟发送命令
function sendCommand(deviceId, status) {
    const ws = devices.get(deviceId);
    if (ws) {
        ws.send(JSON.stringify({
            message_type: 'device_update',
            device_id: deviceId,
            status
        }));
        console.log(`Sent ${status} to device ${deviceId}`);
    }
}

console.log('WebSocket server running on ws://localhost:8080');

// 示例：5秒后发送命令（测试用）
setTimeout(() => {
    const deviceId = [...devices.keys()][0]; // 获取第一个设备
    if (deviceId) sendCommand(deviceId, 'on');
}, 5000);