const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

let devices = {}; // 设备列表 { id: WebSocket }

// 处理 WebSocket 连接
wss.on('connection', (ws) => {
    console.log('设备连接成功');

    // 监听消息
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);

            // 设备注册
            if (data.type === 'register') {
                const { deviceId } = data;
                devices[deviceId] = ws;
                console.log(`设备 ${deviceId} 已注册`);
            }

            // 控制设备（on/off）
            if (data.type === 'control') {
                const { deviceId, command } = data;
                if (devices[deviceId]) {
                    devices[deviceId].send(JSON.stringify({ type: 'command', command }));
                    console.log(`发送 ${command} 命令到 ${deviceId}`);
                }
            }
        } catch (error) {
            console.error('处理消息错误:', error);
        }
    });

    // 设备断开连接
    ws.on('close', () => {
        for (const [id, deviceWs] of Object.entries(devices)) {
            if (deviceWs === ws) {
                console.log(`设备 ${id} 断开连接`);
                delete devices[id];
                break;
            }
        }
    });
});

console.log('WebSocket 服务器运行在 ws://localhost:8080');
