// Voice synthesis utility for employee greetings
class VoiceGreeting {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.isInitialized = false;
    this.initVoices();
  }

  initVoices() {
    // Load available voices
    this.updateVoices();
    
    // Set up voice change listener
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = () => {
        this.updateVoices();
        this.isInitialized = true;
      };
    } else {
      // Fallback for browsers that don't support onvoiceschanged
      setTimeout(() => {
        this.updateVoices();
        this.isInitialized = true;
      }, 100);
    }
  }

  updateVoices() {
    this.voices = this.synth.getVoices();
    console.log('Available voices:', this.voices.length);
  }

  speak(text, options = {}) {
    // Check if speech synthesis is supported
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported in this browser');
      if (options.onError) {
        options.onError({ error: 'Speech synthesis not supported' });
      }
      return null;
    }

    if (!this.synth) {
      console.warn('Speech synthesis not available');
      if (options.onError) {
        options.onError({ error: 'Speech synthesis not available' });
      }
      return null;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set options
    const defaultOptions = {
      rate: 0.9,      // Slightly slower for clarity
      pitch: 1.0,     // Normal pitch
      volume: 0.8,    // Slightly reduced volume for better user experience
      voice: null,    // Will use default voice
      lang: 'en-US'   // English
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Set voice if specified
    if (finalOptions.voice && this.voices.length > 0) {
      const selectedVoice = this.voices.find(voice => 
        voice.name === finalOptions.voice || voice.lang === finalOptions.voice
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        // Try to find a good English voice
        const englishVoice = this.voices.find(voice => 
          voice.lang.startsWith('en') && voice.localService
        );
        if (englishVoice) {
          utterance.voice = englishVoice;
        }
      }
    } else if (this.voices.length > 0) {
      // Auto-select a good voice
      const preferredVoice = this.voices.find(voice => 
        voice.lang.startsWith('en') && voice.localService && !voice.name.includes('Google')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    // Apply options
    utterance.rate = Math.max(0.5, Math.min(2, finalOptions.rate));
    utterance.pitch = Math.max(0.5, Math.min(2, finalOptions.pitch));
    utterance.volume = Math.max(0, Math.min(1, finalOptions.volume));
    utterance.lang = finalOptions.lang;

    // Event handlers
    utterance.onstart = () => {
      console.log('Speech started:', text);
      if (options.onStart) options.onStart();
    };

    utterance.onend = () => {
      console.log('Speech ended');
      if (options.onEnd) options.onEnd();
    };

    utterance.onerror = (event) => {
      console.error('Speech error:', event);
      if (options.onError) options.onError(event);
    };

    utterance.onpause = () => {
      console.log('Speech paused');
    };

    utterance.onresume = () => {
      console.log('Speech resumed');
    };

    // Speak with a small delay to ensure proper initialization
    setTimeout(() => {
      if (this.synth) {
        this.synth.speak(utterance);
      }
    }, 100);
    
    return utterance;
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
      console.log('Speech stopped');
    }
  }

  pause() {
    if (this.synth) {
      this.synth.pause();
      console.log('Speech paused');
    }
  }

  resume() {
    if (this.synth) {
      this.synth.resume();
      console.log('Speech resumed');
    }
  }

  getVoices() {
    return this.voices;
  }

  isSpeaking() {
    return this.synth ? this.synth.speaking : false;
  }

  isPaused() {
    return this.synth ? this.synth.paused : false;
  }

  isReady() {
    return this.isInitialized && this.voices.length > 0;
  }

  // Method to test speech synthesis
  test() {
    this.speak("Voice synthesis is working correctly!", {
      onStart: () => console.log("Test speech started"),
      onEnd: () => console.log("Test speech ended"),
      onError: (error) => console.error("Test speech error:", error)
    });
  }
}

// Create singleton instance
const voiceGreeting = new VoiceGreeting();

export default voiceGreeting;
