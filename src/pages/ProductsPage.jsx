import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/product/ProductCard";
import Pagination from "../components/common/Pagination";
import { ProductGridSkeleton } from "../components/common/Skeleton";
import { FiFilter, FiX, FiChevronDown } from "react-icons/fi";

const CATEGORIES = [
  "All",
  "Sarees",
  "Dresses",
  "Lehenga",
  "Suits",
  "Kurtis",
  "Dupattas",
];
const GENDER_FILTERS = ["Women", "Girls"];
const PRICE_RANGES = [
  { label: "All Prices", min: "", max: "" },
  { label: "Under ₹1,000", min: "", max: 1000 },
  { label: "₹1,000 – ₹3,000", min: 1000, max: 3000 },
  { label: "₹3,000 – ₹8,000", min: 3000, max: 8000 },
  { label: "Above ₹8,000", min: 8000, max: "" },
];
const SORT_OPTIONS = [
  { label: "What's New", value: "newest" },
  { label: "Recommended", value: "" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Better Discount", value: "discount" },
  { label: "Customer Rating", value: "rating" },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const {
    list: products,
    loading,
    pages,
    page: curPage,
    total,
  } = useSelector((s) => s.product);
  const [searchParams, setSearchParams] = useSearchParams();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");

  const sortRef = useRef(null);

  // Close sort on outside click
  useEffect(() => {
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const category = searchParams.get("category") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort") || "newest";

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val);
    else p.delete(key);
    p.delete("page");
    setSearchParams(p);
  };

  const setPage = (p) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", p);
    setSearchParams(params);
  };

  useEffect(() => {
    dispatch(fetchProducts({ category, minPrice, maxPrice, page }));
  }, [category, minPrice, maxPrice, page, dispatch]);

  // Sort products
  const sortedProducts = [...products].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "discount") return (b.discount || 0) - (a.discount || 0);
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    return 0;
  });

  const activePriceRange =
    PRICE_RANGES.find(
      (r) =>
        String(r.min) === String(minPrice) &&
        String(r.max) === String(maxPrice),
    ) || PRICE_RANGES[0];

  const activeSort =
    SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0];
  const hasFilters = category || minPrice || maxPrice || selectedGender;

  // Radio Button
  const RadioBtn = ({ selected }) => (
    <div
      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                     transition-all duration-200 shrink-0
                     ${selected ? "border-primary bg-primary" : "border-gray-400"}`}
    >
      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
    </div>
  );

  // Filter Panel
  const FilterPanel = () => (
    <div className="space-y-5">
      <h4 className="font-bold text-gray-800 uppercase text-sm tracking-widest">
        Filters
      </h4>

      {/* Gender */}
      <div>
        <div className="flex flex-col gap-3">
          {GENDER_FILTERS.map((g) => (
            <label
              key={g}
              onClick={() => setSelectedGender((prev) => (prev === g ? "" : g))}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <RadioBtn selected={selectedGender === g} />
              <span
                className={`text-sm transition-colors
                ${
                  selectedGender === g
                    ? "text-primary font-semibold"
                    : "text-gray-700 group-hover:text-primary"
                }`}
              >
                {g}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Category */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
          Category
        </h4>
        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => {
            const selected = (cat === "All" && !category) || cat === category;
            return (
              <label
                key={cat}
                onClick={() => {
                  setParam("category", cat === "All" ? "" : cat);
                  setDrawerOpen(false);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <RadioBtn selected={selected} />
                <span
                  className={`text-sm transition-colors
                  ${
                    selected
                      ? "text-primary font-semibold"
                      : "text-gray-700 group-hover:text-primary"
                  }`}
                >
                  {cat}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="border-t border-gray-200" />

      {/* Price */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">
          Price Range
        </h4>
        <div className="flex flex-col gap-3">
          {PRICE_RANGES.map((r) => {
            const selected = r.label === activePriceRange.label;
            return (
              <label
                key={r.label}
                onClick={() => {
                  setParam("minPrice", r.min);
                  setParam("maxPrice", r.max);
                  setDrawerOpen(false);
                }}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <RadioBtn selected={selected} />
                <span
                  className={`text-sm transition-colors
                  ${
                    selected
                      ? "text-primary font-semibold"
                      : "text-gray-700 group-hover:text-primary"
                  }`}
                >
                  {r.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Clear All */}
      {hasFilters && (
        <>
          <div className="border-t border-gray-200" />
          <button
            onClick={() => {
              setSearchParams({});
              setSelectedGender("");
              setDrawerOpen(false);
            }}
            className="w-full text-center text-sm text-red-500 font-semibold py-2
                       border border-red-200 rounded-xl hover:bg-red-50 transition-all"
          >
            ✕ Clear All Filters
          </button>
        </>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 page-enter">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-4 border-b border-gray-200">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-800">
            {category || "All Products"}
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">{total} products found</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter Button */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300
                       rounded-full text-sm font-semibold hover:border-primary
                       hover:text-primary transition-all"
          >
            <FiFilter size={14} /> Filters
            {hasFilters && <span className="w-2 h-2 bg-primary rounded-full" />}
          </button>

          {/* Sort Button */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => setSortOpen((p) => !p)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300
                         rounded-full text-sm font-semibold hover:border-primary
                         hover:text-primary transition-all"
            >
              Sort by: <span className="text-primary">{activeSort.label}</span>
              <FiChevronDown
                size={14}
                className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>

            {sortOpen && (
              <div
                className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl
                              shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in"
              >
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setParam("sort", opt.value);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-sm transition-colors
                      ${
                        sort === opt.value
                          ? "bg-primary text-white font-semibold"
                          : "hover:bg-rose text-gray-700"
                      }`}
                  >
                    {sort === opt.value && "✓ "}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active Filter Tags */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 py-3">
          {selectedGender && (
            <span
              className="badge bg-primary/10 text-primary border border-primary/20
                             flex items-center gap-1 px-3 py-1.5 text-xs font-semibold"
            >
              {selectedGender}
              <button onClick={() => setSelectedGender("")}>
                <FiX size={11} />
              </button>
            </span>
          )}
          {category && (
            <span
              className="badge bg-primary/10 text-primary border border-primary/20
                             flex items-center gap-1 px-3 py-1.5 text-xs font-semibold"
            >
              {category}
              <button onClick={() => setParam("category", "")}>
                <FiX size={11} />
              </button>
            </span>
          )}
          {activePriceRange.label !== "All Prices" && (
            <span
              className="badge bg-primary/10 text-primary border border-primary/20
                             flex items-center gap-1 px-3 py-1.5 text-xs font-semibold"
            >
              {activePriceRange.label}
              <button
                onClick={() => {
                  setParam("minPrice", "");
                  setParam("maxPrice", "");
                }}
              >
                <FiX size={11} />
              </button>
            </span>
          )}
          <button
            onClick={() => {
              setSearchParams({});
              setSelectedGender("");
            }}
            className="text-xs text-red-500 hover:underline font-semibold px-2"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex gap-6 pt-4">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <FilterPanel />
          </div>
        </aside>

        {/* Mobile Filter Drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative ml-auto w-72 bg-white h-full p-6 overflow-y-auto animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg uppercase tracking-wide">
                  Filters
                </h3>
                <button onClick={() => setDrawerOpen(false)}>
                  <FiX size={22} />
                </button>
              </div>
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <ProductGridSkeleton count={8} />
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🥻</div>
              <h3 className="font-display text-xl text-gray-600 mb-2">
                No products found
              </h3>
              <p className="text-gray-400 text-sm">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <>
              {/* ✅ NEW badge ProductCard handle કરે — no extra wrapper needed */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
              <Pagination page={curPage} pages={pages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
