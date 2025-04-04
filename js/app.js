const ws = new WebSocket('ws://localhost:8080');

const devices = {
    coffee_machine: null,
    lamp: null,
    mediaplayer: null
};

const deviceIds = {};

ws.onopen = () => {
    console.log('Connected to server');
    Object.keys(devices).forEach(deviceType => {
        if (devices[deviceType]) {
            const registerMessage = {
                message_type: 'register',
                device_type: deviceType,
                pin: 1
            };
            ws.send(JSON.stringify(registerMessage));
        }
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
                    } else if (status === 'off') {
                        device.turnOff();
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
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                message_type: 'register',
                device_type: type,
                pin: 1
            }));
        }
    }
};