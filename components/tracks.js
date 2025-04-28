import { useCallback, useEffect, useRef, useState } from 'react';
import VolumeInput from './volume-input';
import AudioProgressBar from './audio-progress-bar';
import './tracks.css';

export default function AudioPlayer({ tracks }) {
  if (!tracks || !tracks.length) {
    return null;
  }

  // console.log(tracks);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [trackDurations, setTrackDurations] = useState({});
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

  // Load durations for all tracks
  useEffect(() => {
    const loadDuration = async track => {
      const audio = new Audio();
      return new Promise(resolve => {
        audio.src = track.mp3;
        audio.addEventListener('loadedmetadata', () => {
          resolve(audio.duration);
        });
        audio.addEventListener('error', () => {
          resolve(0);
        });
      });
    };

    const loadAllDurations = async () => {
      const durations = {};
      for (const track of tracks) {
        const duration = await loadDuration(track);
        durations[track._key] = duration;
      }
      setTrackDurations(durations);
    };

    loadAllDurations();
  }, [tracks]);

  // Handle track selection change
  useEffect(() => {
    if (currentIndex >= 0 && tracks.length > currentIndex) {
      const audio = audioRef.current;
      if (!audio) return;

      const track = tracks[currentIndex];
      audio.src = track.ogg;

      // Set up event listeners
      const updateTime = () => {
        setCurrentTime(audio.currentTime);
        setTrackProgresses(prev => ({
          ...prev,
          [track._key]: audio.currentTime,
        }));
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
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

  // console.log(trackDurations);

  return (
    <div className="tracklist">
      {tracks.length > 0 &&
        tracks.map((track, idx) => (
          <TrackItem
            track={{ ...track, duration: trackDurations[track._key] || 0 }}
            isActive={isPlaying}
            isPlaying={isPlaying && idx === currentIndex}
            isLastTrack={idx === tracks.length - 1}
            progress={trackProgresses[track._key] || 0}
            onClick={() => handleTrackSelect(idx)}
            onSeek={time => handleSeek(track._key, time)}
            key={track._key}
          />
        ))}
    </div>
  );
}

const TrackItem = ({
  track,
  isActive,
  isPlaying,
  progress,
  onClick,
  onSeek,
  isLastTrack,
}) => {
  const formatDuration = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div
        className="track-divider"
        style={{
          opacity: isPlaying ? 1 : isActive ? 0.4 : 1,
        }}
      />
      <div
        className="track-box"
        style={{
          opacity: isPlaying ? 1 : isActive ? 0.4 : 1,
        }}
      >
        <div className="track-title">
          <h5>{track.title}</h5>
          <button onClick={onClick} className="play-pause" type="button">
            {isPlaying ? 'PAUSE' : 'PLAY'}
          </button>
        </div>
        <span className="track-time">
          {progress < 1
            ? formatDuration(track.duration)
            : formatDuration(progress)}
        </span>
        <AudioProgressBar
          isPlaying={isPlaying}
          duration={track.duration}
          progress={progress}
          onSeek={onSeek}
          name={track.key}
        />
      </div>
      <div
        className="track-divider"
        style={{
          opacity: isPlaying ? 1 : isActive ? 0 : isLastTrack ? 1 : 0,
        }}
      />
    </>
  );
};
