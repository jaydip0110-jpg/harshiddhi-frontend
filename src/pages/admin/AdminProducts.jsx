import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, deleteProduct } from "../../redux/slices/productSlice";
import { FiEdit2, FiTrash2, FiPlus, FiSearch, FiHome } from "react-icons/fi";
import toast from "react-hot-toast";

const getToken = () => {
  try {
    const t1 = localStorage.getItem("userToken");
    if (t1) return t1;
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) return JSON.parse(userInfo)?.token;
    const persisted = localStorage.getItem("harshiddhi");
    if (persisted) return JSON.parse(persisted)?.auth?.user?.token;
  } catch (_) {}
  return null;
};

const BASE =
  import.meta.env.MODE === "production"
    ? "https://harshiddhi-backend.onrender.com/api"
    : "http://localhost:5000/api";

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { list: products, loading } = useSelector((s) => s.product);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
  }, [dispatch]);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()),
  );

  // Delete
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success("Product deleted ✅");
      dispatch(fetchProducts({ limit: 100 }));
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Toggle Home Page Show/Hide
  const handleToggleHome = async (product) => {
    setToggling(product._id);
    try {
      const token = getToken();
      const newValue = !product.showOnHome;

      const res = await fetch(`${BASE}/products/${product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ showOnHome: newValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success(
        newValue
          ? `"${product.name}" Home page પર add થયું 🏠✅`
          : `"${product.name}" Home page માંથી remove થયું`,
      );
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">
            Products
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            🏠 = Home page પર show | Toggle button થી add/remove કરો
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <FiSearch
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          size={16}
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="input-field pl-10"
        />
      </div>

      {/* Stats */}
      <div className="flex gap-4 mb-6">
        <div className="bg-white rounded-xl px-4 py-2 border border-gray-100 shadow-sm text-sm">
          <span className="text-gray-500">Total: </span>
          <span className="font-bold text-gray-800">{products.length}</span>
        </div>
        <div className="bg-primary/10 rounded-xl px-4 py-2 border border-primary/20 text-sm">
          <span className="text-primary">🏠 On Home: </span>
          <span className="font-bold text-primary">
            {products.filter((p) => p.showOnHome).length}
          </span>
        </div>
      </div>

      {/* Product Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden shadow-md"
            >
              <div className="skeleton aspect-[3/4]" />
              <div className="p-3 space-y-2">
                <div className="skeleton h-4 rounded" />
                <div className="skeleton h-8 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const discountedPrice = product.discount
              ? Math.round(product.price * (1 - product.discount / 100))
              : product.price;
            const isOnHome = product.showOnHome === true;
            const isLoading = toggling === product._id;

            return (
              <div
                key={product._id}
                className={`bg-white rounded-2xl overflow-hidden shadow-md
                            border-2 transition-all duration-300
                  ${
                    isOnHome
                      ? "border-primary shadow-primary/20"
                      : "border-gray-100 hover:shadow-lg"
                  }`}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={
                      product.images?.[0] ||
                      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400"
                    }
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />

                  {/* Home Badge */}
                  {isOnHome && (
                    <div className="absolute top-2 left-2">
                      <span
                        className="bg-primary text-white text-xs font-bold
                                       px-2.5 py-1 rounded-full shadow"
                      >
                        🏠 Home
                      </span>
                    </div>
                  )}

                  {/* Out of Stock */}
                  {product.stock === 0 && (
                    <div className="absolute top-2 right-2">
                      <span
                        className="bg-gray-700 text-white text-xs
                                       px-2 py-0.5 rounded-full"
                      >
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-semibold text-gray-800 text-sm line-clamp-1 mb-1">
                    {product.name}
                  </h3>

                  {/* Price */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="font-bold text-gray-900 text-sm">
                      ₹{discountedPrice.toLocaleString("en-IN")}
                    </span>
                    {product.discount > 0 && (
                      <span className="text-xs text-gray-400 line-through">
                        (₹{product.price.toLocaleString("en-IN")})
                      </span>
                    )}
                  </div>

                  {/* ── Home Toggle Button ── */}
                  <button
                    onClick={() => handleToggleHome(product)}
                    disabled={isLoading}
                    className={`w-full flex items-center justify-center gap-2
                                py-2.5 rounded-xl text-xs font-bold border-2
                                transition-all duration-300 mb-2
                      ${
                        isOnHome
                          ? "bg-primary text-white border-primary hover:bg-primary-dark"
                          : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary hover:bg-rose/30"
                      }`}
                  >
                    {isLoading ? (
                      <div
                        className="w-3 h-3 border-2 border-current
                                      border-t-transparent rounded-full animate-spin"
                      />
                    ) : (
                      <FiHome size={13} />
                    )}
                    {isLoading
                      ? "Updating..."
                      : isOnHome
                        ? "🏠 Home Page પર છે — Remove કરો"
                        : "+ Home Page પર Add કરો"}
                  </button>

                  {/* Edit + Delete */}
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/products/${product._id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1 py-2
                                 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold
                                 hover:bg-blue-500 hover:text-white transition-all"
                    >
                      <FiEdit2 size={12} /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="flex-1 flex items-center justify-center gap-1 py-2
                                 bg-red-50 text-red-500 rounded-xl text-xs font-semibold
                                 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <FiTrash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📦</div>
          <p>No products found</p>
        </div>
      )}
    </div>
  );
}
