'use client';

import Project from '../components/project';
import LoadingAnim from '../components/loading-spinner';
import './homepage.css';

const Home = ({ projects }) => {
  // console.log(projects);
  return (
    <div>
      <main style={{ position: 'relative' }}>
        <header>
          <h1>Firas Abou Fakher</h1>
          <div className="tags">
            <h2>Composer</h2>
            <div className="dot" />
            <h2>Producer</h2>
            <div className="dot" />
            <h2>Director</h2>
          </div>
          {/* <H2 style={{ margin: `1rem 0 0 0` }}>About</H2> */}
        </header>

        <div className="projects">
          {projects.map((item, idx) => (
            <Project project={item} key={`project-${idx}`} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default Home;
