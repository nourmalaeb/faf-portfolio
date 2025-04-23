'use client';

import Image from 'next/image';
import Tracks from './audio-player';
import { PortableText } from '@portabletext/react';
import './project.css';
import { urlFor } from '../sanity/lib/image';
import Details from './details';
import { Blurhash } from 'react-blurhash';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { cubicBezier } from 'motion';

const Project = ({ project }) => {
  const { title, subtitle, thumbnail, description, tracks, details, tags } =
    project;
  return (
    <div className="project-container">
      <ProjectImage thumb={thumbnail} />
      <div className="project-body">
        <h2 className="title">{title}</h2>
        <h4 className="subtitle">{subtitle}</h4>
        <div className="project-info">
          <div>
            <PortableText value={description} />
            {/* <p style={{ fontStyle: `italic` }}>{project.date}</p> */}
            <div className="project-tags">
              {tags &&
                tags.map((tag, idx) => (
                  <span
                    className="tag font-mono"
                    key={`tag-${project.__id}-${idx}`}
                  >
                    {tag}
                  </span>
                ))}
            </div>
          </div>
        </div>
        {details && details.length > 0 && <Details details={details} />}
        {tracks && <Tracks tracklist={tracks} />}
      </div>
    </div>
  );
};

export default Project;

const ProjectImage = ({ thumb }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // parallax
  const y = useTransform(scrollYProgress, [0, 1], [0, 10], {
    ease: cubicBezier(0.17, 0.67, 0.83, 0.67),
  });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1], {
    ease: cubicBezier(0.17, 0.67, 0.83, 0.67),
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.2], {
    ease: cubicBezier(0.17, 0.67, 0.83, 0.67),
  });
  const scale2 = useTransform(scrollYProgress, [0, 1], [0, 1.7], {
    ease: cubicBezier(0.17, 0.67, 0.83, 0.67),
  });
  const opacity2 = useTransform(scrollYProgress, [0.5, 1], [0, 1], {
    ease: cubicBezier(0.17, 0.67, 0.83, 0.67),
  });
  return (
    <motion.div
      transition={{ duration: 0.5, ease: [0.17, 0.84, 0.44, 1] }}
      className="thumb"
      style={{
        // boxShadow: `0 0 30px -5px ${thumbnail.asset.metadata.palette.darkVibrant.background}`,
        aspectRatio: thumb.asset.metadata.dimensions.aspectRatio,
        y,
        opacity,
        scale,
      }}
      ref={ref}
    >
      <motion.div className="blurhash" style={{ scale, opacity }}>
        <Blurhash
          hash={thumb.asset.metadata.blurHash}
          width={`calc(100%)`}
          height={`calc(100%)`}
        />
      </motion.div>
      <Image src={urlFor(thumb).width(1000).url()} alt={''} fill />
      {/* {thumbnail._type.includes(`video`) && (
          <video controls playsInline>
          <source src={`${thumbnail.url}#t=0.001`} type={thumbnail.type} />
          </video>
          )} */}
    </motion.div>
  );
};
