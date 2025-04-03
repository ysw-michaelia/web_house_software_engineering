const wsClient = require('./app.js');

class CoffeeMachineSimulator {
    constructor() {
        this.selectedCoffee = null;
        this.isBrewing = false;
        this.isReady = false;
        this.isPoweredOn = true;
        this.deviceId = null;
        this.display = document.getElementById('display');
        this.status = document.getElementById('status');
        this.coffeeCup1 = document.getElementById('coffeeCup1');
        this.coffeeFill1 = document.getElementById('coffeeFill1');
        this.drip1 = document.getElementById('drip1');
        this.hand = document.getElementById('hand');
        this.brewSound = document.getElementById('brewSound');
        this.indicator = document.getElementById('indicator');
        this.powerSwitch = document.getElementById('powerSwitch');
        this.options = document.querySelectorAll('.option');
        this.steamInterval = null;

        this.coffeeCup1.onclick = () => this.takeCoffee();
        this.powerSwitch.addEventListener('change', () => this.togglePower());

        this.updateIndicator();

        wsClient.registerDevice('coffee_machine', this);
    }

    setDeviceId(id) {
        this.deviceId = id;
    }

    sendStatus(status) {
        if (this.deviceId) {
            wsClient.sendMessage({
                message_type: 'ack',
                device_id: this.deviceId,
                status
            });
        }
    }

    createSteamParticle() {
        const steam = document.createElement('div');
        steam.className = 'steam-particle';
        const drift = Math.random() * 20 - 10;
        const rotate = Math.random() * 30 - 15;
        steam.style.setProperty('--drift', drift);
        steam.style.setProperty('--rotate', rotate);
        document.body.appendChild(steam);
        setTimeout(() => steam.remove(), 2000);
    }

    togglePower() {
        this.isPoweredOn = this.powerSwitch.checked;
        if (!this.isPoweredOn) {
            this.resetMachine();
            this.status.textContent = 'Coffee machine is off';
            this.sendStatus('off');
        } else {
            this.status.textContent = 'Select your coffee';
            this.sendStatus('on');
        }
        this.updateIndicator();
    }

    // Method to turn on the coffee machine. If the machine is currently inactive,
    // it switches the power on, updates its state, and logs that it has been turned on.
    // Otherwise, it logs that the machine is already on.
    turnOn() {
        if (!this.isPoweredOn) {
            this.isPoweredOn = true;
            this.powerSwitch.checked = true;
            this.status.textContent = 'Select your coffee';
            this.updateIndicator();
            this.sendStatus('on');
            console.log('Coffee machine turned on');
        } else {
            console.log('Coffee machine already turned on');
        }
    }

    // Method to disable the coffee machine. If the machine is currently active,
    // it switches the power off, updates its state, and logs that it has been turned off.
    // Otherwise, it logs that the machine is already disabled.
    turnOff() {
        if (this.isPoweredOn) {
            this.isPoweredOn = false;
            this.powerSwitch.checked = false;
            this.resetMachine();
            this.status.textContent = 'Coffee machine is off';
            this.updateIndicator();
            this.sendStatus('off');
            console.log('Coffee machine turned off');
        } else {
            console.log('Coffee machine already turned off');
        }
    }

    updateIndicator() {
        if (!this.isPoweredOn) {
            this.indicator.className = 'indicator off';
        } else if (this.isBrewing) {
            this.indicator.className = 'indicator busy';
        } else if (this.isReady) {
            this.indicator.className = 'indicator take';
        } else {
            this.indicator.className = 'indicator ready';
        }
    }

    resetMachine() {
        this.isBrewing = false;
        this.isReady = false;
        this.selectedCoffee = null;
        this.coffeeCup1.style.display = 'none';
        this.coffeeFill1.style.height = '0';
        this.drip1.style.display = 'none';
        this.hand.style.display = 'none';
        this.brewSound.pause();
        this.options.forEach(opt => opt.classList.remove('selected'));
        if (this.steamInterval) clearInterval(this.steamInterval);
    }

    selectCoffee(type) {
        if (!this.isPoweredOn || this.isBrewing || this.isReady) return;
        this.selectedCoffee = type;
        this.status.textContent = `Selected: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        this.options.forEach(opt => opt.classList.remove('selected'));
        event.target.classList.add('selected');
        this.startBrewing();
    }

    async startBrewing() {
        if (!this.selectedCoffee || this.isBrewing) return;
        this.isBrewing = true;
        this.updateIndicator();
        this.coffeeCup1.style.display = 'block';
        this.coffeeCup1.style.cursor = 'default';
        this.coffeeFill1.style.height = '0';

        let brewTime, fillHeight, color;
        switch (this.selectedCoffee) {
            case 'espresso': brewTime = 2000; fillHeight = 30; color = '#4a2c2a'; break;
            case 'latte': brewTime = 3000; fillHeight = 80; color = '#d4a774'; break;
            case 'cappuccino': brewTime = 2500; fillHeight = 70; color = '#c68c53'; break;
            case 'americano': brewTime = 2500; fillHeight = 85; color = '#3c2f2f'; break;
            case 'mocha': brewTime = 3000; fillHeight = 90; color = '#5c4033'; break;
            case 'macchiato': brewTime = 2000; fillHeight = 40; color = '#6b4e31'; break;
            case 'flatwhite': brewTime = 2500; fillHeight = 75; color = '#d2b48c'; break;
            case 'ristretto': brewTime = 1800; fillHeight = 25; color = '#3f2a1d'; break;
        }

        this.status.textContent = `Brewing ${this.selectedCoffee}...`;
        this.coffeeFill1.style.background = color;
        this.drip1.style.display = 'block';
        this.brewSound.currentTime = 0;
        this.brewSound.play();

        this.steamInterval = setInterval(() => this.createSteamParticle(), 200);

        await new Promise(resolve => setTimeout(resolve, 500));
        this.coffeeFill1.style.height = `${fillHeight}px`;
        await new Promise(resolve => setTimeout(resolve, brewTime));

        this.drip1.style.display = 'none';
        this.brewSound.pause();
        clearInterval(this.steamInterval);
        this.status.textContent = `${this.selectedCoffee.charAt(0).toUpperCase() + this.selectedCoffee.slice(1)} ready! Click cup to take`;
        this.isBrewing = false;
        this.isReady = true;
        this.updateIndicator();
        this.coffeeCup1.style.cursor = 'pointer';
    }

    async takeCoffee() {
        if (!this.isReady) return;
        this.isReady = false;
        this.updateIndicator();
        this.coffeeCup1.style.cursor = 'default';
        this.hand.style.display = 'block';

        this.hand.style.left = '190px';
        this.hand.style.top = '410px';
        this.hand.style.transform = 'rotate(-70deg)';
        await new Promise(resolve => setTimeout(resolve, 500));

        this.coffeeCup1.style.transform = 'translateY(-50px)';
        this.hand.style.transform = 'translateY(-50px) rotate(-70deg)';
        await new Promise(resolve => setTimeout(resolve, 500));

        this.hand.style.left = '340px';
        this.hand.style.transform = 'translateY(-50px) rotate(-70deg)';
        this.coffeeCup1.style.transform = 'translateX(150px) translateY(-50px)';
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.hand.style.display = 'none';
        this.coffeeCup1.style.display = 'none';
        this.coffeeCup1.style.transform = 'none';
        this.status.textContent = 'Select your coffee';
        this.options.forEach(opt => opt.classList.remove('selected'));
    }
}

const coffeeMaker = new CoffeeMachineSimulator();

function selectCoffee(type) {
    coffeeMaker.selectCoffee(type);
}
