import Airtable from 'airtable';
import { marked } from 'marked';

export const getPageData = async (table, view) => {
  const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base('appuzEhTJkIwJG9Aq');

  let records = await base(table)
    .select({
      view,
    })
    .all();

  records = records.map((r) => {
    return {
      ...r._rawJson.fields,
      __id: r.id,
    };
  });

  let tracks = await base(`Tracks`).select({ view: `Grid view` }).all();

  tracks = tracks.map((t) => {
    return {
      ...t._rawJson.fields,
      __id: t.id,
    };
  });

  records = records.map((r) => {
    r.tracks
      ? (r.tracks = r.tracks.map((t) => {
          return tracks.filter((tt) => tt.__id === t)[0];
        }))
      : null;

    r.description = marked.parse(r.description);

    return r;
  });
  
  return records;
};
