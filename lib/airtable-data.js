import Airtable from 'airtable';

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

  // console.log(tracks);

  records = records.map((r) => {
    if (!r.tracks) return r;
    r.tracks = r.tracks.map((t) => {
      return tracks.filter((tt) => tt.__id === t)[0];
    });
    // console.log(r.tracks);
    return r;
  });

  // console.log(records);
  return records;
};
