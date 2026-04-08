import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../api/api.js";

const PAGE_SIZE = 24;

export default function HomePage() {
  const [params, setParams] = useSearchParams();
  const q = (params.get("q") ?? "").trim();
  const category = (params.get("category") ?? "").trim();
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "1", 10) || 1);

  const [status, setStatus] = useState("idle");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const skip = (page - 1) * PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    let cancelled = false;
    const sk = (page - 1) * PAGE_SIZE;

    async function load() {
      try {
        setStatus("loading");
        setErrorMsg("");
        const res = await api.get("/products", {
          params: {
            limit: PAGE_SIZE,
            skip: sk,
            ...(q ? { q } : {}),
            ...(category ? { category } : {})
          }
        });
        if (!cancelled) {
          const data = res.data;
          // Legacy API returned a bare array; current API returns { items, total, limit, skip }.
          if (Array.isArray(data)) {
            setTotal(data.length);
            setItems(data.slice(sk, sk + PAGE_SIZE));
          } else {
            setItems(Array.isArray(data?.items) ? data.items : []);
            setTotal(Number(data?.total) || 0);
          }
          setStatus("success");
        }
      } catch (_err) {
        if (!cancelled) {
          setStatus("error");
          setErrorMsg("Failed to load products.");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [q, category, page]);

  function goToPage(p) {
    const next = Math.min(Math.max(1, p), totalPages);
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category) sp.set("category", category);
    if (next > 1) sp.set("page", String(next));
    setParams(sp);
  }

  return (
    <section className="page">
      <div className="pageHeader">
        <div>
          <h1 className="pageTitle">Products</h1>
          <p className="pageSubtitle">
            {category ? (
              <>
                Category: <span className="pill">{category}</span>
                {q ? (
                  <>
                    {" "}
                    · Search: <span className="pill">{q}</span>
                  </>
                ) : null}
              </>
            ) : q ? (
              <>
                Results for <span className="pill">{q}</span>
              </>
            ) : (
              "Browse products and view details."
            )}
          </p>
          {total > 0 ? (
            <p className="muted small">
              Showing {skip + 1}–{Math.min(skip + PAGE_SIZE, total)} of {total}
            </p>
          ) : null}
        </div>
      </div>

      {status === "loading" ? (
        <div className="card">
          <div className="muted">Loading products…</div>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="card">
          <div className="errorText">{errorMsg}</div>
        </div>
      ) : null}

      {status === "success" ? (
        items.length ? (
          <>
            <div className="grid">
              {items.map((p) => (
                <article key={p._id} className="productCard">
                  <Link className="productMedia" to={`/product/${p._id}`}>
                    {p.image ? (
                      <img className="productImg" src={p.image} alt={p.name} />
                    ) : (
                      <div className="productImgFallback">No image</div>
                    )}
                  </Link>

                  <div className="productBody">
                    {p.category ? (
                      <div className="productCategory">
                        <span className="pill">{p.category}</span>
                      </div>
                    ) : null}
                    <div className="productName" title={p.name}>
                      {p.name}
                    </div>
                    <div className="productMetaRow">
                      <div className="productPrice">
                        ${Number(p.price ?? 0).toFixed(2)}
                      </div>
                      <div className="productRating" aria-label="rating">
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star">★</span>
                        <span className="star dim">★</span>
                        <span className="star dim">★</span>
                        <span className="muted small">(demo)</span>
                      </div>
                    </div>
                  </div>

                  <div className="productActions">
                    <Link className="btn" to={`/product/${p._id}`}>
                      View Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="homePager">
                <button
                  type="button"
                  className="btn"
                  disabled={page <= 1}
                  onClick={() => goToPage(page - 1)}
                >
                  Previous
                </button>
                <span className="muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn"
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <div className="card">
            <div className="muted">
              {q || category
                ? "No products match your filters."
                : "No products yet. Run the seed script or add listings as a seller."}
            </div>
          </div>
        )
      ) : null}
    </section>
  );
}
