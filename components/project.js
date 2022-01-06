import Image from 'next/image';
import Tracks from './audio-player';
import { styled } from '../stiches.config';

const Project = ({ project }) => {
  const thumbnail = project.thumbnail[0];
  const { title, subtitle, description, tracks, tags } = project;
  return (
    <ProjectContainer>
      <Title>{title}</Title>
      <Subtitle>{subtitle}</Subtitle>
      <ProjectInfo>
        <Thumb>
          {project.thumbnail[0].type.includes(`image`) && (
            <Image
              src={thumbnail.url}
              alt={project.title}
              width={thumbnail.width}
              height={thumbnail.height}
            />
          )}
          {thumbnail.type.includes(`video`) && (
            <video>
              <source
                src={thumbnail.url}
                controls
                playsInline
                type={thumbnail.type}
              />
            </video>
          )}
        </Thumb>

        {/* <div> */}
        <div dangerouslySetInnerHTML={{ __html: description }} />
        {/* <p style={{ fontStyle: `italic` }}>{project.date}</p> */}
        {/* </div> */}
      </ProjectInfo>
      {tracks && <Tracks tracklist={tracks} />}
      {/* {tags.map((tag, idx) => (
        <div key={`tag-${project.__id}-${idx}`}>{tag}</div>
      ))} */}
    </ProjectContainer>
  );
};

export default Project;

const ProjectContainer = styled(`div`, {
  position: `relative`,
  width: `30rem`,
  display: `flex`,
  flexDirection: `column`,
  alignItems: `stretch`,
  margin: `4rem auto 8rem auto`,
  maxWidth: `100%`,
});

const ProjectInfo = styled(`div`, {
  display: `grid`,
  gridTemplateColumns: `1fr`,
  gap: `1rem`,
  '@bp1': {
    gridTemplateColumns: `1fr 3fr`,
  },
  '& p': {
    marginBottom: `0.5rem`,
  },
});

const Title = styled(`h2`, {
  textTransform: `uppercase`,
  fontSize: `2rem`,
  textAlign: `center`,
});

const Subtitle = styled(`h4`, {
  fontStyle: `italic`,
  marginBottom: `1rem`,
  textAlign: `center`,
});

const Thumb = styled(`div`, {
  position: `relative`,
  width: `100%`,
  '& > *': {
    position: `relative`,
  },
});
