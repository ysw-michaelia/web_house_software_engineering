class MediaPlayer {
    constructor() {
        this.audio = document.getElementById('audio');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progress = document.getElementById('progress');
        this.time = document.getElementById('time');
        this.volume = document.getElementById('volume');
        this.display = document.getElementById('display');
        this.isPlaying = false;

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.playPauseBtn.addEventListener('click', () => this.togglePlayPause());
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => this.resetPlayer());
        this.volume.addEventListener('input', (e) => this.setVolume(e.target.value));
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.audio.pause();
            this.playPauseBtn.classList.remove('playing');
        } else {
            this.audio.play().catch(error => console.error('Error:', error));
            this.playPauseBtn.classList.add('playing');
            this.display.textContent = 'Playing: Sample Song';
        }
        this.isPlaying = !this.isPlaying;
    }

    updateProgress() {
        const currentTime = this.audio.currentTime;
        const duration = this.audio.duration || 0;
        const progressPercent = (currentTime / duration) * 100;
        this.progress.style.width = `${progressPercent}%`;

        const currentMinutes = Math.floor(currentTime / 60);
        const currentSeconds = Math.floor(currentTime % 60);
        const durationMinutes = Math.floor(duration / 60);
        const durationSeconds = Math.floor(duration % 60);
        this.time.textContent = `${currentMinutes}:${currentSeconds.toString().padStart(2, '0')} / ${durationMinutes}:${durationSeconds.toString().padStart(2, '0')}`;
    }

    resetPlayer() {
        this.isPlaying = false;
        this.playPauseBtn.classList.remove('playing');
        this.progress.style.width = '0%';
        this.time.textContent = '0:00 / 0:00';
        this.display.textContent = 'No song playing';
        this.audio.currentTime = 0;
    }

    setVolume(value) {
        this.audio.volume = value;
    }
}

const player = new MediaPlayer();
let playerWindow = null;

const ws = new WebSocket('ws://localhost:8080');

ws.onopen = () => {
    console.log('Connected to WebSocket server');
    ws.send(JSON.stringify({ type: 'register', deviceId: 'mediaPlayer' }));
};

ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'command') {
        if (data.command === 'on') {
            if (!playerWindow || playerWindow.closed) {
                playerWindow = window.open('player.html', 'playerWindow', 'width=500,height=500');
            }
            player.audio.play();
            player.isPlaying = true;
        } else if (data.command === 'off') {
            player.audio.pause();
            player.isPlaying = false;
        }
    }
};

window.onbeforeunload = () => {
    if (playerWindow) playerWindow.close();
};