/*
    * Lamp Simulator
    * This script simulates a lamp with a toggle button.
    * It handles the lamp's on/off state and communicates with a WebSocket server to send status updates.
    * The lamp's appearance changes based on its state.
*/
class LampSimulator {
    constructor() {
        this.isOn = false;
        this.deviceId = null;
        this.lampShade = document.getElementById('lampShade');
        this.light = document.getElementById('light');
        this.toggleBtn = document.getElementById('lampToggleBtn');

        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => {
                this.isOn ? this.turnOff() : this.turnOn();
            });
        } else {
            console.error('Lamp toggle button not found');
        }

        window.wsClient.registerDevice('lamp', this);
    }

    setDeviceId(id) {
        this.deviceId = id;
    }

    sendStatus(status) {
        if (this.deviceId) {
            window.wsClient.sendMessage({
                message_type: 'ack',
                device_id: this.deviceId,
                status
            });
        }
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

    turnOn() {
        if (!this.isOn) {
            this.toggleLamp(true);
            this.sendStatus('on');
            console.log('Lamp turned on');
        } else {
            console.log('Lamp already on');
        }
    }

    turnOff() {
        if (this.isOn) {
            this.toggleLamp(false);
            this.sendStatus('off');
            console.log('Lamp turned off');
        } else {
            console.log('Lamp already off');
        }
    }
}

new LampSimulator();