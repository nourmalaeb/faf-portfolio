import { groq } from 'next-sanity';

export const allProjectsQuery = groq`*[_type == "project"] {
    ...,
    tracks[] {..., "mp3": mp3.asset->url, "ogg": ogg.asset->url },
  }
  `;

export const homepageQuery = groq`
  *[_type == "homePage"] {
    ...,
    projects[]-> {
      ...,
      tracks[] {..., "mp3": mp3.asset->url, "ogg": ogg.asset->url },
    }
  }
`;
