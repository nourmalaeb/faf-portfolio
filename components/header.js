'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, cubicBezier } from 'motion/react';
import './header.css';
import ThemeSwitch from './theme-switch';
import ObfuscatedEmailLink from './obfuscated-email';
import { PortableTextRenderer } from './portableTextRenderer';
import { useWindowSize } from 'react-use';

const Header = ({ projects, tagline }) => {
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

  const { scrollY } = useScroll();
  const { width } = useWindowSize();
  const [fontSizeRange, setFontSizeRange] = useState(['44px', '44px']);

  useEffect(() => {
    if (width > 768) {
      setFontSizeRange([
        Math.max((11 * width) / 100, 44) + 'px',
        Math.min((3 * width) / 100, 44) + 'px',
      ]);
    } else {
      setFontSizeRange([Math.max((11 * width) / 100, 44) + 'px', '44px']);
    }
  }, [width]);

  const scrollInputRange = [1, 300]; // Increased scroll range for a smoother animation
  const fontSize = useTransform(scrollY, scrollInputRange, fontSizeRange, {
    ease: cubicBezier(0.45, 0.05, 0.55, 0.95),
  });

  return (
    <header className="main-nav">
      <div className="h1-container">
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
          style={{ fontSize }}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.history.pushState(
              '',
              document.title,
              window.location.pathname + window.location.search
            );
          }}
        >
          Firas Abou Fakher
        </motion.h1>
      </div>
      <motion.h2
        className="tagline"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
        layout
      >
        <PortableTextRenderer value={tagline} />
        {/* {toPlainText(tagline)} */}
      </motion.h2>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
      >
        <h3>Works</h3>
        <ul className="nav">
          <NavItems projects={projects} activeSlug={activeSlug} />
        </ul>
        <h3>Info</h3>
        {/* Apply active class directly to the About link */}
        <ul className="nav">
          <li>
            <a href="#about" className={activeSlug === 'about' ? 'active' : ''}>
              About
            </a>
          </li>
          <li>
            <ObfuscatedEmailLink
              emailUser={'hello'}
              emailDomain={'firasfiras.com'}
            >
              Contact
            </ObfuscatedEmailLink>
          </li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: [0.17, 0.84, 0.44, 1] }}
        className="theme-switcher"
      >
        <ThemeSwitch />
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
