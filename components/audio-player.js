import React, { useState, useEffect } from 'react';
import useSound from 'use-sound';
import { useInterval } from './utils/hooks';
import { styled } from '../stiches.config';

const Loader = styled('div', {
  width: `100px`,
  height: `20px`,
  position: `relative`,
  '& svg': {
    position: `absolute`,
    width: `100%`,
    height: `100%`,
  },
});

const LoadingAnim = () => (
  <Loader>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid"
    >
      <circle cx="84" cy="50" r="10" fill="#353535">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="1s"
          calcMode="spline"
          keyTimes="0;1"
          values="10;0"
          keySplines="0 0.5 0.5 1"
          begin="0s"
        ></animate>
        <animate
          attributeName="fill"
          repeatCount="indefinite"
          dur="4s"
          calcMode="discrete"
          keyTimes="0;0.25;0.5;0.75;1"
          values="#353535;#d4d4d4;#9b9b9b;#666666;#353535"
          begin="0s"
        ></animate>
      </circle>
      <circle cx="16" cy="50" r="10" fill="#353535">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="0s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="0s"
        ></animate>
      </circle>
      <circle cx="50" cy="50" r="10" fill="#666666">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-1s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-1s"
        ></animate>
      </circle>
      <circle cx="84" cy="50" r="10" fill="#9b9b9b">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-2s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-2s"
        ></animate>
      </circle>
      <circle cx="16" cy="50" r="10" fill="#d4d4d4">
        <animate
          attributeName="r"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="0;0;10;10;10"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-3s"
        ></animate>
        <animate
          attributeName="cx"
          repeatCount="indefinite"
          dur="4s"
          calcMode="spline"
          keyTimes="0;0.25;0.5;0.75;1"
          values="16;16;16;50;84"
          keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
          begin="-3s"
        ></animate>
      </circle>
    </svg>
  </Loader>
);

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

  const trackSrc = track.file[0].url;
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
    isPlaying && pause();
    setSeeking(true);
    seekTrack(e, true);
  };

  const seekEnd = (e) => {
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
    }
  }, 10);

  return (
    <>
      <TrackDivider
        css={{ opacity: isPlaying ? 0.5 : nonePlaying ? 1 : 0.5 }}
      />
      <TrackBox css={{ opacity: isPlaying ? 1 : nonePlaying ? 1 : 0.5 }}>
        <TrackTitle>
          <h5>{trackTitle}</h5>
          <PlayPause
            type="button"
            aria-label="play/pause"
            onClick={playPause}
            // css={{ opacity: isPlaying ? 0.5 : 0 }}
          >
            {isPlaying ? `PAUSE` : `PLAY`}
          </PlayPause>
          {loaded ? `${trackTime.m}:${trackTime.s}` : <LoadingAnim />}
        </TrackTitle>
        <SeekerBox
          className="seeker-container"
          onMouseDown={seekStart}
          onMouseMove={seekTrack}
          onMouseUp={seekEnd}
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
          <Seeker
            css={{
              left: `${trackProgress * 100}%`,
            }}
          />
        </SeekerBox>
      </TrackBox>
    </>
  );
};

const TrackBox = styled(`div`, {
  position: `relative`,
  display: `grid`,
  gridTemplateColumns: `3fr 2fr`,
  gap: `0.5rem`,
  transition: `opacity 0.2s ease`,
  '&:hover': {
    opacity: 1,
  },
});

const TrackTitle = styled(`div`, {
  position: `relative`,
  display: `flex`,
  flexDirection: `row`,
  justifyContent: `space-between`,
  alignItems: `center`,
  paddingY: `0.25rem`,
});

const PlayPause = styled(`button`, {
  background: `rgba(255, 255, 255, 0.9)`,
  position: `absolute`,
  top: `0`,
  left: `0`,
  width: `100%`,
  height: `100%`,
  border: `none`,
  zIndex: `2`,
  padding: `0.25rem 0`,
  textAlign: `center`,
  opacity: 0,
  transition: `opacity 0.1s ease`,
  color: `black`,
  '&:hover': {
    opacity: 1,
  },
});

const Seeker = styled(`div`, {
  position: `absolute`,
  width: `2px`,
  height: `0.5rem`,
  background: `black`,
  top: `50%`,
  transform: `translate(-50%, -50%)`,
  pointerEvents: `none`,
  transition: `all 0.075s ease`,
});

const SeekerBox = styled(`div`, {
  position: `relative`,
  width: `100%`,
  height: `100%`,
  [`&:hover ${Seeker}`]: {
    width: `1px`,
    height: `100%`,
    transition: `all 0.075s ease`,
  },
});

const TrackDivider = styled(`div`, {
  width: `100%`,
  height: 0,
  borderTop: `0.25px solid black`,
});

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

  const incrementIndex = (i) => {
    if (i < tracklist.length) {
      setTrackIndex(i + 1);
      setIsPlaying(true);
    } else {
      setTrackIndex(0);
      setIsPlaying(false);
    }
  };

  return (
    <Tracklist>
      <H3>Tracks</H3>
      {tracklist.map((track, idx) => (
        <Track
          track={track}
          key={track.__id}
          isActive={trackIndex === idx}
          isPlaying={isPlaying && trackIndex === idx}
          nonePlaying={!isPlaying}
          playPause={(e) => playPause(e, idx)}
          setIsPlaying={setIsPlaying}
          incrementIndex={() => incrementIndex(idx)}
        />
      ))}
      <TrackDivider css={{ opacity: isPlaying ? 0.3 : 1 }} />
    </Tracklist>
  );
};

export default Tracks;

const Tracklist = styled(`div`, {
  marginY: `2rem`,
});

const H3 = styled(`h3`, {
  marginBottom: `0.5rem`,
});