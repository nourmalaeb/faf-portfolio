'use client';

import { motion } from 'motion/react';
import './about.css';
import { PortableTextRenderer } from '../../components/portableTextRenderer';
import Header from '../../components/header';

const AboutPage = ({ data, projects }) => {
  console.log(data);
  return (
    <main className="main-container">
      <Header projects={projects} />

      <motion.div
        className="projects"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
      >
        <PortableTextRenderer value={data.content} />
      </motion.div>
    </main>
  );
};

export default AboutPage;
