import { HomeIcon } from '@sanity/icons';

// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = S =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Home Page')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('About Page')
        .icon(HomeIcon)
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
      ...S.documentTypeListItems().filter(
        listItem => !['homePage', 'aboutPage'].includes(listItem.getId())
      ),
    ]);
