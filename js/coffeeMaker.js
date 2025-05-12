/*
    * Coffee Machine Simulator
    * This class simulates a coffee machine with various functionalities.
    * It allows users to select different types of coffee, brew them, and take the coffee.
    * The class also handles the power state of the machine and communicates with a WebSocket server.
*/
class CoffeeMachineSimulator {
    constructor() {
        this.selectedCoffee = null;
        this.isBrewing = false;
        this.isReady = false;
        this.isPoweredOn = false;
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
        this.steamInterval = null;

        this.options = document.querySelectorAll('.option');
        this.options.forEach(option => {
            option.addEventListener('click', (event) => {
                if (this.isPoweredOn && !this.isBrewing && !this.isReady) {
                    const coffeeType = event.target.getAttribute('data-coffee');
                    this.selectCoffee(coffeeType);
                }
            });
        });

        this.coffeeCup1.onclick = () => this.takeCoffee();
        this.powerSwitch.addEventListener('change', () => this.togglePower());

        this.updateIndicator();
        window.wsClient.registerDevice('coffee_machine', this);
    }
    // Method to set the device ID for the coffee machine. It assigns the provided ID to the deviceId property.
    setDeviceId(id) {
        this.deviceId = id;
    }
    // Method to send the status of the coffee machine to the server. It checks if the deviceId is set and sends a message with the status.
    // The message includes the device ID and the status (on/off).
    sendStatus(status) {
        if (this.deviceId) {
            wsClient.sendMessage({
                message_type: 'ack',
                device_id: this.deviceId,
                status
            });
        }
    }

    // Method to create a steam particle effect. It creates a div element with the class 'steam-particle',
    // sets random drift and rotation values, appends it to the document body, and removes it after 2 seconds. 
    createSteamParticle() {
        const steam = document.createElement('div');
        steam.className = 'steam-particle';
        const drift = Math.random() * 20 - 10;
        const rotate = Math.random() * 30 - 15;
        steam.style.setProperty('--drift', drift);
        steam.style.setProperty('--rotate', rotate);
        document.getElementById('coffee_machine-popup').appendChild(steam);
        setTimeout(() => steam.remove(), 2000);
    }
    // Method to toggle the power of the coffee machine. It checks the state of the power switch and updates the machine's state accordingly.
    // If the machine is powered off, it resets the machine and updates the status text.
    togglePower() {
        this.isPoweredOn = this.powerSwitch.checked;
        if (!this.isPoweredOn) {
            this.resetMachine();
            this.status.textContent = 'Coffee machine is off';
            this.sendStatus('off');
        } else {
            this.status.textContent = 'Select your coffee';
            this.sendStatus('on');
            document.getElementById('coffee_machine-popup').classList.add('show');
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
            document.getElementById('coffee_machine-popup').classList.add('show');
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

    // Method to update the indicator light based on the current state of the coffee machine.
    // It checks if the machine is powered on, brewing, ready, or idle and updates the indicator's class accordingly.
    updateIndicator() {
        try {
            // Check if the indicator element exists before trying to update it
            if (!this.indicator) {
                throw new Error('Indicator element not found');
            }
            
            if (!this.isPoweredOn) {
                this.indicator.className = 'indicator off';
            } else if (this.isBrewing) {
                this.indicator.className = 'indicator busy';
            } else if (this.isReady) {
                this.indicator.className = 'indicator take';
            } else {
                this.indicator.className = 'indicator ready';
            }
        } catch (error) {
            console.error('Error updating indicator:', error);
        }
    }

    // Method to reset the coffee machine's state. It sets the brewing and ready states to false,
    // clears the selected coffee, hides the coffee cup and fill, and stops the brewing sound.
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
    // Method to handle coffee selection. It checks if the machine is powered on and not brewing or ready,
    // sets the selected coffee type, updates the status text, and starts the brewing process.
    selectCoffee(type) {
        if (!this.isPoweredOn || this.isBrewing || this.isReady) return;
        this.selectedCoffee = type;
        this.status.textContent = `Selected: ${type.charAt(0).toUpperCase() + type.slice(1)}`;
        this.options.forEach(opt => opt.classList.remove('selected'));
        event.target.classList.add('selected');
        this.startBrewing();
    }
    // Method to start the brewing process. It checks if a coffee type is selected and if the machine is not already brewing.
    // If valid, it sets the brewing state to true, updates the indicator, and starts the brewing sound.
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
    // Method to handle the action of taking the coffee. It checks if the machine is ready,
    // sets the ready state to false, updates the indicator, and animates the hand taking the coffee.
    async takeCoffee() {
        if (!this.isReady) return;
        this.isReady = false;
        this.updateIndicator();
        this.coffeeCup1.style.cursor = 'default';
        this.hand.style.display = 'block';

        this.hand.style.left = '65%';
        this.hand.style.top = '300px';
        this.hand.style.transform = 'translateX(-50%) rotate(-70deg)';
        await new Promise(resolve => setTimeout(resolve, 500));

        this.coffeeCup1.style.transform = 'translateY(-50px)';
        this.hand.style.transform = 'translateX(-50%) translateY(-50px) rotate(-70deg)';
        await new Promise(resolve => setTimeout(resolve, 500));

        this.hand.style.left = '340px';
        this.hand.style.transform = 'translateY(-50px) rotate(-70deg)';
        this.coffeeCup1.style.transform = 'translateX(200px) translateY(-60px)';
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.hand.style.display = 'none';
        this.coffeeCup1.style.display = 'none';
        this.coffeeCup1.style.transform = 'none';
        this.status.textContent = 'Select your coffee';
        this.options.forEach(opt => opt.classList.remove('selected'));
    }
}

new CoffeeMachineSimulator();