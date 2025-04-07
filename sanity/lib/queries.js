import { groq } from 'next-sanity';

export const allProjectsQuery = groq`*[_type == "project"] {
    ...,
    tracks[] {..., "url": file.asset->url },
  }
  `;

export const homepageQuery = groq`
  *[_type == "homePage"] {
    ...,
    projects[]-> {
      ...,
      tracks[] {..., "url": file.asset->url },
    }
  }
`;
