export default {
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
    },
    {
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'array',
      of: [{ type: 'block' }],
    },
    {
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'details',
      title: 'Details',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'detail',
          fields: [
            { type: 'string', name: 'header' },
            { type: 'text', name: 'body' },
          ],
        },
      ],
    },
    {
      name: 'tracks',
      title: 'Tracks',
      type: 'array',
      of: [
        {
          type: 'audioTrack',
        },
      ],
    },
  ],
};
