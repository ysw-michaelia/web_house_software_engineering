/*
    * Media Player Class
    * This class handles the media player functionality including play/pause, volume control, and progress tracking.
    * It also communicates with a WebSocket server to send status updates.
*/
class MediaPlayer {
    constructor() {
        this.audio = document.getElementById('audio');
        this.playPauseBtn = document.getElementById('playPauseBtn');
        this.progress = document.getElementById('progress');
        this.time = document.getElementById('time');
        this.volume = document.getElementById('volume');
        this.display = document.getElementById('mediaPlayerDisplay');
        this.isPlaying = false;
        this.deviceId = null;

        this.initializeEventListeners();
        window.wsClient.registerDevice('mediaplayer', this);
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
            this.isPlaying = false;
            this.sendStatus('off');
        } else {
            this.audio.play().catch(error => console.error('Error:', error));
            this.playPauseBtn.classList.add('playing');
            this.display.textContent = 'Playing: Sample Song';
            this.isPlaying = true;
            this.sendStatus('on');
        }
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
        this.sendStatus('off');
    }

    setVolume(value) {
        this.audio.volume = value;
    }

    turnOn() {
        if (!this.isPlaying) {
            this.audio.play().catch(error => console.error('Error:', error));
            this.playPauseBtn.classList.add('playing');
            this.display.textContent = 'Playing: Sample Song';
            this.isPlaying = true;
            this.sendStatus('on');
            console.log('Media player turned on');
        } else {
            console.log('Media player already on');
        }
    }

    turnOff() {
        if (this.isPlaying) {
            this.audio.pause();
            this.playPauseBtn.classList.remove('playing');
            this.isPlaying = false;
            this.sendStatus('off');
            console.log('Media player turned off');
        } else {
            console.log('Media player already off');
        }
    }
}

new MediaPlayer();