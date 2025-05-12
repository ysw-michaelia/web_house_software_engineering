const ws = new WebSocket('ws://localhost:8080');

const devices = {
    coffee_machine: null,
    lamp: null,
    mediaplayer: null
};

const deviceIds = {};


// Define one unique pin per device type
const deviceConfigs = [
    { type: 'light', pin: 51 },
    { type: 'coffee_machine', pin: 52 },
    { type: 'mediaplayer', pin: 53 }
];

ws.onopen = () => {
    deviceConfigs.forEach((cfg, idx) => {
        setTimeout(() => {
            if (devices[cfg.type]) {
                const registerMessage = {
                    message_type: 'register',
                    device_type: cfg.type,
                    pin: cfg.pin
                };
                ws.send(JSON.stringify(registerMessage));
            } else {
                console.warn(`No instance for '${cfg.type}', skipping registration`);
            }
        }, idx * 500);
    });
};

ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);
        console.log('Received:', data);

        if (!data.message_type) {
            throw new Error("Missing message_type");
        }

        if (data.message_type === 'registered') {
            if (!data.device_id) {
                throw new Error("Missing device_id");
            }
            const deviceId = data.device_id;
            const deviceType = Object.keys(devices).find(type => !deviceIds[type] && devices[type]);
            if (deviceType) {
                deviceIds[deviceType] = deviceId;
                devices[deviceType].setDeviceId(deviceId);
                console.log(`${deviceType} registered with ID: ${deviceId}`);
            }
        }

        if (data.message_type === 'device_update') {
            const { device_id, status } = data;
            if (!device_id || !status) {
                console.warn("Missing device_id or status in device_update message");
                return;
            }

            for (const [type, device] of Object.entries(devices)) {
                if (device && deviceIds[type] === device_id) {
                    if (status === 'on') {
                        device.turnOn();
                        // 显示设备弹窗
                        document.getElementById(`${type}-popup`).classList.add('show');
                    } else if (status === 'off') {
                        device.turnOff();
                        // 不关闭弹窗
                    }
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error parsing message:', error);
    }
};

ws.onclose = () => {
    console.log('Disconnected from server');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};

window.wsClient = {
    ws,
    sendMessage: (msg) => ws.send(JSON.stringify(msg)),
    registerDevice: (type, instance) => {
        devices[type] = instance;
        const cfg = deviceConfigs.find(c => c.type === type);
        if (!cfg) {
            console.error(`registerDevice: no pin mapping for type '${type}'`);
            return;
        }
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                message_type: 'register',
                device_type: type,
                pin: cfg.pin
            }));
        }
    }
};