import Head from 'next/head';
// import { items } from '../components/data';
import { getPageData } from '../lib/airtable-data';
import Project from '../components/project';
import { styled } from '../stiches.config';

const Home = ({ projects }) => {
  // console.log(projects);
  return (
    <div>
      <Head>
        <title>Firas Abou Fakher • Composer • Producer • Developer</title>
        <meta
          name="description"
          content="Firas Abou Fakher is a multi-hyphenate"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ position: 'relative' }}>
        <Header>
          <H1>Firas Abou Fakher</H1>
          <Tags>
            <H2>Composer</H2>

            <Dot />
            <H2>Producer</H2>
            <Dot />
            <H2>Director</H2>
          </Tags>
          {/* <H2 style={{ margin: `1rem 0 0 0` }}>About</H2> */}
        </Header>

        <Projects>
          {projects.map((item, idx) => (
            <Project project={item} key={`project-${idx}`} />
          ))}
        </Projects>
      </main>
    </div>
  );
};

export default Home;

const Header = styled(`header`, {
  position: `relative`,
  zIndex: `3`,
  width: `100vw`,
  padding: `3rem 0.5rem`,
  '@bp1': {
    padding: `3rem 5rem`,
  },
});

const H1 = styled(`h1`, {
  fontWeight: '100',
  fontStyle: 'normal',
  margin: `0 0 1rem 0`,
  fontSize: `4rem`,
  textTransform: `uppercase`,
  lineHeight: 0.85,
  letterSpacing: `-0.05em`,
  textAlign: `center`,
});

const Tags = styled(`div`, {
  display: `flex`,
  width: `100%`,
  justifyContent: `space-around`,
  alignItems: `center`,
  flexDirection: `column`,
  '@bp1': {
    flexDirection: `row`,
  },
});

const H2 = styled(`h2`, {
  fontWeight: '200',
  fontStyle: 'normal',
  textTransform: `uppercase`,
  lineHeight: 1,
  textAlign: `center`,
  padding: `0.25em`,
});

const Dot = styled(`div`, {
  width: `0.05rem`,
  height: `0.35rem`,
  background: `black`,
  transformOrigin: `center`,
  transform: `rotate(45deg)`,
});

const Projects = styled(`section`, {
  position: `relative`,
  padding: `1rem`,
});

export const getStaticProps = async () => {
  const projects = await getPageData('Projects', 'Grid view');
  return {
    props: {
      projects,
    },
  };
};
