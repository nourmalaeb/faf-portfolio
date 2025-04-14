'use client';

import Project from './project';
import './homepage.css';
import Link from 'next/link';

const HomePage = ({ data }) => {
  const { projects } = data[0];
  return (
    <div>
      <main>
        <header>
          <div className="page-title">
            <h1>Firas Abou Fakher</h1>
            <div className="tags">
              <h2>Composer</h2>
              <div className="dot" />
              <h2>Producer</h2>
              <div className="dot" />
              <h2>Director</h2>
            </div>
          </div>
          <nav>
            <ul>
              <li>
                <Link href="/">About</Link>
              </li>
              {projects.map(project => (
                <li key={project.slug.current}>
                  <Link href={`/project/${project.slug.current}`}>
                    {project.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact">Contact</Link>
              </li>
            </ul>
          </nav>
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

export default HomePage;
