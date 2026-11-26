function image(filename: string) {
  return `https://fevyora.com/images/${encodeURIComponent("pages images")}/${encodeURIComponent(filename)}`;
}

export type CatalogProduct = {
  slug: string;
  name: string;
  price: number;
  compareAt: number;
  collection: string;
  image: string;
  detail: string;
};

export const categories = [
  { slug: "abayas-robes", name: "Abayas & Robes", image: image("home page nos collections image1.webp") },
  { slug: "ensembles", name: "Ensembles", image: image("home page nos collections image2.webp") },
  { slug: "jupes-tops", name: "Jupes & Tops", image: image("home page nos collections image3.webp") },
  { slug: "vestes-manteaux", name: "Vestes & Manteaux", image: image("home page nos collections image4.webp") },
];

export const products: CatalogProduct[] = [
  { slug: "ensemble-elegant", name: "Ensemble Élégant", price: 499, compareAt: 699, collection: "ensembles", image: image("home page nos collections image2.webp"), detail: "Veste courte · jupe ample" },
  { slug: "robe-a-volants", name: "Robe à Volants", price: 599, compareAt: 799, collection: "abayas-robes", image: image("boutique prodact image 2.webp"), detail: "Volants · jupe longue" },
  { slug: "ensemble-chic", name: "Ensemble Chic", price: 549, compareAt: 749, collection: "jupes-tops", image: image("home page nos collections image3.webp"), detail: "Top olive · jupe ivoire" },
  { slug: "jupe-longue-premium", name: "Jupe Longue Premium", price: 399, compareAt: 499, collection: "jupes-tops", image: image("boutique prodact image 1.webp"), detail: "Jupe ample · veste croisée" },
  { slug: "veste-courte", name: "Veste Courte", price: 449, compareAt: 599, collection: "ensembles", image: image("home page nos collections image2.webp"), detail: "Col festonné · boutons nacrés" },
  { slug: "robe-longue-elegante", name: "Robe Longue Élégante", price: 479, compareAt: 599, collection: "vestes-manteaux", image: image("boutique prodact image3.webp"), detail: "Manteau long · robe noire" },
];
