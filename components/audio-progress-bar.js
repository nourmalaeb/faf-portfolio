import './audio-progress-bar.css';
import { Slider } from 'radix-ui';

export default function AudioProgressBar(props) {
  const { duration, progress, onSeek, isPlaying } = props;

  return (
    <Slider.Root
      className={`audio-progress-bar${isPlaying ? ' is-playing' : ''}`}
      defaultValue={0}
      value={[progress]}
      max={duration}
      step={0.01}
      onValueChange={values => onSeek(values[0])}
    >
      <Slider.Track className="audio-progress-track">
        <Slider.Range className="audio-progress-range" />
      </Slider.Track>
      <Slider.Thumb
        className="audio-progress-seeker"
        aria-label="Track progress"
      />
    </Slider.Root>
  );
}
