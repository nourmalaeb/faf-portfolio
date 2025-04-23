'use client';

import Project from '../components/project';
import { motion } from 'motion/react';
import './homepage.css';

const HomePage = ({ data }) => {
  // console.log(projects);
  const { projects } = data[0];
  return (
    <div>
      <main style={{ position: 'relative' }}>
        <header>
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
          >
            Firas Abou Fakher
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 6, ease: [0.17, 0.84, 0.44, 1] }}
            className="tags"
          >
            <h2>Composer</h2>
            <div className="dot" />
            <h2>Producer</h2>
            <div className="dot" />
            <h2>Director</h2>
          </motion.div>
          {/* <H2 style={{ margin: `1rem 0 0 0` }}>About</H2> */}
        </header>

        <motion.div
          className="projects"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
        >
          {projects.map((item, idx) => (
            <Project project={item} key={`project-${idx}`} />
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default HomePage;
