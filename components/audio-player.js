'use client';

import React, { useState, useEffect } from 'react';
import useSound from 'use-sound';
import { useInterval } from './utils/hooks';
import './audio-player.css';
import LoadingAnim from './loading-spinner';

const Track = ({
  track,
  playPause,
  isPlaying,
  nonePlaying,
  setIsPlaying,
  incrementIndex,
}) => {
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackTime, setTrackTime] = useState({ m: `00`, s: `00` });
  const [seeking, setSeeking] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const trackSrc = track.url;
  const trackTitle = track.title;

  const [play, { pause, duration, sound }] = useSound(trackSrc, {
    onend: () => {
      setIsPlaying(false);
      incrementIndex();
      setTrackProgress(0);
      resetTrackTime();
    },
    onload: () => {
      setLoaded(true);
    },
    html5: true,
    // interrupt: true,
  });

  const resetTrackTime = () => {
    setTrackTime({
      m: Math.floor((duration * 0.001) / 60)
        .toString()
        .padStart(2, `0`),
      s: Math.floor((duration * 0.001) % 60)
        .toString()
        .padStart(2, `0`),
    });
  };

  const updateTrackTime = () => {
    const prog = sound.seek();
    // console.log(prog);
    setTrackProgress((prog * 1000) / duration);
    const mins = Math.floor(prog / 60);
    const secs = Math.floor(prog % 60);
    setTrackTime({
      m: mins.toString().padStart(2, `0`),
      s: secs.toString().padStart(2, `0`),
    });
  };

  const seekTrack = (e, forceSeek) => {
    if (seeking || forceSeek) {
      const seekto =
        (duration * e.nativeEvent.offsetX * 0.001) /
        e.target.getBoundingClientRect().width;
      sound.seek(seekto);
      updateTrackTime();
    }
  };

  const seekStart = e => {
    isPlaying && pause();
    setSeeking(true);
    seekTrack(e, true);
  };

  const seekEnd = e => {
    isPlaying && play();
    seekTrack(e);
    setSeeking(false);
  };

  useEffect(() => {
    resetTrackTime();
  }, [duration]);

  useEffect(() => {
    isPlaying ? play() : pause();
  }, [isPlaying]);

  useInterval(() => {
    if (isPlaying) {
      updateTrackTime();
    } else if (trackProgress > 0.999) {
      resetTrackTime();
    }
  }, 10);

  return (
    <>
      <div
        className="track-divider"
        style={{ opacity: isPlaying ? 0.5 : nonePlaying ? 1 : 0.5 }}
      />
      <div
        className="track-box"
        style={{ opacity: isPlaying ? 1 : nonePlaying ? 1 : 0.5 }}
      >
        <div className="track-title">
          <h5>{trackTitle}</h5>
          <button
            className="play-pause"
            type="button"
            aria-label="play/pause"
            onClick={playPause}
            // style={{ opacity: isPlaying ? 0.5 : 0 }}
          >
            {isPlaying ? `PAUSE` : `PLAY`}
          </button>
        </div>
        {loaded ? (
          <span className="track-time">{`${trackTime.m}:${trackTime.s}`}</span>
        ) : (
          <LoadingAnim />
        )}
        <div
          className="seeker-box seeker-container"
          onPointerDown={seekStart}
          onPointerMove={seekTrack}
          onPointerUp={seekEnd}
        >
          <div
            style={{
              position: `absolute`,
              width: `100%`,
              height: `1.5px`,
              background: `black`,
              left: `0`,
              top: `50%`,
              transform: `translateY(-50%)`,
            }}
          />
          <div
            className="seeker"
            style={{
              left: `${trackProgress * 100}%`,
            }}
          />
        </div>
      </div>
    </>
  );
};

const Tracks = ({ tracklist }) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playPause = (e, i) => {
    if (trackIndex === i) {
      setIsPlaying(!isPlaying);
    } else {
      setTrackIndex(i);
      setIsPlaying(true);
    }
  };

  const incrementIndex = i => {
    if (i < tracklist.length) {
      setTrackIndex(i + 1);
      setIsPlaying(true);
    } else {
      setTrackIndex(0);
      setIsPlaying(false);
    }
  };

  return (
    <div className="tracklist">
      <h3 className="h3">Tracks</h3>
      {tracklist.map((track, idx) => (
        <Track
          track={track}
          key={track._key}
          isActive={trackIndex === idx}
          isPlaying={isPlaying && trackIndex === idx}
          nonePlaying={!isPlaying}
          playPause={e => playPause(e, idx)}
          setIsPlaying={setIsPlaying}
          incrementIndex={() => incrementIndex(idx)}
        />
      ))}
      <div className="track-divider" style={{ opacity: isPlaying ? 0.3 : 1 }} />
    </div>
  );
};

export default Tracks;
