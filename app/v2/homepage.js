'use client';

import Project from './project';
import './homepage.css';
import { Accordion } from 'radix-ui';
import { useEffect, useRef, useState } from 'react';

const HomePage = ({ data }) => {
  const itemRefs = useRef([]);
  const [clickedValue, setClickedValue] = useState(null);
  // console.log(projects);
  const { projects } = data[0];

  // Scroll to the opened item
  const handleValueChange = values => {
    // Check which item was just opened
    const index = values.findIndex(value => value === clickedValue);
    if (index !== -1 && itemRefs.current[index]) {
      itemRefs.current[index].scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

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

        <Accordion.Root
          type="multiple"
          collapsible="true"
          className="projects"
          onValueChange={handleValueChange}
        >
          {projects.map((item, idx) => (
            <Project
              project={item}
              key={`project-${idx}`}
              ref={el => (itemRefs.current[idx] = el)}
              onClick={() => setClickedValue(item._id)}
            />
          ))}
        </Accordion.Root>
      </main>
    </div>
  );
};

export default HomePage;
