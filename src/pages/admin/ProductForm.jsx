import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiUpload, FiX, FiSave, FiArrowLeft } from "react-icons/fi";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Sarees",
  "Dresses",
  "Lehenga",
  "Suits",
  "Kurtis",
  "Dupattas",
];

const EMPTY = {
  name: "",
  description: "",
  price: "",
  category: "Sarees",
  fabric: "",
  color: "",
  stock: "",
  discount: 0,
  featured: false,
  images: [],
};

// ── API URL — Dev અને Production ──
const BASE =
  import.meta.env.MODE === "production"
    ? "https://harshiddhi-backend.onrender.com"
    : "http://localhost:5000";

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);

  const isEdit = Boolean(id);
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  // ── Token Get ──
  const getToken = () => {
    try {
      const t1 = localStorage.getItem("userToken");
      if (t1) return t1;

      const userInfo = localStorage.getItem("userInfo");
      if (userInfo) {
        const t2 = JSON.parse(userInfo)?.token;
        if (t2) return t2;
      }

      const persisted = localStorage.getItem("harshiddhi");
      if (persisted) {
        const t3 = JSON.parse(persisted)?.auth?.user?.token;
        if (t3) return t3;
      }

      if (user?.token) return user.token;
    } catch (_) {}
    return null;
  };

  useEffect(() => {
    if (isEdit) fetchProduct();
  }, [id]);

  // ── Fetch Product for Edit ──
  const fetchProduct = async () => {
    try {
      const res = await fetch(`${BASE}/api/products/${id}`);
      const data = await res.json();
      setForm({
        name: data.name || "",
        description: data.description || "",
        price: data.price || "",
        category: data.category || "Sarees",
        fabric: data.fabric || "",
        color: data.color || "",
        stock: data.stock || "",
        discount: data.discount || 0,
        featured: data.featured || false,
        images: data.images || [],
      });
    } catch (err) {
      toast.error("Failed to load product");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  // ── Image Upload ──
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const token = getToken();

      if (!token) {
        toast.error("Session expired! Please login again");
        navigate("/login");
        return;
      }

      const fd = new FormData();
      fd.append("image", file);

      // Production અને Dev બંને માટે correct URL
      const response = await fetch(`${BASE}/api/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Upload failed: ${response.status}`);
      }

      setForm((p) => ({ ...p, images: [...p.images, data.url] }));
      toast.success("Image uploaded! ✅");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // ── Add Image URL ──
  const addImgUrl = () => {
    if (!imgUrl.trim()) return;
    setForm((p) => ({ ...p, images: [...p.images, imgUrl.trim()] }));
    setImgUrl("");
    toast.success("Image added! ✅");
  };

  // ── Remove Image ──
  const removeImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  // ── Submit Form ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) return toast.error("Product name જરૂરી છે");
    if (!form.price) return toast.error("Price જરૂરી છે");
    if (!form.stock) return toast.error("Stock જરૂરી છે");

    setSaving(true);

    try {
      const token = getToken();

      if (!token) {
        toast.error("Session expired! Please login again");
        navigate("/login");
        return;
      }

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        discount: Number(form.discount),
      };

      // Production અને Dev બંને માટે correct URL
      const url = isEdit
        ? `${BASE}/api/products/${id}`
        : `${BASE}/api/products`;
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Save failed");
      }

      toast.success(isEdit ? "Product updated! ✅" : "Product created! ✅");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 page-enter">
      <button
        onClick={() => navigate("/admin/products")}
        className="flex items-center gap-2 text-sm text-gray-500
                   hover:text-primary mb-6 transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Products
      </button>

      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Basic Info ── */}
        <div className="card p-6 border border-gray-100 space-y-4">
          <h2 className="font-semibold text-gray-700">Basic Information</h2>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Product Name *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Kanjivaram Pure Silk Saree"
              required
            />
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Description *
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="input-field resize-none"
              placeholder="Product description..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Price (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="input-field"
                placeholder="2999"
                min="0"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                className="input-field"
                placeholder="10"
                min="0"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Category *
              </label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="input-field"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">
                Discount (%)
              </label>
              <input
                type="number"
                name="discount"
                value={form.discount}
                onChange={handleChange}
                className="input-field"
                placeholder="0"
                min="0"
                max="90"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Fabric</label>
              <input
                name="fabric"
                value={form.fabric}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Pure Silk"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Color</label>
              <input
                name="color"
                value={form.color}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g. Red"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="featured"
              checked={form.featured}
              onChange={handleChange}
              className="w-4 h-4 accent-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              Feature this product on homepage
            </span>
          </label>
        </div>

        {/* ── Images ── */}
        <div className="card p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-700 mb-4">Product Images</h2>

          {/* Preview */}
          {form.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-4">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img}
                    alt=""
                    className="w-20 h-24 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full
                               p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload */}
          <label
            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-200
                            rounded-xl cursor-pointer hover:border-primary hover:bg-rose/30
                            transition-all mb-3"
          >
            <FiUpload className="text-primary shrink-0" size={20} />
            <span className="text-sm text-gray-600">
              {uploading
                ? "⏳ Uploading..."
                : "Click to upload image (max 5MB)"}
            </span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* URL */}
          <div className="flex gap-2">
            <input
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="Or paste image URL..."
              className="input-field flex-1 text-sm"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addImgUrl())
              }
            />
            <button
              type="button"
              onClick={addImgUrl}
              className="btn-outline text-sm px-4 py-2.5 shrink-0"
            >
              Add
            </button>
          </div>
        </div>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full py-4 text-base flex items-center justify-center gap-2"
        >
          <FiSave size={18} />
          {saving ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
        </button>
      </form>
    </div>
  );
}
