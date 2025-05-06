import { useEffect, useRef } from 'react';
import './audio-progress-bar.css';
import { Slider } from 'radix-ui';

export default function AudioProgressBar(props) {
  const { duration, progress, onSeek, isPlaying } = props;

  const containerRef = useRef(null);
  const hoverBarRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const containerElement = containerRef.current;
    const hoverBarElement = hoverBarRef.current;
    if (!containerElement || !hoverBarElement) return;

    const handleMouseMove = e => {
      const rect = containerElement.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const width = rect.width;

      const clampedX = Math.max(0, Math.min(x, width));

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        hoverBarElement.style.left = `${clampedX}px`;
      });
    };

    containerElement.addEventListener('mousemove', handleMouseMove);

    return () => {
      containerElement.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <Slider.Root
      className={`audio-progress-bar${isPlaying ? ' is-playing' : ''}`}
      defaultValue={0}
      value={[progress]}
      max={duration}
      step={0.01}
      onValueChange={values => onSeek(values[0])}
      ref={containerRef}
    >
      <Slider.Track className="audio-progress-track">
        <Slider.Range className="audio-progress-range" />
      </Slider.Track>
      <Slider.Thumb
        className="audio-progress-seeker"
        aria-label="Track progress"
      />
      <div className="audio-progress-hover-bar" ref={hoverBarRef} />
    </Slider.Root>
  );
}
