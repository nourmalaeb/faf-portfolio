// import { getPageData } from '../lib/airtable-data';
import { client } from '../sanity/lib/client';
import Home from './homepage';
import { projectsQuery } from '../sanity/lib/queries';

export default async function Page() {
  // const projects = await getPageData('Projects', 'Grid view');

  const projectData = await client.fetch(projectsQuery);
  console.log(projectData);

  return <Home projects={projectData} />;
}
