/* All copy below is original to this concept. Photos are openly licensed (see CREDITS). */

export type EditionKey = "classic" | "red" | "blue" | "yellow";

export type Edition = {
  key: EditionKey;
  code: string; // RED BULL.01
  name: string; // Energy Drink
  colLabel: string; // middle column label (Signature / Edition)
  colValue: string;
  flavor: string;
  desc: string;
  dot: string;
  tint: string;
  img: string;
  stats: [string, string, string][]; // value, unit, label
};

export const EDITIONS: Edition[] = [
  {
    key: "classic",
    code: "Red Bull.01",
    name: "Energy Drink",
    colLabel: "Signature",
    colValue: "Original",
    flavor: "The original formula",
    desc: "The one that started it. Sweet, faintly tart, and unchanged since the first slim can left a small office by an Austrian lake.",
    dot: "#2b3fc4",
    tint: "#d9ddef",
    img: "/img/cans/classic.webp",
    stats: [
      ["80", "mg", "Caffeine"],
      ["1,000", "mg", "Taurine"],
      ["27", "g", "Sugars"],
      ["250", "ml", "Volume"],
    ],
  },
  {
    key: "red",
    code: "Red Bull.02",
    name: "Red Edition",
    colLabel: "Edition",
    colValue: "Red",
    flavor: "Watermelon",
    desc: "Bright, juicy and a little sharp at the finish. The same formula in its summer colour, for long afternoons that run late.",
    dot: "#cc0a3c",
    tint: "#f1d5d0",
    img: "/img/cans/red.webp",
    stats: [
      ["80", "mg", "Caffeine"],
      ["1,000", "mg", "Taurine"],
      ["26", "g", "Sugars"],
      ["250", "ml", "Volume"],
    ],
  },
  {
    key: "blue",
    code: "Red Bull.03",
    name: "Blue Edition",
    colLabel: "Edition",
    colValue: "Blue",
    flavor: "Blueberry",
    desc: "Darker fruit with softer edges, quieter on the palate. For evenings that need a second wind rather than a first one.",
    dot: "#2b3fc4",
    tint: "#d8dcf3",
    img: "/img/cans/blue.webp",
    stats: [
      ["80", "mg", "Caffeine"],
      ["1,000", "mg", "Taurine"],
      ["26", "g", "Sugars"],
      ["250", "ml", "Volume"],
    ],
  },
  {
    key: "yellow",
    code: "Red Bull.04",
    name: "Yellow Edition",
    colLabel: "Edition",
    colValue: "Yellow",
    flavor: "Tropical fruits",
    desc: "Passion fruit and pineapple, about as loud as the can it comes in. Best served very cold, somewhere with a view.",
    dot: "#d9a800",
    tint: "#f3ebcb",
    img: "/img/cans/yellow.webp",
    stats: [
      ["80", "mg", "Caffeine"],
      ["1,000", "mg", "Taurine"],
      ["27", "g", "Sugars"],
      ["250", "ml", "Volume"],
    ],
  },
];

export type Ingredient = {
  name: string;
  mega: [string, string];
  sci: string;
  desc: string;
  source: string;
  role: string;
  dose: string;
  unit: string;
};

export const INGREDIENTS: Ingredient[] = [
  {
    name: "Caffeine",
    mega: ["Caff-", "eine"],
    sci: "1,3,7-trimethylxanthine",
    desc: "Occurs naturally in coffee beans, tea leaves and cacao. One can holds roughly what a cup of home-brewed coffee does.",
    source: "Pharmaceutical grade",
    role: "Alertness, concentration",
    dose: "80",
    unit: "mg per can",
  },
  {
    name: "Taurine",
    mega: ["Tau-", "rine"],
    sci: "2-aminoethanesulfonic acid",
    desc: "An amino acid the body already makes on its own and also finds in fish and meat. The version in the can is made synthetically.",
    source: "Synthesised",
    role: "Supports normal body function",
    dose: "1,000",
    unit: "mg per can",
  },
  {
    name: "B-Group",
    mega: ["B-", "Group"],
    sci: "Niacin · B5 · B6 · B12",
    desc: "Four water-soluble vitamins that help the body turn food into usable energy, at levels it can actually put to work.",
    source: "Water-soluble vitamins",
    role: "Energy-yielding metabolism",
    dose: "4",
    unit: "vitamins",
  },
  {
    name: "Alpine Water",
    mega: ["Alp-", "ine"],
    sci: "H₂O, from the Alps",
    desc: "Spring water from the Austrian and Swiss Alps, drawn close to where every can is filled. The quiet majority of the recipe.",
    source: "Alpine springs",
    role: "The base of it all",
    dose: "250",
    unit: "ml",
  },
];

export type Chapter = { year: string; title: string; body: string; img: string; caption: string; alt: string };

export const CHAPTERS: Chapter[] = [
  {
    year: "1987",
    title: "Born by a lake",
    body: "The first cans leave a small office near Fuschl am See. Nobody has a shelf for them yet, so they make one.",
    img: "/img/story/lake.webp",
    caption: "Salzkammergut",
    alt: "Calm alpine lake at dusk with mountains reflected in the water",
  },
  {
    year: "1997",
    title: "Crossing the Atlantic",
    body: "After a decade spreading through Europe, the slim can lands in California. It arrives quietly and does not stay quiet for long.",
    img: "/img/story/coast.webp",
    caption: "Pacific Coast Highway",
    alt: "Golden-hour sunset over a beach on the Pacific Coast Highway",
  },
  {
    year: "2012",
    title: "Thirty-nine kilometres up",
    body: "A capsule, a balloon and one step off the edge of the stratosphere, watched live by millions holding their breath.",
    img: "/img/story/space.webp",
    caption: "Stratosphere",
    alt: "The curved horizon of Earth with a thin blue band of atmosphere against black space",
  },
  {
    year: "Today",
    title: "Still the same can",
    body: "Sold in 177 countries, and the 250 ml original is still the one most people reach for first.",
    img: "/img/story/today.webp",
    caption: "177 countries",
    alt: "Long-exposure night highway with streaks of red and white light",
  },
];

export const QUOTES = [
  { text: "A product whose reputation sometimes runs ahead of the drink, and somehow the drink keeps up.", source: "The Altitude Review" },
  { text: "Thirty-odd years in, it still looks like the future of the fridge.", source: "Paddock" },
  { text: "Found beside more night-desk keyboards than anyone will admit to.", source: "Night Shift" },
];

export const PUBLICATIONS = ["Paddock", "Night Shift", "Field & Sky", "Sunday Gazette", "The Altitude Review", "Longform"];

export const PACKS = [
  { size: 4, price: 8.99 },
  { size: 12, price: 24.99 },
  { size: 24, price: 46.99 },
];

export const CREDITS = [
  { use: "Classic can", title: "Redbull Dose", creator: "DYVER", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", url: "https://commons.wikimedia.org/wiki/File:Redbull_Dose.jpg" },
  { use: "Sugarfree can", title: "CreativeTools.se – PackshotCreator – RedBull", creator: "Creative Tools", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", url: "https://www.flickr.com/photos/creative_tools/4311162620/" },
  { use: "Red Edition can", title: "Cranberry Red Bull", creator: "seamus_walsh", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", url: "https://www.flickr.com/photos/95158910@N00/6966321726" },
  { use: "Blue Edition can", title: "Red Bull Blue", creator: "koka_sexton", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", url: "https://www.flickr.com/photos/9080929@N05/12649565655" },
  { use: "Yellow Edition can", title: "Red Bull Yellow Edition", creator: "Kidfly182", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", url: "https://commons.wikimedia.org/wiki/File:Red_Bull_Yellow_Edition.jpg" },
  { use: "1987", title: "sunset on wolfgangsee 2", creator: "magilla 03", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/", url: "https://www.flickr.com/photos/71030653@N02/15302677799" },
  { use: "1997", title: "Pacific Coast Highway 33 – Thornhill Broome Beach", creator: "hannes-flo", license: "CC BY 2.0", licenseUrl: "https://creativecommons.org/licenses/by/2.0/", url: "https://www.flickr.com/photos/154788154@N04/52480925542" },
  { use: "2012", title: "Earth's thin blue atmosphere above the Pacific", creator: "NASA / ISS crew", license: "Public domain", licenseUrl: "https://www.nasa.gov/nasa-brand-center/images-and-media/", url: "https://images.nasa.gov/details/iss074e0089803" },
  { use: "Today", title: "Night Drive", creator: "Kurayba", license: "CC BY-SA 2.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/2.0/", url: "https://www.flickr.com/photos/48503330@N08/13884197302" },
];
