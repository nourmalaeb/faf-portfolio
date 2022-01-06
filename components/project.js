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
            <video controls playsInline>
              <source src={`${thumbnail.url}#t=0.001`} type={thumbnail.type} />
            </video>
          )}
        </Thumb>

        <div>
          <div dangerouslySetInnerHTML={{ __html: description }} />
          {/* <p style={{ fontStyle: `italic` }}>{project.date}</p> */}
          <Tags>
            {tags.map((tag, idx) => (
              <>
                <Tag key={`tag-${project.__id}-${idx}`}>{tag}</Tag>
                {/* {idx + 1 < tags.length && (
                  <DotBox>
                    <Dot />
                  </DotBox>
                )} */}
              </>
            ))}
          </Tags>
        </div>
      </ProjectInfo>
      {tracks && <Tracks tracklist={tracks} />}
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
  letterSpacing: `-0.05em`,
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

const Tag = styled(`span`, {
  textTransform: `uppercase`,
  fontSize: `0.6rem`,
  letterSpacing: `0.05em`,
  fontWeight: `500`,
  padding: `0.25em 0.75em`,
  border: `0.5px solid black`,
  borderRadius: `100em`,
  marginRight: `0.25rem`,
});

const Tags = styled(`div`, {
  display: `flex`,
  flexDirection: `row`,
  alignItems: `center`,
  marginTop: `1rem`,
});

const Dot = styled(`div`, {
  width: `0.05rem`,
  height: `0.35rem`,
  background: `black`,
  transformOrigin: `center`,
  transform: `rotate(45deg)`,
});

const DotBox = styled(`div`, {
  padding: `0 0.5rem`,
});