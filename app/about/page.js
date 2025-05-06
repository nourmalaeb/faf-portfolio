import { client } from '../../sanity/lib/client';
import { aboutPageQuery, homepageQuery } from '../../sanity/lib/queries';
import AboutPage from './aboutPage';

export default async function Page() {
  const aboutPageData = await client.fetch(aboutPageQuery);
  const homePageData = await client.fetch(homepageQuery);

  return (
    <AboutPage data={aboutPageData[0]} projects={homePageData[0].projects} />
  );
}
