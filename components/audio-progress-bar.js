import './audio-progress-bar.css';

export default function AudioProgressBar(props) {
  const { duration, progress, name, onSeek, isPlaying } = props;

  return (
    <input
      type="range"
      name={name}
      // style={progressStyles}
      onChange={e => {
        onSeek(e.target.value);
      }}
      defaultValue={progress}
      min={0}
      max={duration}
      step={0.01}
      className={`audio-progress-bar${isPlaying ? ' is-playing' : ''}`}
    />
  );
}
