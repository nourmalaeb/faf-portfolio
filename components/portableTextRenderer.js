import { PortableText } from 'next-sanity';
import { getImageDimensions } from '@sanity/asset-utils';
import { urlFor } from '../sanity/lib/image';

// Barebones lazy-loaded image component
const ImageComponent = ({ value, isInline }) => {
  const { width, height } = getImageDimensions(value);
  return (
    <img
      src={urlFor(value)
        .width(isInline ? 100 : 800)
        .fit('max')
        .auto('format')
        .url()}
      alt={value.alt || ' '}
      loading="lazy"
      style={{
        // Display alongside text if image appears inside a block text span
        display: isInline ? 'inline-block' : 'block',

        // Avoid jumping around with aspect-ratio CSS property
        aspectRatio: width / height,
        maxWidth: '100%',
        marginBottom: '1em',
      }}
    />
  );
};

const components = {
  types: {
    image: ImageComponent,
    // Any other custom types you have in your content
    // Examples: mapLocation, contactForm, code, featuredProjects, latestNews, etc.
  },
};

export const PortableTextRenderer = ({ value }) => {
  return <PortableText value={value} components={components} />;
};
