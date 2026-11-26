import { Frame } from "@/components/Frame";
import { categories, products } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Frame active="categories">
      {() => (
        <>
          <div className="hello"><h1>Catégories</h1></div>
          <div className="stack">
            {categories.map((category) => {
              const count = products.filter((product) => product.collection === category.slug).length;
              return (
                <article key={category.slug} className="category">
                  <img src={category.image} alt="" />
                  <div>
                    <strong>{category.name}</strong>
                    <p className="note">{count} produit{count > 1 ? "s" : ""}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </Frame>
  );
}
