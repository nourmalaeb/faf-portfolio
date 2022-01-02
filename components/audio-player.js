import React, { useState, useEffect } from 'react';
import useSound from 'use-sound';
import { useInterval } from './utils/hooks';

const Track = ({ track, playPause, isPlaying, setIsPlaying }) => {
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackTime, setTrackTime] = useState({ m: `00`, s: `00` });
  const [seeking, setSeeking] = useState(false);

  const [play, { pause, duration, sound }] = useSound(track.src, {
    onend: () => {
      setIsPlaying(false);
    },
  });

  useEffect(() => {
    setTrackTime({
      m: Math.floor((duration * 0.001) / 60)
        .toString()
        .padStart(2, `0`),
      s: Math.floor((duration * 0.001) % 60)
        .toString()
        .padStart(2, `0`),
    });
  }, [duration]);

  useEffect(() => {
    isPlaying ? play() : pause();
  }, [isPlaying]);

  useInterval(() => {
    if (isPlaying) {
      updateTrackTime();
    }
  }, 10);

  const updateTrackTime = () => {
    const prog = sound.seek();
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

  const seekStart = (e) => {
    // console.log(sound);
    isPlaying && pause();
    setSeeking(true);
    seekTrack(e, true);
  };

  const seekEnd = (e) => {
    isPlaying && play();
    seekTrack(e);
    setSeeking(false);
  };

  return (
    <div
      style={{
        position: `relative`,
        display: `grid`,
        gridTemplateColumns: `3fr 2fr`,
        gap: `0.25rem`,
      }}
    >
      <style jsx>{`
        .pp-button {
          opacity: 0;
        }

        .pp-button:hover {
          opacity: 1;
        }

        .seeker-container {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .seeker-container:hover .seeker {
          width: 1px;
          height: 100%;
          transition: all 0.075s ease;
        }

        .seeker {
          position: absolute;
          width: 2px;
          height: 0.5rem;
          background: black;
          top: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          transition: all 0.075s ease;
        }
      `}</style>
      <div
        style={{
          position: `relative`,
          display: `flex`,
          flexDirection: `row`,
          justifyContent: `space-between`,
          alignItems: `center`,
        }}
      >
        <h5>{track.title}</h5>
        <button
          type="button"
          className="pp-button"
          aria-label="play/pause"
          onClick={playPause}
          style={{
            background: `rgba(255, 255, 255, 0.9)`,
            position: `absolute`,
            top: `0`,
            left: `0`,
            width: `100%`,
            height: `100%`,
            border: `none`,
            zIndex: `2`,
            padding: `0`,
            textAlign: `center`,
            fontVariationSettings: `"wght" 600,"ital" 0,"SRFF" 50`,
          }}
        >
          {isPlaying ? `PAUSE` : `PLAY`}
        </button>
        {`${trackTime.m}:${trackTime.s}`}
      </div>
      <div
        className="seeker-container"
        // style={{ position: `relative`, width: `100%`, height: `100%` }}
        // onClick={seekTrack}
        onMouseDown={seekStart}
        onMouseMove={seekTrack}
        onMouseUp={seekEnd}
        // onMouseExit={seekEnd}
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
            // position: `absolute`,
            // width: `2px`,
            // height: `0.5rem`,
            // background: `black`,
            left: `${trackProgress * 100}%`,
            // top: `50%`,
            // transform: `translate(-50%, -50%)`,
            // pointerEvents: `none`,
          }}
        />
      </div>
    </div>
  );
};

const Tracklist = ({ tracklist }) => {
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playPause = (e, idx) => {
    if (trackIndex === idx) {
      setIsPlaying(!isPlaying);
    } else {
      setTrackIndex(idx);
      setIsPlaying(true);
    }
  };

  return (
    <div>
      {tracklist.map((track, idx) => (
        <Track
          track={track}
          key={`track-${idx}`}
          isActive={trackIndex === idx}
          isPlaying={isPlaying && trackIndex === idx}
          playPause={(e) => playPause(e, idx)}
          setIsPlaying={setIsPlaying}
        />
      ))}
    </div>
  );
};

export default Tracklist;
