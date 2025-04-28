import React, { useCallback, useEffect, useRef, useState } from 'react';
import VolumeInput from './volume-input';
import AudioProgressBar from './audio-progress-bar';
import './tracks.css';

export default function AudioPlayer({ tracks }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [trackProgresses, setTrackProgresses] = useState({});

  const audioRef = useRef(null);

  // initialize audio component on mount
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    audio.volume = volume;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Handle track selection change
  useEffect(() => {
    if (currentIndex >= 0 && tracks.length > currentIndex) {
      const audio = audioRef.current;
      if (!audio) return;

      const track = tracks[currentIndex];
      audio.src = track.url;

      // Set up event listeners
      const updateTime = () => {
        setTrackProgresses(prev => ({
          ...prev,
          [track._key]: audio.currentTime,
        }));
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setTrackProgresses(prev => ({
          ...prev,
          [track._key]: 0,
        }));
      };

      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', handleEnded);

      if (isPlaying) {
        audio.play().catch(err => {
          console.error('Failed to play audio:', err);
          setIsPlaying(false);
        });
      }

      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [currentIndex, tracks, isPlaying]);

  // Update audio volume when volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle track selection
  const handleTrackSelect = useCallback(
    index => {
      if (index === currentIndex) {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          audio
            .play()
            .catch(err => console.error('Failed to play audio:', err));
          setIsPlaying(true);
        }
      } else {
        setCurrentIndex(index);
        setIsPlaying(true);
      }
    },
    [currentIndex, isPlaying]
  );

  // Handle seeking
  const handleSeek = useCallback(
    (trackKey, time) => {
      const trackIndex = tracks.findIndex(t => t._key === trackKey);
      if (trackIndex === -1) return;

      const audio = audioRef.current;
      if (!audio) return;

      if (trackIndex !== currentIndex) return;

      audio.currentTime = time;
      setTrackProgresses(prev => ({
        ...prev,
        [trackKey]: time,
      }));
    },
    [tracks, currentIndex]
  );

  // Handle previous track
  const handlePrevTrack = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  // Handle next track
  const handleNextTrack = useCallback(() => {
    if (currentIndex < tracks.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  }, [currentIndex, tracks.length]);

  if (!tracks || !tracks.length) {
    return null;
  }

  return (
    <div className={`tracklist${isPlaying ? ' is-playing' : ''}`}>
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
      [onSeek, index]
    );

    const trackBoxClasses = `track-box${isPlaying ? (isCurrent ? '' : ' dim') : ''}`;

    return (
      <div className={trackBoxClasses}>
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
      </div>
    );
  }
);

TrackItem.displayName = 'TrackItem';
