import Head from 'next/head'
import Image from 'next/image';
import { items } from '../components/data';
import Tracklist from '../components/audio-player';

export default function Home() {
  // console.log(items);
  return (
    <div>
      <Head>
        <title>Firas Abou Fakher • Composer • Producer • Developer</title>
        <meta
          name="description"
          content="Firas Abou Fakher is a multi-hyphenate"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ position: 'relative' }}>
        <header style={{ position: `fixed`, zIndex: `3` }}>
          <h1
            style={{
              fontWeight: '200',
              fontStyle: 'normal',
              margin: `0 0 1rem 0`,
            }}
          >
            Firas Abou Fakher
          </h1>
          <h2>Composer</h2>
          <h2>Producer</h2>
          <h2>Director</h2>
          <h2 style={{ margin: `1rem 0 0 0` }}>About</h2>
        </header>

        <div style={{ position: `relative`, padding: `4rem 0` }}>
          {items.map((item, idx) => (
            <article
              style={{
                position: `relative`,
                width: `30rem`,
                minWidth: `500px`,
                display: 'grid',
                gridTemplateColumns: `1fr 2fr`,
                gap: `1rem`,
                margin: `0 0 8rem 0`,
                left: `${((idx + 3) % 4) * 4 + 4}rem`,
              }}
              key={`${item.id}`}
            >
              <div
                style={{
                  position: `relative`,
                  width: `100%`,
                  aspectRatio: `1`,
                }}
              >
                {item.media.type === `poster` && (
                  <Image
                    src={item.media.src}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                  />
                )}
                {item.media.type === `video` && (
                  <video src={item.media.src} style={{ width: `100%` }} />
                )}
              </div>
              <div>
                <h3>{item.title}</h3>
                <h4 style={{ fontStyle: `italic` }}>{item.subtitle}</h4>
                <p>{item.blurb}</p>
                <p style={{ fontStyle: `italic` }}>{item.date}</p>
                {item.tracklist && (
                  <div>
                    <h4>Tracklist:</h4>
                    <Tracklist tracklist={item.tracklist} />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
