import Image from 'next/image';
import Tracks from './audio-player';
import { styled } from '../stiches.config';

const Project = ({ project }) => {
  const thumbnail = project.thumbnail[0];
  const { title, subtitle, description, tracks, tags } = project;
  return (
    <ProjectContainer>
      <Thumb>
        {project.thumbnail[0].type.includes(`image`) && (
          <Image
            src={thumbnail.url}
            alt={project.title}
            layout="fill"
            objectFit="contain"
          />
        )}
        {thumbnail.type.includes(`video`) && (
          <video src={thumbnail.url} controls playsInline />
        )}
      </Thumb>
      <div>
        <Title>{title}</Title>
        <Subtitle>{subtitle}</Subtitle>
        <p>{description}</p>
        {/* <p style={{ fontStyle: `italic` }}>{project.date}</p> */}
        {tracks && <Tracks tracklist={tracks} />}
      </div>
      {tags.map((tag, idx) => (
        <div key={`tag-${project.__id}-${idx}`}>{tag}</div>
      ))}
    </ProjectContainer>
  );
};

export default Project;

const ProjectContainer = styled(`div`, {
  position: `relative`,
  width: `30rem`,
  display: `flex`,
  flexDirection: `column`,
  alignItems: `center`,
  margin: `0 auto 8rem auto`,
  textAlign: `center`,
  maxWidth: `100%`,
});

const Title = styled(`h2`, {
  textTransform: `uppercase`,
  fontSize: `2rem`,
  textAlign: `center`,
  marginY: `1rem`,
});

const Subtitle = styled(`h4`, {
  fontStyle: `italic`,
  marginY: `1rem`,
});

const Thumb = styled(`div`, {
  position: `relative`,
  height: '500px',
  minHeight: `5rem`,
  maxHeight: `90vh`,
  width: `100%`,
  '& > *': {
    position: `relative`,
    height: `100%`,
    margin: `0 auto`,
  },
});
