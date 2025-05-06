import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import AudioProgressBar from './audio-progress-bar';
import './tracks.css';
import { Pause, Play } from 'lucide-react';

export default function AudioPlayer({ tracks }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [trackProgresses, setTrackProgresses] = useState({});

  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const isReadyRef = useRef(false);

  // initialize audio component on mount
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    // audio.volume = volume;
    audio.preload = 'metadata';

    const handleSrcChange = () => (isReadyRef.current = false);
    audio.addEventListener('emptied', handleSrcChange);

    return () => {
      clearInterval(intervalRef.current); // Clear interval on unmount
      if (audioRef.current) {
        audioRef.current.removeEventListener('emptied', handleSrcChange);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      audioRef.current = null;
    };
  }, []);

  // Handle track selection
  const handleTrackSelect = useCallback(
    index => {
      // When selecting current track, toggle play/pause
      if (index === currentIndex) {
        setIsPlaying(prev => !prev);
      } else {
        // when selecting new track, play new track
        setCurrentIndex(index);
        setIsPlaying(true);
      }
    },
    [currentIndex]
  );

  // Handle seeking
  const handleSeek = useCallback(
    (trackKey, time) => {
      const trackIndex = tracks.findIndex(t => t._key === trackKey);
      if (trackIndex === -1) return; // can't find track
      const audio = audioRef.current;
      if (!audio) return; // no audio object
      // Update progress for track in state
      setTrackProgresses(prev => ({
        ...prev,
        [trackKey]: time,
      }));
      // Update audio.currentTime for currently active track
      if (trackIndex === currentIndex) {
        if (isReadyRef.current && audio.readyState >= audio.HAVE_METADATA) {
          audio.currentTime = time;
        }
      }
    },
    [tracks, currentIndex]
  );

  // Handle previous track
  const handlePrevTrack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // Handle next track
  const handleNextTrack = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < tracks.length) {
      setCurrentIndex(nextIndex);
      setIsPlaying(true);
    }
  }, [currentIndex, tracks.length]);

  // Handle track loading, playback state, listeners, and progress update
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || currentIndex < 0 || currentIndex >= tracks.length) return;

    const track = tracks[currentIndex];

    // Track loading
    if (audio.src !== track.url) {
      audio.pause();
      clearInterval(intervalRef.current);
      audio.src = track.url;
      // Optionally reset progress visually, or keep existing state
      // Keeping existing state allows resuming if track is re-selected
      setTrackProgresses(prev => ({
        ...prev,
        [track._key]: prev[track._key] || 0, // Initialize progress if not set
      }));
    }

    // Set up event listeners

    const handleMetadataLoaded = () => {
      // get the progress for the current track
      const storedProgress = trackProgresses[track._key] || 0;
      if (
        audio.src === track.url && // current track
        storedProgress > 0 && // the track has progressed
        Math.abs(audio.currentTime - storedProgress) > 0.1 // the progress is perceptible
      ) {
        audio.currentTime = storedProgress;
      }
      // the track is ready!
      isReadyRef.current = true;

      // Play it if we should be playing
      if (isPlaying) {
        attemptPlay();
      }
    };

    const handleCanPlay = () => {
      isReadyRef.current = true;
      if (isPlaying) {
        attemptPlay();
      }
    };

    const handleEnded = () => {
      setTrackProgresses(prev => ({
        ...prev,
        [track._key]: 0,
      }));
      handleNextTrack();
    };

    const updateTime = () => {
      if (audio.src === track.url && !audio.seeking) {
        setTrackProgresses(prev => ({
          ...prev,
          [track._key]: audio.currentTime,
        }));
      } else {
        clearInterval(intervalRef.current);
      }
    };

    // Remove previous listener before adding new one to prevent duplicates
    // Note: Defining handleEnded inside means a new function instance each time.
    // The cleanup function handles removal correctly.
    audio.addEventListener('loadedmetadata', handleMetadataLoaded);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);

    const attemptPlay = () => {
      if (!isReadyRef.current || audio.src !== track.url) return;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            clearInterval(intervalRef.current);
            intervalRef.current = setInterval(updateTime, 50);
          })
          .catch(error => {
            console.error(`Error playing track ${track._key}:`, error);
            setIsPlaying(false);
            clearInterval(intervalRef.current);
          });
      }
    };

    // --- Playback and Interval Control ---
    if (isPlaying) {
      // Attempt to play the audio
      if (isReadyRef.current && audio.src === track.url) {
        attemptPlay();
      } else {
        audio.pause();
        clearInterval(intervalRef.current);
      }
    } else {
      audio.pause();
      clearInterval(intervalRef.current);
    }

    // --- Cleanup ---
    return () => {
      audio.removeEventListener('loadedmetadata', handleMetadataLoaded);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      clearInterval(intervalRef.current);
    };
  }, [currentIndex, tracks, isPlaying, trackProgresses, handleNextTrack]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  if (!tracks || !tracks.length) {
    return null;
  }

  return (
    <div className={`tracklist${isPlaying ? ' is-playing' : ''}`}>
      <h4 className="tracks-title">Tracks</h4>
      {tracks.length > 0 &&
        tracks.map((track, idx) => {
          const isCurrent = idx === currentIndex;
          const trackKey = track._key; // Stable key
          const duration = track.duration;
          const progress = trackProgresses[trackKey] || 0;

          return (
            <div key={trackKey}>
              <div
                className="track-divider"
                style={{
                  opacity: isPlaying
                    ? isCurrent || idx === currentIndex + 1
                      ? 1
                      : 0.4
                    : 1,
                }}
              />

              <TrackItem
                track={track}
                duration={duration}
                isCurrent={isCurrent}
                isPlaying={isPlaying}
                progress={progress}
                onTrackSelect={handleTrackSelect}
                index={idx}
                onSeek={handleSeek}
              />
            </div>
          );
        })}
      <div
        className="track-divider"
        style={{
          opacity: isPlaying
            ? currentIndex !== tracks.length - 1
              ? 0.4
              : 1
            : 1,
        }}
      />
    </div>
  );
}

const TrackItem = React.memo(
  ({
    track,
    duration,
    isCurrent,
    isPlaying,
    progress,
    onTrackSelect,
    index,
    onSeek,
  }) => {
    const formatDuration = seconds => {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleClick = useCallback(
      () => onTrackSelect(index),
      [onTrackSelect, index]
    );
    const handleSeekRequest = useCallback(
      time => onSeek(track._key, time),
      [onSeek, track._key]
    );

    const trackBoxClasses = `track-box${isPlaying ? (isCurrent ? '' : ' dim') : ''}`;

    return (
      <motion.div
        className={trackBoxClasses}
        initial={{ scaleX: 0.95 }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: [0.17, 0.84, 0.44, 1] }}
      >
        <button
          onClick={handleClick}
          className="play-pause-mobile"
          type="button"
        >
          {isPlaying && isCurrent ? <Pause size={16} /> : <Play size={16} />}
        </button>
        <div className="track-title">
          <h5>{track.title}</h5>
          <button onClick={handleClick} className="play-pause" type="button">
            {isPlaying && isCurrent ? 'PAUSE' : 'PLAY'}
          </button>
        </div>
        <span className="track-time">
          {progress < 1 ? formatDuration(duration) : formatDuration(progress)}
        </span>
        <AudioProgressBar
          isPlaying={isPlaying && isCurrent}
          duration={duration}
          progress={progress}
          onSeek={handleSeekRequest}
          name={track.key}
        />
      </motion.div>
    );
  }
);

TrackItem.displayName = 'TrackItem';
