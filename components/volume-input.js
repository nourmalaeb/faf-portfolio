export default function VolumeInput(props) {
  const { volume, onVolumeChange } = props;

  return (
    <input
      aria-label="volume"
      name="volume"
      type="range"
      min={0}
      step={0.05}
      max={1}
      value={volume}
      onChange={e => onVolumeChange(e.currentTarget.valueAsNumber)}
    />
  );
}
