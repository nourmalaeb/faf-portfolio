import { groq } from 'next-sanity';

export const projectsQuery = groq`*[_type == "project"] {
    ...,
    tracks[] {..., "url": file.asset->url },
  }
  `;
