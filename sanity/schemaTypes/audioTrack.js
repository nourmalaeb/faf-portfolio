export default {
  name: 'audioTrack',
  title: 'Audio Track',
  type: 'object',
  fields: [
    {
      name: 'asset',
      title: 'Audio file',
      type: 'file',
      options: { accept: 'audio/*' },
      validation: rule => rule.required(),
    },
    {
      name: 'title',
      title: 'Track title',
      type: 'string',
      validation: rule => rule.required(),
    },
    {
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      readOnly: true,
    },
  ],
};
