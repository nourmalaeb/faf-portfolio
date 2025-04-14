import { client } from '../../sanity/lib/client';
import { homepageQuery } from '../../sanity/lib/queries';
import HomePage from './homepage';

export default async function Page() {
  const homePageData = await client.fetch(homepageQuery);

  // console.log(homePageData);

  return <HomePage data={homePageData} />;
}
