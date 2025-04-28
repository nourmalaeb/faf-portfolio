import { groq } from 'next-sanity';

export const allProjectsQuery = groq`*[_type == "project"] {
    ...,
    tracks[] {..., "url": asset.asset->url },
  }
  `;

export const homepageQuery = groq`
  *[_type == "homePage"] {
    ...,
    projects[]-> {
      ...,
      thumbnail {
        asset->{
          ...,
          metadata
        }
      },
      tracks[] {..., "url": asset.asset->url },
    }
  }
`;
