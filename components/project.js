'use client';

import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import './project.css';
import { urlFor } from '../sanity/lib/image';
import Details from './details';
import {
  cubicBezier,
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import AudioPlayer from './tracks';
import { useTheme } from 'next-themes';

const Project = ({ project }) => {
  const { title, subtitle, thumbnail, description, tracks, details, tags } =
    project;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['0vh', '50vh'],
  });
  return (
    <div className="project-container" ref={ref} id={project.slug.current}>
      <div
        className="thumb mobile-thumb"
        style={{
          height: 100 / thumbnail.asset.metadata.dimensions.aspectRatio + 'vw',
        }}
      >
        <ProjectImage thumb={thumbnail} opacity={scrollYProgress} />
      </div>
      <div
        className="thumb big-thumb"
        style={{ aspectRatio: thumbnail.asset.metadata.dimensions.aspectRatio }}
      >
        <Image
          src={urlFor(thumbnail).width(1000).url()}
          alt={''}
          fill
          className="thumb big-thumb"
        />
      </div>
      <div className="project-body">
        <h2 className="title">{title}</h2>
        {subtitle && <h3 className="subtitle">{subtitle}</h3>}
        {tags && (
          <div className="project-tags">
            {tags.map((tag, idx) =>
              tag ? (
                <span
                  className="tag font-mono"
                  key={`tag-${project.__id}-${idx}`}
                >
                  {tag}
                </span>
              ) : null
            )}
          </div>
        )}
        <div>
          <PortableText value={description} />
          {/* <p style={{ fontStyle: `italic` }}>{project.date}</p> */}
        </div>
        {details && details.length > 0 && <Details details={details} />}
        {/* {tracks && <Tracks tracklist={tracks} />} */}
        {tracks && <AudioPlayer tracks={tracks} />}
      </div>
    </div>
  );
};

export default Project;

const ProjectImage = ({ thumb, opacity }) => {
  const blur = useTransform(opacity, [0, 1], ['0px', '50px']);
  const backgroundOffset = useTransform(opacity, [0, 1], ['0vh', '-40vh']);
  const backgroundSize = useTransform(opacity, [0, 1], ['100%', '150%']);
  const backgroundUrl = urlFor(thumb).width(1000).url();
  const aspectRatio = thumb.asset.metadata.dimensions.aspectRatio;

  const [overlayOpacity, setOverlayOpacity] = useState(0.85);
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    setOverlayOpacity(resolvedTheme === 'light' ? 0.85 : 0.5);
  }, [resolvedTheme]);

  const rampedOpacity = useTransform(opacity, [0, 1], [0, 1], {
    ease: cubicBezier(0.075, 0.82, 0.165, 1),
  });
  const rampedOverlayOpacity = useTransform(
    rampedOpacity,
    [0, 1],
    [0, overlayOpacity]
  );
  const backgroundColor = useMotionTemplate`color(from var(--color-bg) srgb r g b / ${rampedOverlayOpacity})`;
  const backdropFilter = useMotionTemplate`blur(${blur})`;
  const backgroundPosition = useMotionTemplate`center ${backgroundOffset}`;

  return (
    <motion.div
      className="thumb"
      style={{
        minHeight: '100vh',
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize,
        backgroundPosition,
        backgroundRepeat: 'no-repeat',
        aspectRatio,
      }}
    >
      <div className="thumb-overlay">
        <motion.div
          style={{
            backgroundColor,
            position: 'absolute',
            inset: 0,
            backdropFilter,
          }}
          transition={{ duration: 0.5, ease: [0.17, 0.84, 0.44, 1] }}
        ></motion.div>
        <motion.div
          className="bottom-fade"
          style={{ opacity: rampedOpacity }}
        />
      </div>
    </motion.div>
  );
};
