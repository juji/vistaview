import { Title } from "@solidjs/meta";
import { For, createSignal } from "solid-js";

import "vistaview/style.css";
import { VistaView } from "vistaview/solid";
import { clientOnly } from "@solidjs/start";


const initialImages = [
  { full: "https://picsum.photos/id/1015/600/400", thumb: "https://picsum.photos/id/1015/300/200" },
  { full: "https://picsum.photos/id/1016/600/400", thumb: "https://picsum.photos/id/1016/300/200" },
  { full: "https://picsum.photos/id/1018/600/400", thumb: "https://picsum.photos/id/1018/300/200" },
  { full: "https://picsum.photos/id/1020/600/400", thumb: "https://picsum.photos/id/1020/300/200" },
  { full: "https://picsum.photos/id/1024/600/400", thumb: "https://picsum.photos/id/1024/300/200" },
  { full: "https://picsum.photos/id/1025/600/400", thumb: "https://picsum.photos/id/1025/300/200" },
];
const addition = [
  { full: "https://picsum.photos/id/0/600/400", thumb: "https://picsum.photos/id/0/300/200" },
  { full: "https://picsum.photos/id/1031/600/400", thumb: "https://picsum.photos/id/1031/300/200" },
  { full: "https://picsum.photos/id/1032/600/400", thumb: "https://picsum.photos/id/1032/300/200" },
  { full: "https://picsum.photos/id/1033/600/400", thumb: "https://picsum.photos/id/1033/300/200" },
  { full: "https://picsum.photos/id/1/600/400", thumb: "https://picsum.photos/id/1/300/200" },
  { full: "https://picsum.photos/id/1035/600/400", thumb: "https://picsum.photos/id/1035/300/200" },
];

const ClientOnlyComp = clientOnly(async () => ({ default: Home }), { lazy: true });

export default function IsomorphicComponent() {
  return <ClientOnlyComp />;
}

function Home() {
  const [images, setImages] = createSignal([...initialImages]);
  const [added, setAdded] = createSignal(false);

  const handleToggle = () => {
    if (added()) {
      setImages([...initialImages]);
      setAdded(false);
    } else {
      setImages([...initialImages, ...addition]);
      setAdded(true);
    }
  };

  return (
    <main style={{ padding: "32px" }}>
      <Title>VistaView Solid - Basic Example</Title>
      <h1>VistaView Solid - Basic Example</h1>
      <button onClick={handleToggle}>
        {added() ? "remove addition" : "add image"}
      </button>
      <VistaView class="vistaview-grid">
        <For each={images()}>{(img, i) => (
          <a href={img.full} class="vistaview-anchor">
            <img src={img.thumb} alt={`Sample ${i() + 1}`} class="vistaview-thumb" />
          </a>
        )}</For>
      </VistaView>
      <style>{`.vistaview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
        gap: 32px;
        max-width: 960px;
        margin: 32px auto 0 auto;
        align-items: stretch;
      }
      .vistaview-anchor {
        width: 100%;
        height: 200px;
        display: block;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 1px 6px 0 rgba(0,0,0,0.06);
        transition: box-shadow 0.15s;
      }
      .vistaview-anchor:hover {
        box-shadow: 0 4px 16px 0 rgba(0,0,0,0.10);
        outline: 4px solid #0051a8;
        outline-offset: 3px;
        z-index: 2;
      }
      .vistaview-thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }`}</style>
    </main>
  );
}
