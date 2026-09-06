import { groq } from "next-sanity";

export const allProjectsQuery = groq`*[_type == "project"] {
    ...,
    tracks[] {..., "url": asset.asset->url, "duration": asset.asset->opt.faf.duration },
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
      tracks[] {..., "url": asset.asset->url, "duration": asset.asset->opt.faf.duration },
    }
  }
`;

export const aboutPageQuery = groq`
  *[_type == "aboutPage"]`;
