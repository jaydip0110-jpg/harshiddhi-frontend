import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiLogOut,
  FiPackage,
  FiSettings,
  FiHeart,
} from "react-icons/fi";
import { logout } from "../../redux/slices/authSlice";
import { selectCartCount } from "../../redux/slices/cartSlice";

const CATEGORIES = [
  "Sarees",
  "Dresses",
  "Lehenga",
  "Suits",
  "Kurtis",
  "Dupattas",
];

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const wishlistCount = useSelector((s) => s.wishlist.items.length);

  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [userOpen, setUserOpen] = useState(false);

  const userMenuRef = useRef(null);

  // ── Close user menu when clicking outside ──
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Close menus on route change ──
  useEffect(() => {
    setUserOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${search.trim()}`);
      setSearch("");
      setMenuOpen(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserOpen(false);
    navigate("/");
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-rose-100">
      {/* Top bar */}
      <div className="bg-primary text-white text-xs text-center py-1.5 font-body tracking-wide">
        🌸 Free shipping on orders above ₹999 | COD Available | हर्षिद्धि सदा
        सहायते
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex flex-col leading-none shrink-0">
          <span className="font-display font-bold text-xl md:text-2xl text-primary">
            Harshiddhi
          </span>
          <span className="text-xs text-gold-dark font-body tracking-widest uppercase">
            Saari &amp; Dresses
          </span>
        </Link>

        {/* Search - desktop */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md"
        >
          <div className="relative w-full">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sarees, lehengas, dresses…"
              className="w-full border border-gray-200 rounded-full pl-4 pr-12 py-2.5 text-sm
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
            >
              <FiSearch size={18} />
            </button>
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="relative p-2 hover:text-primary transition-colors"
          >
            <FiHeart size={22} />
            {wishlistCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-primary text-white text-xs
                     w-5 h-5 rounded-full flex items-center justify-center font-bold"
              >
                {wishlistCount}
              </span>
            )}
          </Link>
          {/* Cart */}
          <Link
            to="/cart"
            className="relative p-2 hover:text-primary transition-colors"
          >
            <FiShoppingCart size={22} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1 -right-1 bg-primary text-white text-xs
                               w-5 h-5 rounded-full flex items-center justify-center font-bold"
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* User menu */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserOpen((prev) => !prev)}
                className="flex items-center gap-1.5 bg-rose text-primary px-3 py-2 rounded-full
                           text-sm font-semibold hover:bg-rose-dark transition-colors"
              >
                <FiUser size={16} />
                <span className="hidden md:inline">
                  {user.name?.split(" ")[0]}
                </span>
              </button>

              {/* Dropdown */}
              {userOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl
                                shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="font-semibold text-sm truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>

                  <Link
                    to="/orders"
                    onClick={() => setUserOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-rose transition-colors"
                  >
                    <FiPackage size={15} /> My Orders
                  </Link>

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setUserOpen(false)}
                      className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-rose
                                 transition-colors text-primary font-semibold"
                    >
                      <FiSettings size={15} /> Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-rose
                               transition-colors w-full text-left text-red-500"
                  >
                    <FiLogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-2 px-5">
              Login
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden p-2"
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Category nav - desktop */}
      <div className="hidden md:block border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-6 py-2">
          <Link
            to="/products"
            className="text-sm font-semibold text-gray-700 hover:text-primary transition-colors py-1"
          >
            All Products
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/products?category=${cat}`}
              className="text-sm text-gray-600 hover:text-primary transition-colors py-1 whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 animate-slide-up">
          <form onSubmit={handleSearch} className="px-4 pt-3 pb-2">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search…"
                className="w-full border border-gray-200 rounded-full pl-4 pr-10 py-2
                           text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
              >
                <FiSearch size={16} />
              </button>
            </div>
          </form>
          <div className="px-4 py-2 flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                to={`/products?category=${cat}`}
                onClick={() => setMenuOpen(false)}
                className="badge bg-rose text-primary border border-primary/20 text-xs px-3 py-1.5"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
