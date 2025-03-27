class CoffeeMachineSimulator {
    constructor() {
        this.selectedCoffee = null;
        this.isBrewing = false;
        this.isReady = false;
        this.isPoweredOn = true;
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
    }

    togglePower() {
        this.isPoweredOn = this.powerSwitch.checked;
        if (!this.isPoweredOn) {
            this.resetMachine();
            this.status.textContent = 'Coffee machine is off';
        } else {
            this.status.textContent = 'Select your coffee';
        }
        this.updateIndicator();
    }

    updateIndicator() {
        if (!this.isPoweredOn) {
            this.indicator.className = 'indicator off'; // 关机状态
        } else if (this.isBrewing) {
            this.indicator.className = 'indicator busy'; // 冲泡中（红色）
        } else if (this.isReady) {
            this.indicator.className = 'indicator take'; // 咖啡就绪（黄色）
        } else {
            this.indicator.className = 'indicator ready'; // 就绪（绿色）
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

        switch(this.selectedCoffee) {
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

const simulator = new CoffeeMachineSimulator();

function selectCoffee(type) {
    simulator.selectCoffee(type);
}