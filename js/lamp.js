class LampSimulator {
    constructor() {
        this.isOn = false;
        this.lampShade = document.getElementById('lampShade');
        this.light = document.getElementById('light');
    }

    toggleLamp(state) {
        this.isOn = state;
        if (this.isOn) {
            this.lampShade.classList.add('on');
            this.light.classList.add('on');
        } else {
            this.lampShade.classList.remove('on');
            this.light.classList.remove('on');
        }
    }
}

const lamp = new LampSimulator();
let lampWindow = null; 

// WebSocket 连接
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to WebSocket server');
    ws.send(JSON.stringify({ type: 'register', deviceId: 'lamp1' }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'command') {
        if (data.command === 'on') {
            if (!lampWindow || lampWindow.closed) {
                lampWindow = window.open('lamp.html', 'lampWindow', 'width=400,height=400');
            }
            lamp.toggleLamp(true); // 只开灯，不重复弹窗
        } else if (data.command === 'off') {
            lamp.toggleLamp(false); // 关灯，但不关闭窗口
        }
    }
};

// 页面关闭时，确保窗口不留存
window.onbeforeunload = () => {
    if (lampWindow) lampWindow.close();
};
