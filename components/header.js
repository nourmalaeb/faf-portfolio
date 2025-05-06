import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import './header.css';

const Header = ({ projects }) => {
  const [activeSlug, setActiveSlug] = useState(null);
  const observerRef = useRef(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observerCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSlug(entry.target.id);
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    const currentObserver = observerRef.current;

    // Observe project sections
    projects.forEach(project => {
      const element = document.getElementById(project.slug.current);
      if (element) {
        currentObserver.observe(element);
      }
    });

    // Observe About section
    const aboutElement = document.getElementById('about');
    if (aboutElement) {
      currentObserver.observe(aboutElement);
    }

    return () => {
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, [projects]);

  return (
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
        transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
      >
        <h2>Works</h2>
        <ul className="nav">
          <NavItems projects={projects} activeSlug={activeSlug} />
        </ul>
        <h2>Info</h2>
        {/* Apply active class directly to the About link */}
        <a href="#about" className={activeSlug === 'about' ? 'active' : ''}>
          About
        </a>
      </motion.div>
    </header>
  );
};

const NavItems = ({ projects, activeSlug }) => {
  return projects.map(project => {
    const { slug, title } = project;
    return (
      <li
        key={slug.current}
        className={activeSlug === slug.current ? 'active' : ''}
      >
        <a href={`#${slug.current}`}>{title}</a>
      </li>
    );
  });
};

// Add styles for the active class on the standalone 'About' link if needed
// (The existing .nav li.active a rule might not apply directly)
// You might need a rule like:
// header > div > a.active { /* styles */ }
// or give the 'About' link a specific class/id for easier targeting.

export default Header;
