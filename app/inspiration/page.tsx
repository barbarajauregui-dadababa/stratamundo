import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Inspiration — Strata Mundo',
  description:
    'Curated public-domain image collections for the Strata Mundo steampunk redesign.',
}

interface ImageItem {
  /** Direct image URL (must allow hot-linking). */
  src: string
  alt: string
  caption: string
  /** Where the image originally lives — credit. */
  source: string
  sourceUrl: string
  license: string
}

interface Category {
  id: string
  title: string
  blurb: string
  /** Direct image picks for this category — embedded thumbnails. */
  images: ImageItem[]
  /** Browse links: external collection-search URLs with hundreds more. */
  browse: { label: string; url: string; description: string }[]
}

const CATEGORIES: Category[] = [
  {
    id: 'balloons',
    title: 'Hot air balloons & airships',
    blurb:
      'For the mastery visualization (balloon ascending through cloud strata) and the home-page hero. 18th–19th century engravings of Montgolfier and Charlière balloons, dirigibles, and Jules-Verne-style fantasy aircraft.',
    images: [
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Early_flight_02561u_%282%29.jpg/640px-Early_flight_02561u_%282%29.jpg',
        alt: 'Early flight balloon engraving',
        caption: 'Early flight engraving — Library of Congress collection.',
        source: 'Library of Congress / Wikimedia Commons',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:Early_flight_02561u_(2).jpg',
        license: 'Public domain',
      },
      {
        src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Balloon-aerostat-Charles.jpg/640px-Balloon-aerostat-Charles.jpg',
        alt: 'Charles balloon aerostat',
        caption: "Charlière balloon (Jacques Charles, 1783).",
        source: 'Wikimedia Commons',
        sourceUrl:
          'https://commons.wikimedia.org/wiki/File:Balloon-aerostat-Charles.jpg',
        license: 'Public domain',
      },
    ],
    browse: [
      {
        label: 'PICRYL · 91 Montgolfier balloon images',
        url: 'https://picryl.com/topics/montgolfier',
        description: 'High-quality scans of period engravings.',
      },
      {
        label: 'NYPL Public Domain · "balloon" search',
        url: 'https://digitalcollections.nypl.org/search/index?utf8=%E2%9C%93&keywords=balloon&search_button=Search&publicDomainOnly=1',
        description: 'New York Public Library digital collections.',
      },
      {
        label: 'Wikimedia Commons · Category: Hot air balloons in art',
        url: 'https://commons.wikimedia.org/wiki/Category:Hot_air_balloons_in_art',
        description: 'Stable, attribution-free URLs.',
      },
      {
        label: 'PICRYL · Steampunk topic (572 images)',
        url: 'https://picryl.com/topics/steampunk',
        description: 'Broader steampunk imagery including airships.',
      },
    ],
  },
  {
    id: 'clouds',
    title: 'Clouds, atmosphere, sky strata',
    blurb:
      'Atmospheric backdrops — cloud layers, sky studies, romantic atmospheric prints. For the cloud-strata behind the balloon and ambient backgrounds throughout the app.',
    images: [],
    browse: [
      {
        label: 'PICRYL · "atmospheric" engravings',
        url: 'https://picryl.com/topics/atmospheric',
        description: 'Period atmospheric / weather illustrations.',
      },
      {
        label: 'Wikimedia · Cloud paintings & engravings',
        url: 'https://commons.wikimedia.org/wiki/Category:Paintings_of_clouds',
        description: 'Cloud studies in classical art.',
      },
      {
        label: 'Met Museum Open Access · "clouds"',
        url: 'https://www.metmuseum.org/art/collection/search#!?searchField=All&showOnly=openaccess&q=clouds',
        description: 'Free-to-use Met collection.',
      },
      {
        label: 'Internet Archive Book Images · "atmospheric"',
        url: 'https://www.flickr.com/search/?text=atmospheric&user_id=126377022%40N07',
        description: 'Flickr stream of book illustrations from the IA.',
      },
    ],
  },
  {
    id: 'gears',
    title: 'Gears, clockwork, mechanical diagrams',
    blurb:
      'Brass clockwork, pocket-watch internals, gear-train diagrams from 19th-century engineering manuals. For ornamental motifs, frame borders, and possibly a slow-turning gear in the corner.',
    images: [],
    browse: [
      {
        label: 'PICRYL · 921 Gears images',
        url: 'https://picryl.com/topics/gears',
        description: 'Engravings, photos, technical diagrams.',
      },
      {
        label: 'PICRYL · 1,602 Clockwork images',
        url: 'https://picryl.com/topics/clockwork',
        description: 'Clockwork mechanism engravings and details.',
      },
      {
        label: 'Wikimedia · Category: Clockwork mechanisms',
        url: 'https://commons.wikimedia.org/wiki/Category:Clockwork_mechanisms',
        description: 'Open-license clockwork imagery.',
      },
    ],
  },
  {
    id: 'instruments',
    title: 'Brass scientific instruments',
    blurb:
      "Sextants, compasses, orreries, astrolabes, microscopes, theodolites. For ornament, imagery in the methodology page, or the mastery dashboard's compass-rose alternative.",
    images: [],
    browse: [
      {
        label: 'PICRYL · "scientific instrument" topic',
        url: 'https://picryl.com/topics/scientific+instrument',
        description: 'Brass and copper instruments through history.',
      },
      {
        label: 'Smithsonian Open Access · scientific instruments',
        url: 'https://www.si.edu/openaccess?edan_q=scientific+instrument&edan_fq%5B0%5D=p.edanmdm.indexedstructured.online_media_type%3A%22Images%22',
        description: 'Smithsonian collections, CC0.',
      },
      {
        label: 'Met Museum Open Access · "astrolabe"',
        url: 'https://www.metmuseum.org/art/collection/search#!?searchField=All&showOnly=openaccess&q=astrolabe',
        description: 'Period astrolabes and orreries.',
      },
    ],
  },
  {
    id: 'plates',
    title: 'Botanical plates & natural history',
    blurb:
      'Hand-colored botanical illustrations, natural-history plates, period printing styles. Useful for the "tree-as-botanical-plate" alternative if we end up there, and for ornamental borders.',
    images: [],
    browse: [
      {
        label: 'Smithsonian Open Access · botanical illustrations',
        url: 'https://www.si.edu/openaccess?edan_q=botanical+illustration&edan_fq%5B0%5D=p.edanmdm.indexedstructured.online_media_type%3A%22Images%22',
        description: 'Smithsonian botanical plates, CC0.',
      },
      {
        label: 'NYPL · botanical illustration collection',
        url: 'https://digitalcollections.nypl.org/search/index?utf8=%E2%9C%93&keywords=botanical+illustration&publicDomainOnly=1',
        description: 'NYPL Public Domain collection.',
      },
      {
        label: 'BHL Flickr · Biodiversity Heritage Library',
        url: 'https://www.flickr.com/photos/biodivlibrary/',
        description: 'Hundreds of thousands of public-domain biology illustrations.',
      },
    ],
  },
  {
    id: 'engineering',
    title: 'Engineering & technical diagrams',
    blurb:
      "Cross-sections, blueprints, 19th-century engineering manual illustrations. Steam engines, pneumatic devices, mathematical apparatus. For ornamental frames and the report's diagram-plate aesthetic.",
    images: [],
    browse: [
      {
        label: 'PICRYL · steam engine engravings',
        url: 'https://picryl.com/topics/steam+engine',
        description: 'Period steam-engine technical drawings.',
      },
      {
        label: "PICRYL · 19th century engravings",
        url: 'https://picryl.com/topics/19th+century+engravings',
        description: 'General period-engraving collection.',
      },
      {
        label: "Wikimedia · Category: Engineering drawings",
        url: 'https://commons.wikimedia.org/wiki/Category:Engineering_drawings',
        description: 'Open-license technical illustrations.',
      },
      {
        label: 'Internet Archive Book Images · scientific',
        url: 'https://www.flickr.com/photos/internetarchivebookimages/',
        description: 'Massive Flickr stream of public-domain book illustrations.',
      },
    ],
  },
  {
    id: 'strata',
    title: 'Stratigraphic & geological surveys',
    blurb:
      'Literal layered-strata diagrams from 19th-century geological surveys. The brand-name resonance is direct. Useful even if we keep the balloon visualization — strata patterns are perfect ornamentation.',
    images: [],
    browse: [
      {
        label: 'PICRYL · "geological survey" topic',
        url: 'https://picryl.com/topics/geological+survey',
        description: 'Period geological survey diagrams.',
      },
      {
        label: 'PICRYL · "strata" topic',
        url: 'https://picryl.com/topics/strata',
        description: 'Direct hits on the brand-resonance keyword.',
      },
      {
        label: 'BHL · geological illustrations',
        url: 'https://www.flickr.com/search/?text=geology&user_id=61021753%40N02',
        description: 'Biodiversity Heritage Library — geological book plates.',
      },
    ],
  },
]

export default function InspirationPage() {
  return (
    <main className="flex flex-1 w-full max-w-5xl mx-auto flex-col gap-12 py-12 px-6">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Inspiration
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-stone-900">
          Steampunk image library
        </h1>
        <p className="text-lg text-stone-700 max-w-2xl">
          Public-domain image collections, organized by what we&apos;d use them for in the redesign. Click into any category — there are thousands of images across these collections, all free to use.
        </p>
        <p className="text-sm text-stone-600">
          Send back the ones you love (image filename or URL) and I&apos;ll wire them into the redesign.
        </p>
      </header>

      {CATEGORIES.map((cat) => (
        <section key={cat.id} id={cat.id} className="flex flex-col gap-4">
          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-stone-900">
              {cat.title}
            </h2>
            <p className="text-sm text-stone-600 mt-1 max-w-3xl leading-relaxed">
              {cat.blurb}
            </p>
          </div>

          {cat.images.length > 0 && (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cat.images.map((img, i) => (
                <li
                  key={i}
                  className="rounded-lg border border-stone-200 bg-white overflow-hidden flex flex-col"
                >
                  <a
                    href={img.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-stone-100"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-64 object-cover"
                    />
                  </a>
                  <div className="p-3 flex flex-col gap-1 text-sm">
                    <div className="text-stone-800">{img.caption}</div>
                    <div className="text-xs text-stone-500">
                      {img.source} · {img.license}
                    </div>
                    <a
                      href={img.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-700 underline underline-offset-2 break-all"
                    >
                      {img.sourceUrl}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="flex flex-col gap-2 mt-1">
            <div className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Browse hundreds more
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cat.browse.map((b, i) => (
                <li
                  key={i}
                  className="rounded-md border border-stone-200 bg-stone-50 p-3 flex flex-col gap-1"
                >
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-blue-700 hover:text-blue-900 underline underline-offset-2"
                  >
                    {b.label} →
                  </a>
                  <div className="text-xs text-stone-600">{b.description}</div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <footer className="text-xs text-stone-500 italic mt-2 border-t border-stone-200 pt-6">
        All collections linked here are public-domain or CC0/CC BY licensed. Click an image or browse link to see its full license terms on the source site.
      </footer>
    </main>
  )
}
