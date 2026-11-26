import { createProduct, removeProduct } from "@/app/actions";
import { Frame } from "@/components/Frame";
import { categories } from "@/lib/catalog";
import { money } from "@/lib/format";
import { listShopProducts } from "@/lib/shop-data";

export const dynamic = "force-dynamic";

const errors: Record<string, string> = {
  nom: "Indique un nom de produit.",
  prix: "Le prix doit être un nombre entier en MAD, et l'ancien prix doit être plus élevé.",
  categorie: "Choisis une catégorie.",
  image: "L'image doit être un lien qui commence par http:// ou https://.",
};

export default async function Page({ searchParams }: { searchParams: Promise<{ erreur?: string }> }) {
  const params = await searchParams;
  const notice = params.erreur ? errors[params.erreur] ?? (params.erreur.length < 140 ? params.erreur : "") : "";
  return (
    <Frame active="produits">
      {({ orders }) => {
        return <ProductAdmin notice={notice} orders={orders} />;
      }}
    </Frame>
  );
}

async function ProductAdmin({
  notice,
  orders,
}: {
  notice: string;
  orders: { status: string; items: { slug: string; quantity: number }[] }[];
}) {
  const products = await listShopProducts();
  const sold = new Map<string, number>();
  for (const order of orders) {
    if (order.status === "annulee" || !Array.isArray(order.items)) continue;
    for (const item of order.items) sold.set(item.slug, (sold.get(item.slug) ?? 0) + item.quantity);
  }
  return (
    <>
      <div className="hello">
        <div>
          <h1>Produits</h1>
          <p>Ajoute une pièce. Elle apparaît dans la boutique sans attendre un nouveau déploiement.</p>
        </div>
      </div>
      {products === null ? (
        <article className="panel"><p className="empty">La table des produits n&apos;est pas encore créée. Lance le fichier supabase/shop.sql dans Supabase.</p></article>
      ) : (
        <>
          {notice ? <p className="error">{notice}</p> : null}
          <form className="panel admin-form" action={createProduct}>
            <div className="form-grid">
              <label>Nom<input name="name" required placeholder="Robe Lina" /></label>
              <label>Prix MAD<input name="price" type="number" min="0" step="1" required /></label>
              <label>Ancien prix<input name="compareAt" type="number" min="0" step="1" /></label>
              <label>
                Catégorie
                <select name="collection" defaultValue="abayas-robes">
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug}>{category.name}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>Lien de l&apos;image<input name="image" type="url" placeholder="https://..." /></label>
            <label>Détail<input name="detail" placeholder="Coupe longue · ceinture" /></label>
            <label>Tailles<input name="sizes" placeholder="S, M, L, XL" /></label>
            <p><button type="submit">Ajouter le produit</button></p>
          </form>
          <div className="stack">
            {products.map((product) => {
              const category = categories.find((item) => item.slug === product.collection);
              return (
                <article key={product.id} className="product-row">
                  {product.image ? <img src={product.image} alt="" /> : <span className="avatar">+</span>}
                  <div>
                    <strong>{product.name}</strong>
                    <p className="note">{category?.name ?? product.collection} · {product.detail || "Sans détail"}</p>
                  </div>
                  <div>
                    <strong>{money(product.price)}</strong>
                    <p className="note">{sold.get(product.slug) ?? 0} vente{(sold.get(product.slug) ?? 0) > 1 ? "s" : ""}</p>
                    <form action={removeProduct}>
                      <input type="hidden" name="slug" value={product.slug} />
                      <button className="ghost" type="submit">Retirer</button>
                    </form>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
