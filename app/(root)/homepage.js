'use client';

import Project from '../../components/project';
import { motion } from 'motion/react';
import './homepage.css';
import Header from '../../components/header';
import { PortableTextRenderer } from '../../components/portableTextRenderer';
import ObfuscatedEmailLink from '../../components/obfuscated-email';

const HomePage = ({ data }) => {
  // console.log(projects);
  const { projects, about } = data;
  return (
    <main style={{ position: 'relative' }} className="main-container">
      <Header projects={projects} />

      <motion.div
        className="projects"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
      >
        {projects.map((item, idx) => (
          <Project project={item} key={`project-${idx}`} />
        ))}
        <section id="about">
          <h2>{about.title}</h2>
          <PortableTextRenderer value={about.content} />
        </section>
        <ObfuscatedEmailLink
          emailUser={'nourmalaeb'}
          emailDomain={'gmail.com'}
          className={'contact-link'}
        >
          Contact
        </ObfuscatedEmailLink>
      </motion.div>
    </main>
  );
};

export default HomePage;
