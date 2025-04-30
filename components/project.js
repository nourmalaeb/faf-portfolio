'use client';

import Image from 'next/image';
import { PortableText } from '@portabletext/react';
import './project.css';
import { urlFor } from '../sanity/lib/image';
import Details from './details';
import { Blurhash } from 'react-blurhash';
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'motion/react';
import { useRef, useState } from 'react';
import { cubicBezier } from 'motion';
import AudioPlayer from './tracks';

const Project = ({ project }) => {
  const { title, subtitle, thumbnail, description, tracks, details, tags } =
    project;
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['0vh', '50vh'],
  });
  return (
    <div className="project-container" ref={ref}>
      <div
        className="thumb mobile-thumb"
        style={{
          marginBottom: `-${100 * thumbnail.asset.metadata.dimensions.aspectRatio}vw`,
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
        <div className="project-info">
          <div>
            <PortableText value={description} />
            {/* <p style={{ fontStyle: `italic` }}>{project.date}</p> */}
            {tags && (
              <div className="project-tags">
                {tags.map((tag, idx) => (
                  <span
                    className="tag font-mono"
                    key={`tag-${project.__id}-${idx}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
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
  // // parallax
  const blur = useTransform(opacity, [0, 1], ['0px', '30px']);
  const filter = useMotionTemplate`blur(${blur})`;
  const backgroundSize = useTransform(opacity, [0, 1], ['100%', '150%']);
  const backgroundUrl = urlFor(thumb).width(1000).url();
  const aspectRatio = thumb.asset.metadata.dimensions.aspectRatio;
  return (
    <motion.div
      className="thumb"
      style={{
        // boxShadow: `0 0 30px -5px ${thumbnail.asset.metadata.palette.darkVibrant.background}`,
        filter,
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize,
        backgroundPosition: 'top center',
        backgroundRepeat: 'no-repeat',
        aspectRatio,
      }}
    >
      {/* <Image src={urlFor(thumb).width(1000).url()} alt={''} fill /> */}
      <div className="thumb-overlay">
        <motion.div
          className="blurhash"
          style={{ opacity }}
          transition={{ duration: 0.5, ease: [0.17, 0.84, 0.44, 1] }}
        >
          <Blurhash
            hash={thumb.asset.metadata.blurHash}
            width={`calc(100%)`}
            height={`calc(100%)`}
          />
        </motion.div>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.5,
          }}
        >
          <motion.div
            style={{
              opacity: opacity,
              background: 'black',
              position: 'absolute',
              inset: 0,
            }}
            transition={{ duration: 0.5, ease: [0.17, 0.84, 0.44, 1] }}
          ></motion.div>
        </div>
      </div>
    </motion.div>
  );
};
