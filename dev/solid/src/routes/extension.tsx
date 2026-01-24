import { clientOnly } from "@solidjs/start";
import { createSignal, createEffect, onCleanup } from 'solid-js';
import { VistaView } from 'vistaview/solid';
import 'vistaview/style.css';
import 'vistaview/styles/dark-rounded.css';
import 'vistaview/styles/extensions/image-story.css';
import styles from './extension-demo.module.css';
import { download } from 'vistaview/extensions/download';
import { imageStory } from 'vistaview/extensions/image-story';
import { logger } from 'vistaview/extensions/logger';
import { youtubeVideo, getYouTubeThumbnail } from 'vistaview/extensions/youtube-video';
import { dailymotionVideo, getDailymotionThumbnail } from 'vistaview/extensions/dailymotion-video';
import { vimeoVideo, getVimeoThumbnail } from 'vistaview/extensions/vimeo-video';
import { wistiaVideo, getWistiaThumbnail } from 'vistaview/extensions/wistia-video';
import { vidyardVideo, getVidyardThumbnail } from 'vistaview/extensions/vidyard-video';
import { streamableVideo, getStreamableThumbnail } from 'vistaview/extensions/streamable-video';
import { googleMaps, getGoogleMapsStaticImage } from 'vistaview/extensions/google-maps';
import { mapbox, getMapboxStaticImage } from 'vistaview/extensions/mapbox';
import { openStreetMap, getOpenStreetMapStaticImage } from 'vistaview/extensions/openstreetmap';
import { twitchVideo, getTwitchThumbnail } from 'vistaview/extensions/twitch-video';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'asdf';
const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'asdf';

const videoUrl = 'https://www.youtube.com/watch?v=GwJrZBe8JX4';
const thumbnailUrl = getYouTubeThumbnail(videoUrl, 'hq');

const dailimotionVideoUrl = 'https://www.dailymotion.com/video/x7xvssw';
const dailymotionThumbnailUrl = getDailymotionThumbnail(dailimotionVideoUrl);

const vimeoVideoUrl = 'https://vimeo.com/30673387';
const vimeoThumbnailUrl = getVimeoThumbnail(vimeoVideoUrl);

const wistiaVideoUrl = 'https://jujiyangasli.wistia.com/medias/5tel0p2wua';

const vidyardVideoUrl = 'https://share.vidyard.com/watch/GRJFiCEc9uSqJELta26in3';
const vidyardThumbnailUrl = getVidyardThumbnail(vidyardVideoUrl);

const streamableVideoUrl = 'https://streamable.com/0skbol';
const streamableThumbnailUrl = getStreamableThumbnail(streamableVideoUrl);

const twitchVideoUrl = 'https://www.twitch.tv/streammelody/video/2651710276';
const twitchThumbnailUrl = getTwitchThumbnail(twitchVideoUrl);

const googleMapsUrl = 'https://www.google.com/maps/@40.7128,-74.0060,15z';
const googleMapsLocation = { lat: 40.7128, lng: -74.0060, zoom: 15 };
const googleMapsThumbnail = GOOGLE_MAPS_API_KEY
  ? getGoogleMapsStaticImage(googleMapsLocation, { apiKey: GOOGLE_MAPS_API_KEY, zoom: 15 })
  : 'https://via.placeholder.com/400x300?text=Google+Maps+%28API+Key+Required%29';

const mapboxUrl = 'mapbox://-74.0060,40.7128,15';
const mapboxLocation = { lng: -74.0060, lat: 40.7128, zoom: 15 };
const mapboxThumbnail = MAPBOX_ACCESS_TOKEN
  ? getMapboxStaticImage(mapboxLocation, { accessToken: MAPBOX_ACCESS_TOKEN, zoom: 15 })
  : 'https://via.placeholder.com/400x300?text=Mapbox+%28Access+Token+Required%29';

const osmUrl = 'https://www.openstreetmap.org/#map=15/40.7128/-74.0060';
const osmLocation = { lat: 40.7128, lng: -74.0060, zoom: 15 };
const osmThumbnail = getOpenStreetMapStaticImage(osmLocation, { zoom: 15 });

const ClientOnlyComp = clientOnly(async () => ({ default: ExtensionDemo }), { lazy: true });

export default function IsomorphicComponent() {
  return <ClientOnlyComp />;
}

function ExtensionDemo() {
  const [wistiaThumb, setWistiaThumb] = createSignal('');

  const images = () => [
    ...Array.from({ length: 3 }, (_, i) => ({
      full: `https://picsum.photos/seed/${i}/800/1200`,
      thumb: `https://picsum.photos/seed/${i}/200/300`,
      srcset: `https://picsum.photos/seed/${i}/800/1200 800w, https://picsum.photos/seed/${i}/2400/3600 2400w`,
      alt: `Image ${i + 1}`,
    })),
    {
      full: videoUrl,
      thumb: thumbnailUrl,
      alt: 'YouTube Video Thumbnail',
    },
    {
      full: dailimotionVideoUrl,
      thumb: dailymotionThumbnailUrl,
      alt: 'Dailymotion Video Thumbnail',
    },
    {
      full: vimeoVideoUrl,
      thumb: vimeoThumbnailUrl,
      alt: 'Vimeo Video Thumbnail',
    },
    {
      full: wistiaVideoUrl,
      thumb: wistiaThumb(),
      alt: 'Wistia Video Thumbnail',
    },
    {
      full: vidyardVideoUrl,
      thumb: vidyardThumbnailUrl,
      alt: 'Vidyard Video Thumbnail',
    },
    {
      full: streamableVideoUrl,
      thumb: streamableThumbnailUrl,
      alt: 'Streamable Video Thumbnail',
    },
    {
      full: twitchVideoUrl,
      thumb: twitchThumbnailUrl,
      alt: 'Twitch Video Thumbnail',
    },
    {
      full: googleMapsUrl,
      thumb: googleMapsThumbnail,
      alt: 'Google Maps - New York City',
    },
    {
      full: mapboxUrl,
      thumb: mapboxThumbnail,
      alt: 'Mapbox - New York City',
    },
    {
      full: osmUrl,
      thumb: osmThumbnail,
      alt: 'OpenStreetMap - New York City',
    },
  ];

  createEffect(() => {
    let cancelled = false;
    (async () => {
      const url = await getWistiaThumbnail(wistiaVideoUrl);
      if (!cancelled) setWistiaThumb(url);
    })();
    onCleanup(() => { cancelled = true; });
  });

  return (
    <main style={{ padding: '32px' }}>
      <h1>VistaView Solid - Extension Demo</h1>
      <VistaView
        selector="> a"
        class={styles.vistaviewGrid}
        options={{
          controls: {
            topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
            bottomCenter: ['imageStory'],
          },
          extensions: [
            logger(),
            download(),
            imageStory({
              getStory: async (index) => ({
                content: `
                  <p style=\"margin-top: 0\">This is a description for image #${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <p>This is a description for image #${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <p>This is a description for image #${index + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                  <p style=\"margin-bottom: 0\">end of story.</p>
                `,
                onLoad: () => {
                  console.log(`Story for image #${index + 1} loaded.`);
                },
                onUnload: () => {
                  console.log(`Story for image #${index + 1} unloaded.`);
                },
              }),
            }),
            youtubeVideo(),
            dailymotionVideo(),
            vimeoVideo(),
            wistiaVideo(),
            vidyardVideo(),
            streamableVideo(),
            twitchVideo(),
            googleMaps({ apiKey: GOOGLE_MAPS_API_KEY, zoom: 15 }),
            mapbox({ accessToken: MAPBOX_ACCESS_TOKEN, zoom: 15, style: 'streets-v12' }),
            openStreetMap({ zoom: 15 }),
          ],
        }}
      >
        {images().map((img, i) => (
          <a
            href={img.full}
            data-vistaview-srcset={img.srcset}
            target="_blank"
            class={styles.vistaviewAnchor}
          >
            <img src={img.thumb} alt={img.alt} loading="lazy" class={styles.vistaviewThumb} />
          </a>
        ))}
      </VistaView>
      {/* CSS module handles styles */}
    </main>
  );
}
