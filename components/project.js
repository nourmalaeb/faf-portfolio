'use client';

import Image from 'next/image';
import Tracks from './audio-player';
import './project.css';

const Project = ({ project }) => {
  const thumbnail = project.thumbnail[0];
  const { title, subtitle, description, tracks, tags } = project;
  return (
    <div className="project-container">
      <h2 className="title">{title}</h2>
      <h4 className="subtitle">{subtitle}</h4>
      <div className="project-info">
        <div className="thumb">
          {project.thumbnail[0].type.includes(`image`) && (
            <Image
              src={thumbnail.url}
              alt={project.title}
              width={thumbnail.width}
              height={thumbnail.height}
            />
          )}
          {thumbnail.type.includes(`video`) && (
            <video controls playsInline>
              <source src={`${thumbnail.url}#t=0.001`} type={thumbnail.type} />
            </video>
          )}
        </div>

        <div>
          <div dangerouslySetInnerHTML={{ __html: description }} />
          {/* <p style={{ fontStyle: `italic` }}>{project.date}</p> */}
          <div className="project-tags">
            {tags.map((tag, idx) => (
              <span className="tag" key={`tag-${project.__id}-${idx}`}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
      {tracks && <Tracks tracklist={tracks} />}
    </div>
  );
};

export default Project;
