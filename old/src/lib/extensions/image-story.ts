import type { VistaData, VistaExtension } from '../types';
import type { VistaView } from '../vista-view';
import DOMPurify from 'isomorphic-dompurify';

const chevronUp = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-up-icon lucide-chevron-up"><path d="m18 15-6-6-6 6"/></svg>`;

type VistaGetStoryResult = {
  content: string;
  onLoad?: () => void;
  onUnload?: () => void;
};

function removeStory(
  currentIndex: string,
  storyCache: { [key: string]: VistaGetStoryResult },
  maxStoryCache: number
) {
  const currentIndexNum = parseInt(currentIndex, 10);
  const storyIndexes = Object.keys(storyCache).reduce(
    (acc, key) => {
      const indexNum = parseInt(key, 10);
      if (indexNum < currentIndexNum) {
        acc.before.push(key);
      } else if (indexNum > currentIndexNum) {
        acc.after.push(key);
      }
      return acc;
    },
    { before: [] as string[], after: [] as string[] }
  );

  let i = 0;
  while (storyIndexes.before.length + storyIndexes.after.length > maxStoryCache) {
    const indexToRemove =
      i % 2 === 0
        ? (storyIndexes.before.shift() ?? storyIndexes.after.pop())
        : (storyIndexes.after.pop() ?? storyIndexes.before.shift());
    i++;

    if (indexToRemove !== undefined) {
      delete storyCache[indexToRemove];
    }
  }
}

export function imageStory({
  getStory,
  maxStoryCache = 5,
}: {
  getStory: (imageIndex: number) => Promise<VistaGetStoryResult>;
  maxStoryCache?: number;
}): VistaExtension {
  let storyCache: { [key: string]: VistaGetStoryResult } = {};
  let currentIndex = '';
  let container: HTMLDivElement | null = null;
  let storyText: HTMLDivElement | null = null;
  let storyLoading: HTMLDivElement | null = null;

  return {
    name: 'imageStory',
    control: () => {
      container = document.createElement('div');
      container.classList.add('vvw-story');

      const storyContainer = document.createElement('div');
      storyContainer.classList.add('vvw-story-container');
      container.appendChild(storyContainer);

      storyText = document.createElement('div');
      storyText.classList.add('vvw-story-text');

      storyLoading = document.createElement('div');
      storyLoading.classList.add('vvw-story-loading');

      const storyButton = document.createElement('button');
      storyButton.classList.add('vvw-story-button');
      storyButton.innerHTML = chevronUp;
      storyButton.addEventListener('click', () => {
        if (storyText?.classList.contains('expanded')) {
          storyText.classList.remove('expanded');
          storyButton.classList.remove('expanded');
          storyContainer.style.removeProperty('--vvw-story-height');
        } else {
          storyText?.classList.add('expanded');
          storyButton.classList.add('expanded');
          requestAnimationFrame(() => {
            const height = storyText?.offsetHeight;
            storyContainer.style.setProperty('--vvw-story-height', `${height}px`);
          });
        }
      });

      storyContainer.appendChild(storyText);
      storyContainer.appendChild(storyButton);

      return container;
    },
    onClose(_vistaView: VistaView) {
      // cleanup
      if (currentIndex !== '') {
        const cStory = storyCache[currentIndex];
        cStory && cStory.onUnload && cStory.onUnload();
      }

      storyCache = {};
      currentIndex = '';
      container && container.remove();
      container = null;
      storyText = null;
      storyLoading = null;
    },
    onImageView: (vistaData: VistaData, _v: VistaView) => {
      const index = vistaData.index.to ?? -1;

      if (currentIndex !== '' && `${index}` !== currentIndex) {
        const previousStory = storyCache[currentIndex];
        previousStory && previousStory.onUnload && previousStory.onUnload();
      }

      if (`${index}` in storyCache) {
        const story = storyCache[`${index}`];
        storyText && (storyText.innerHTML = story.content || '');
        if (story.onLoad) story.onLoad();
      } else {
        storyText && (storyText.innerHTML = '');
        storyText && storyLoading && storyText.appendChild(storyLoading);
        getStory(index).then((story) => {
          if (story !== null) {
            story.content = DOMPurify.sanitize(story.content);
            storyCache[`${index}`] = story;
            storyText && (storyText.innerHTML = story.content || '');
            if (story.onLoad) story.onLoad();
            removeStory(`${index}`, storyCache, maxStoryCache);
          } else {
            delete storyCache[`${index}`];
          }
        });
      }
    },
  };
}
