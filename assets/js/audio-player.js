// assets/js/audio-player.js
(function() {
  function formatTime(sec) {
    if (isNaN(sec) || sec === null || sec === undefined) return '--:--';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
  }

  document.querySelectorAll('.audio-player').forEach(player => {
    const audio = player.querySelector('.audio-el');
    const playBtn = player.querySelector('[data-action="play-pause"]');
    const backBtn = player.querySelector('[data-action="back-15"]');
    const fwdBtn = player.querySelector('[data-action="fwd-30"]');
    const seek = player.querySelector('.seek-bar');
    const vol = player.querySelector('.volume-bar');
    const speed = player.querySelector('.speed-select');
    const current = player.querySelector('.current-time');
    const total = player.querySelector('.total-time');

    // Validation check
    if (!audio || !playBtn) {
      console.warn('Audio player: missing essential elements');
      return;
    }

    // Simple state tracking
    let isSeeking = false;
    let wasPlaying = false;
    let currentPlayPromise = null;
    let seekDebounceTimer = null;
    let skipDebounceTimer = null;

    // Robust play function with promise handling
    async function playAudio() {
      try {
        // Wait for any existing promise to complete
        if (currentPlayPromise) {
          try {
            await currentPlayPromise;
          } catch (e) {
            // Ignore previous promise errors
          }
        }

        if (audio.paused) {
          currentPlayPromise = audio.play();
          await currentPlayPromise;
          currentPlayPromise = null;
        }
      } catch (error) {
        currentPlayPromise = null;
        
        // Only log significant errors
        if (error.name !== 'AbortError') {
          console.warn('Play interrupted:', error.name);
        }
      }
    }

    // Simple pause function
    function pauseAudio() {
      try {
        if (!audio.paused) {
          audio.pause();
        }
      } catch (error) {
        console.warn('Pause error:', error);
      }
    }

    // Update UI based on audio state
    function updateUI() {
      if (playBtn) {
        playBtn.innerHTML = audio.paused ? 
          '<i class="fas fa-play"></i>' : 
          '<i class="fas fa-pause"></i>';
      }
    }

    // Debounced seek to prevent overwhelming the audio element
    function debouncedSeek(value) {
      if (seekDebounceTimer) {
        clearTimeout(seekDebounceTimer);
      }
      
      seekDebounceTimer = setTimeout(() => {
        if (audio.duration && !isNaN(audio.duration)) {
          try {
            const newTime = (value / 100) * audio.duration;
            audio.currentTime = newTime;
          } catch (error) {
            console.warn('Seek error:', error);
          }
        }
      }, 100); // Conservative debounce timing
    }

    // Basic event listeners
    audio.addEventListener('loadedmetadata', () => {
      if (total) total.textContent = formatTime(audio.duration);
      if (seek) seek.value = 0;
    });

    audio.addEventListener('timeupdate', () => {
      if (!isSeeking && audio.duration && !isNaN(audio.duration)) {
        if (current) current.textContent = formatTime(audio.currentTime);
        if (seek) seek.value = (audio.currentTime / audio.duration) * 100;
      }
    });

    audio.addEventListener('play', updateUI);
    audio.addEventListener('pause', updateUI);

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', {
        code: audio.error?.code,
        message: audio.error?.code === 2 ? 'Network error - audio may be loading' : 'Audio error'
      });
      updateUI();
    });

    // Play/Pause control
    playBtn.addEventListener('click', async () => {
      if (audio.paused) {
        await playAudio();
      } else {
        pauseAudio();
      }
    });

    // Skip controls with debouncing to prevent rapid triggering
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (skipDebounceTimer) {
          clearTimeout(skipDebounceTimer);
        }
        
        skipDebounceTimer = setTimeout(() => {
          wasPlaying = !audio.paused;
          
          try {
            audio.currentTime = Math.max(0, audio.currentTime - 15);
            
            // Resume if was playing
            if (wasPlaying) {
              setTimeout(() => playAudio(), 50);
            }
          } catch (error) {
            console.warn('Skip back error:', error);
          }
        }, 100); // Debounce rapid clicks
      });
    }

    if (fwdBtn) {
      fwdBtn.addEventListener('click', () => {
        if (skipDebounceTimer) {
          clearTimeout(skipDebounceTimer);
        }
        
        skipDebounceTimer = setTimeout(() => {
          wasPlaying = !audio.paused;
          
          try {
            if (audio.duration && !isNaN(audio.duration)) {
              audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
            } else {
              audio.currentTime = audio.currentTime + 30;
            }
            
            // Resume if was playing
            if (wasPlaying) {
              setTimeout(() => playAudio(), 50);
            }
          } catch (error) {
            console.warn('Skip forward error:', error);
          }
        }, 100); // Debounce rapid clicks
      });
    }

    // Simplified seek bar handling
    if (seek) {
      // Start seeking
      seek.addEventListener('mousedown', () => {
        isSeeking = true;
        wasPlaying = !audio.paused;
        
        if (wasPlaying) {
          pauseAudio();
        }
      });

      // During seeking
      seek.addEventListener('input', () => {
        if (isSeeking) {
          debouncedSeek(seek.value);
        }
      });

      // End seeking
      seek.addEventListener('mouseup', () => {
        if (isSeeking) {
          isSeeking = false;
          
          // Clear any pending seeks
          if (seekDebounceTimer) {
            clearTimeout(seekDebounceTimer);
          }
          
          // Final seek
          if (audio.duration && !isNaN(audio.duration)) {
            try {
              const newTime = (seek.value / 100) * audio.duration;
              audio.currentTime = newTime;
            } catch (error) {
              console.warn('Final seek error:', error);
            }
          }
          
          // Resume if was playing
          if (wasPlaying) {
            setTimeout(() => playAudio(), 100);
          }
        }
      });

      // Handle clicks on the seek bar (discrete seeking)
      seek.addEventListener('click', (e) => {
        if (!isSeeking) {
          wasPlaying = !audio.paused;
          
          if (wasPlaying) {
            pauseAudio();
          }
          
          // Immediate seek for clicks
          if (audio.duration && !isNaN(audio.duration)) {
            try {
              const newTime = (seek.value / 100) * audio.duration;
              audio.currentTime = newTime;
            } catch (error) {
              console.warn('Click seek error:', error);
            }
          }
          
          // Resume if was playing
          if (wasPlaying) {
            setTimeout(() => playAudio(), 100);
          }
        }
      });

      // Touch support for mobile
      seek.addEventListener('touchstart', () => {
        isSeeking = true;
        wasPlaying = !audio.paused;
        if (wasPlaying) pauseAudio();
      });

      seek.addEventListener('touchend', () => {
        if (isSeeking) {
          isSeeking = false;
          if (wasPlaying) {
            setTimeout(() => playAudio(), 100);
          }
        }
      });
    }

    // Volume control
    if (vol) {
      vol.addEventListener('input', () => {
        try {
          const volume = parseFloat(vol.value);
          if (!isNaN(volume) && volume >= 0 && volume <= 1) {
            audio.volume = volume;
          }
        } catch (error) {
          console.warn('Volume error:', error);
        }
      });
    }

    // Speed control
    if (speed) {
      speed.addEventListener('change', () => {
        try {
          const rate = parseFloat(speed.value);
          if (!isNaN(rate) && rate > 0) {
            audio.playbackRate = rate;
          }
        } catch (error) {
          console.warn('Speed error:', error);
        }
      });
    }

    // End of audio
    audio.addEventListener('ended', () => {
      updateUI();
      audio.currentTime = 0;
      if (seek) seek.value = 0;
      if (current) current.textContent = '0:00';
    });

    // Initialize controls
    if (vol && vol.value) audio.volume = parseFloat(vol.value);
    if (speed && speed.value) audio.playbackRate = parseFloat(speed.value);
    
    // Initial UI update
    updateUI();

    // Clean up timers on page unload
    window.addEventListener('beforeunload', () => {
      if (seekDebounceTimer) clearTimeout(seekDebounceTimer);
      if (skipDebounceTimer) clearTimeout(skipDebounceTimer);
    });
  });
})();
