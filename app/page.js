import { getPageData } from '../lib/airtable-data';
import Home from './homepage';

export default async function Page() {
  const projects = await getPageData('Projects', 'Grid view');

  return <Home projects={projects} />;
}
