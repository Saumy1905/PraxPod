// --- assets/js/audio-player.js ---

document.addEventListener('DOMContentLoaded', () => {
    const audioPlayer = document.getElementById('audio-player');
    if (!audioPlayer) return;

    const audio = document.getElementById('audio-element');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = playPauseBtn.querySelector('.fa-play');
    const pauseIcon = playPauseBtn.querySelector('.fa-pause');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');
    const volumeBar = document.getElementById('volume-bar');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeIcon = volumeBtn.querySelector('i');

    // Play/Pause functionality
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
    });

    audio.addEventListener('play', () => {
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'block';
    });

    audio.addEventListener('pause', () => {
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
    });

    // Progress bar functionality
    audio.addEventListener('timeupdate', () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        progressBar.value = progress;
        currentTimeEl.textContent = formatTime(audio.currentTime);
    });

    progressBar.addEventListener('input', () => {
        const time = (progressBar.value / 100) * audio.duration;
        audio.currentTime = time;
    });

    // Display duration
    audio.addEventListener('loadedmetadata', () => {
        durationEl.textContent = formatTime(audio.duration);
    });

    // Volume control
    volumeBar.addEventListener('input', (e) => {
        audio.volume = e.target.value;
    });

    audio.addEventListener('volumechange', () => {
        volumeBar.value = audio.volume;
        updateVolumeIcon();
    });
    
    volumeBtn.addEventListener('click', () => {
        audio.muted = !audio.muted;
        updateVolumeIcon();
    });
    
    function updateVolumeIcon() {
        if (audio.muted || audio.volume === 0) {
            volumeIcon.className = 'fas fa-volume-mute';
        } else if (audio.volume < 0.5) {
            volumeIcon.className = 'fas fa-volume-down';
        } else {
            volumeIcon.className = 'fas fa-volume-up';
        }
    }

    // Time formatting
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    
    // Initialize
    pauseIcon.style.display = 'none';
    updateVolumeIcon();
});
