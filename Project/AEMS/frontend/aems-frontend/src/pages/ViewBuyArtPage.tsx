import React, { useMemo, useState } from "react";
import "./ViewBuyArtPage.css";
import velvetNight from "../assets/Art/Velvet_night.jpeg";
import goldenHorizon from "../assets/Art/Golden_Horizon.jpeg";
import silentGallery from "../assets/Art/silent_gallery.jpeg";
import summerReverie from "../assets/Art/summer_reverie.jpeg";
import Tranquility from "../assets/Art/tranquility.jpeg";
import cityStreet from "../assets/Art/city_street.jpeg";
import Silence from "../assets/Art/silence.jpeg";
import beyondHorizon from "../assets/Art/beyond_horizon.jpeg";
import Balance from "../assets/Art/balance.jpeg";
import PageTopBar from "../components/PageTopBar";



type Artwork = {
  id: string;
  title: string;
  artist: string;
  price: number;
  dateCreated: string; // "YYYY-MM-DD" for sorting
  medium: string;
  dimensions: string;
  purpose: string;
  description: string;
  museumsExhibited: string[];
  image: string;
};

type CartItem = {
  id: string;
  title: string;
  artist?: string;
  price: number;
  image?: string;
  qty: number;
};

const CART_KEY = "aems_cart";

// ✅ Sample data (replace later with API/database)
const ARTWORKS: Artwork[] = [
  {
    id: "art-101",
    title: "Golden Horizon",
    artist: "Amira K.",
    price: 3200,
    dateCreated: "2022-06-14",
    medium: "Oil on canvas",
    dimensions: "24 × 36 in",
    purpose: "Explores nostalgia and memory through warm landscapes.",
    description:
      "A warm-toned landscape built with layered glazing and high-contrast highlights. The piece reflects on how memory reshapes geography over time.",
    museumsExhibited: ["The Art Institute of Chicago", "MoMA PS1 (NYC)"],
    image: goldenHorizon
      
  },
  {
    id: "art-102",
    title: "Velvet Night",
    artist: "Sofia Marin",
    price: 4600,
    dateCreated: "2023-11-19",
    medium: "Acrylic + ink",
    dimensions: "30 × 40 in",
    purpose: "Captures solitude with deep tonal gradients.",
    description:
      "A minimal nighttime panorama with ink accents and controlled acrylic bleeding. Designed to evoke calm, silence, and scale.",
    museumsExhibited: ["Tate Modern (London)"],
    image: velvetNight
      
  },
  {
    id: "art-103",
    title: "Silent Gallery",
    artist: "Marcus Lee",
    price: 1850,
    dateCreated: "2021-12-02",
    medium: "Digital print",
    dimensions: "18 × 24 in",
    purpose: "Studies positive space and museum silence.",
    description:
      "A digital composition designed like an architectural floor plan—spaces intentionally empty to highlight attention and pacing.",
    museumsExhibited: ["Museum of Contemporary Art (Chicago)"],
    image: silentGallery
      
  },

  {
    id: "art-104",
    title: "Summer Reverie",
    artist: "Alex Todd",
    price: 6680,
    dateCreated: "2019-11-06",
    medium: "Oil Pastel",
    dimensions: "24 × 36 in",
    purpose: "summer breeze admist the whispers of a poppy field",
    description:
      "luminous impressionist composition capturing a solitary figure immersed in a field of vivid red poppies. The artist employs expressive, layered brushstrokes and rich tonal contrast to create movement and depth within the landscape. The subject, viewed from behind, evokes themes of nostalgia, quiet introspection, and the fleeting nature of summer. The interplay between the crimson blooms and soft pastel garments establishes a delicate balance between vibrancy and serenity.",
    museumsExhibited: ["Musée d'Orsay (Paris),The National Gallery of Victoria"],
    image: summerReverie
      
  },
  {
    id: "art-105",
    title: "Garden of Tranquility",
    artist: "Isabella Moretti",
    price: 7890,
    dateCreated: "2024-1-12",
    medium: "Oil and Acrylic on Canvas",
    dimensions: "30 × 40 in",
    purpose: "The painting explores themes of serenity, refuge, and the restorative power of nature. It reflects the human longing for stillness amidst chaos and presents the garden as a sanctuary of light and introspection.",
    description:
      "Garden of Tranquility captures a quiet moment within an enchanted garden where golden light filters through the trees and reflects upon still waters. Through layered, expressive brushwork and a harmonious palette of verdant greens and warm amber tones, the artist evokes a sense of peace and transcendence. The presence of birds and reflective water enhances the atmosphere of movement and stillness coexisting in balance. The composition invites viewers into a contemplative space, offering both visual richness and emotional calm.",
    museumsExhibited: ["The Art Institute of Chicago, National Gallery of Victoria (Melbourne)"],
    image: Tranquility
      
  },
  {
    id: "art-106",
    title: "Echoes in the Street",
    artist: "Piotr Banak",
    price: 9930,
    dateCreated: "2024-1-12",
    medium: "Charcoal and Graphite on Textured Paper",
    dimensions: "24 × 36 in",
    purpose: "The artwork explores themes of urban solitude, anonymity, and the emotional weight of modern city life. Through the interplay of vertical shadows and reflective surfaces, the artist captures the tension between movement and stillness, presence and invisibility.",
    description:
      "Echoes in the Street presents a haunting monochromatic depiction of a city street suspended in time. Vertical shadows of towering architecture dominate the composition, while blurred figures and passing vehicles dissolve into reflective rain-soaked pavement. Through masterful control of light and shadow, the artist transforms a mundane urban intersection into a contemplative space of isolation and quiet introspection. The piece evokes cinematic noir aesthetics while confronting themes of anonymity, distance, and the silent rhythm of metropolitan existence.",
    museumsExhibited: ["Brooklyn Museum, Whitney Museum of American Art,Saatchi Gallery"],
    image: cityStreet
      
  },

  {
    id: "art-107",
    title: "Duality in Silence",
    artist: "Mona Virelli",
    price: 5330,
    dateCreated: "2020-10-1",
    medium: "Charcoal and Graphite on Textured Paper",
    dimensions: "36 × 48 in",
    purpose: "The artwork explores themes of identity, duality, and emotional introspection. It reflects the coexistence of contrasting inner states — strength and vulnerability, silence and expression — within a single human presence.",
    description:
      "Duality in Silence” presents a stylized, abstract portrait composed of overlapping facial profiles rendered in muted earth tones. The composition blends geometric structure with organic curvature, creating a harmonious tension between sharp linear elements and soft contours.The artist employs a restrained palette of beige, charcoal, terracotta, and ivory to evoke warmth and introspection. Vertical lines intersect the composition, suggesting fragmentation and reconstruction of identity.The overlapping faces symbolize layered emotions and the multiplicity of self — how external calm can conceal internal complexity. The minimalistic aesthetic and balanced asymmetry invite quiet contemplation and psychological reflection.",
    museumsExhibited: ["Museum of Contemporary Art, Chicago, Tate Modern, London, Saatchi Gallery"],
    image: Silence
      
  },

  {
    id: "art-108",
    title: "Beyond the Horizon",
    artist: "Laura Mezzi",
    price: 12520,
    dateCreated: "2024-4-6",
    medium: "Acrylic and modeling paste on canvas (3D textured impasto technique)",
    dimensions: "40 × 60 in",
    purpose: "The artwork explores themes of resilience, freedom, and the quiet courage required to navigate uncertain waters. The sailboat symbolizes human ambition and individuality against the vastness of nature.",
    description:
      "Beyond the Horizon” is a three-dimensional textured seascape that captures the movement and energy of ocean waves through sculptural brushwork. The artist uses thick layers of acrylic and modeling paste to create raised, tactile surfaces that mimic the physical rhythm of crashing water.The dramatic wave formations in the foreground contrast with the calm sailboat navigating the expansive sea, evoking a sense of determination and serenity amid turbulence. The cool palette of turquoise, navy, and ivory enhances the sense of depth and motion.The mountainous backdrop, rendered with textured white ridges, reinforces the interplay between strength and fluidity. The piece invites viewers to reflect on their own journeys through uncertainty and the quiet strength required to move forward.",
    museumsExhibited: ["The National Maritime Museum (London), Chicago, Tate Modern, London, Venice Biennale (Contemporary Pavilion)"],
    image: beyondHorizon
  },

  {
    id: "art-109",
    title: "Balance in Form",
    artist: "Armand Keller",
    price: 6400,
    dateCreated: "2022-09-18",
    medium: "Digital Ink",
    dimensions: "30 × 48 in",
    purpose: "Explores structural harmony and emotional grounding through geometric abstraction.",
    description: "A modern geometric composition built from overlapping semi-circular forms in terracotta and neutral tones. Fine linear textures contrast smooth color fields, creating visual balance between organic warmth and architectural precision.",
    museumsExhibited: ["Guggenheim Bilbao","Louisiana Museum of Modern Art (Denmark)","Museum of Contemporary Art Chicago" ],
    image: Balance
}
  
];

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function getCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function addToCart(art: Artwork) {
  const cart = getCart();
  const existing = cart.find((c) => c.id === art.id);

  if (existing) existing.qty += 1;
  else
    cart.push({
      id: art.id,
      title: art.title,
      artist: art.artist,
      price: art.price,
      image: art.image,
      qty: 1,
    });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart_updated"));
}

export default function ViewBuyArtPage() {
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState("All");
  const [sort, setSort] = useState<"newest" | "priceLow" | "priceHigh">("newest");

  const [selected, setSelected] = useState<Artwork | null>(null);
  const [toast, setToast] = useState("");

  const artists = useMemo(() => {
    const unique = Array.from(new Set(ARTWORKS.map((a) => a.artist)));
    return ["All", ...unique];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = ARTWORKS.filter((a) => {
      const matchesQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.artist.toLowerCase().includes(q) ||
        a.medium.toLowerCase().includes(q);

      const matchesArtist = artist === "All" || a.artist === artist;

      return matchesQuery && matchesArtist;
    });

    if (sort === "newest") {
      list = list.sort((a, b) => (a.dateCreated < b.dateCreated ? 1 : -1));
    } else if (sort === "priceLow") {
      list = list.sort((a, b) => a.price - b.price);
    } else if (sort === "priceHigh") {
      list = list.sort((a, b) => b.price - a.price);
    }

    return list;
  }, [query, artist, sort]);

  function onAdd(art: Artwork) {
    addToCart(art);
    setToast(`Added "${art.title}" to cart`);
    window.setTimeout(() => setToast(""), 1200);
  }

  return (
    <div className="art-page">
      <PageTopBar title="View / Buy Arts" />
      <div className="art-hero">
        <div>
          <h2>View / Buy Art</h2>
          <p className="muted">
            Explore curated works by artists. Click any piece for full details.
          </p>
        </div>

        <div className="controls">
          <input
            className="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, artist, medium…"
          />

          <select value={artist} onChange={(e) => setArtist(e.target.value)}>
            {artists.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="newest">Sort: Newest</option>
            <option value="priceLow">Sort: Price (Low → High)</option>
            <option value="priceHigh">Sort: Price (High → Low)</option>
          </select>
        </div>
      </div>

      <div className="art-grid">
        {filtered.map((art) => (
          <button
            key={art.id}
            className="art-card"
            onClick={() => setSelected(art)}
            type="button"
          >
            <div className="art-image" style={{ backgroundImage: `url(${art.image})` }} />
            <div className="art-card-body">
              <div className="art-title-row">
                <div className="art-title">{art.title}</div>
                <div className="art-price">{formatMoney(art.price)}</div>
              </div>
              <div className="art-artist muted">{art.artist}</div>
              <div className="art-meta muted">{art.medium}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <div className="modal-title">{selected.title}</div>
                <div className="muted">{selected.artist}</div>
              </div>

              <button className="icon-btn" onClick={() => setSelected(null)} aria-label="Close">
                ✕
              </button>
            </div>

            <div className="modal-content">
              <div className="modal-image" style={{ backgroundImage: `url(${selected.image})` }} />

              <div className="modal-details">
                <div className="detail-row">
                  <span className="label">Price</span>
                  <span className="value gold">{formatMoney(selected.price)}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Created</span>
                  <span className="value">{selected.dateCreated}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Medium</span>
                  <span className="value">{selected.medium}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Dimensions</span>
                  <span className="value">{selected.dimensions}</span>
                </div>

                <div className="block">
                  <div className="block-title">Purpose</div>
                  <div className="block-text muted">{selected.purpose}</div>
                </div>

                <div className="block">
                  <div className="block-title">Description</div>
                  <div className="block-text muted">{selected.description}</div>
                </div>

                <div className="block">
                  <div className="block-title">Museums Exhibited</div>
                  <ul className="museum-list">
                    {selected.museumsExhibited.map((m) => (
                      <li key={m} className="muted">
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-primary" onClick={() => onAdd(selected)}>
                    Add to cart
                  </button>
                  <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}