'use client';

import Image from 'next/image';
import Tracks from '../../components/audio-player';
import { PortableText } from '@portabletext/react';
import './project.css';
import { urlFor } from '../../sanity/lib/image';
import Details from '../../components/details';

const Project = ({ project }) => {
  // console.log(project);
  const { title, subtitle, thumbnail, description, tracks, details, tags } =
    project;
  return (
    <div className="project-container">
      <div className="thumb">
        {project.thumbnail._type.includes(`image`) && (
          <Image
            src={urlFor(thumbnail).width(1000).url()}
            alt={project.title}
            fill
          />
        )}
        {thumbnail._type.includes(`video`) && (
          <video controls playsInline>
            <source src={`${thumbnail.url}#t=0.001`} type={thumbnail.type} />
          </video>
        )}
      </div>
      <h2 className="title">{title}</h2>
      <h4 className="subtitle">{subtitle}</h4>
      <div className="project-info">
        <div>
          <PortableText value={description} />
          {/* <p style={{ fontStyle: `italic` }}>{project.date}</p> */}
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
        </div>
      </div>
      {details && details.length > 0 && <Details details={details} />}
      {tracks && <Tracks tracklist={tracks} />}
    </div>
  );
};

export default Project;
