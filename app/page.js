import { client } from '../sanity/lib/client';
import { aboutPageQuery, homepageQuery } from '../sanity/lib/queries';
import HomePage from './homepage';

export default async function Page() {
  const homePageData = await client.fetch(homepageQuery);
  const aboutPageData = await client.fetch(aboutPageQuery);

  const data = { projects: homePageData[0].projects, about: aboutPageData[0] };

  return <HomePage data={data} />;
}
