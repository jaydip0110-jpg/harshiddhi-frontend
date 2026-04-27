import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiUpload, FiX, FiSave, FiArrowLeft, FiImage } from "react-icons/fi";
import toast from "react-hot-toast";

const CATEGORIES = [
  "Sarees",
  "Dresses",
  "Lehenga",
  "Suits",
  "Kurtis",
  "Dupattas",
];

const ALL_SIZES = [
  "Free Size",
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
  "4XL",
  "5XL",
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
  sizes: [],
};

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
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [saving, setSaving] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

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
        sizes: data.sizes || [],
      });
    } catch (err) {
      toast.error("Failed to load product");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleSize = (size) => {
    setForm((p) => ({
      ...p,
      sizes: p.sizes.includes(size)
        ? p.sizes.filter((s) => s !== size)
        : [...p.sizes, size],
    }));
  };

  // ── Single image upload helper ──
  const uploadSingleFile = async (file, token) => {
    const fd = new FormData();
    fd.append("image", file);
    const response = await fetch(`${BASE}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Upload failed");
    return data.url;
  };

  // ── Multiple Images Upload ──
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // 10 images thi vadhu nahi
    if (form.images.length + files.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }

    // Size check — dareknii 5MB thi vadhu nahi
    const oversized = files.find((f) => f.size > 5 * 1024 * 1024);
    if (oversized) {
      toast.error(`"${oversized.name}" 5MB thi vadhu che`);
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Session expired! Please login again");
      navigate("/login");
      return;
    }

    setUploading(true);
    setUploadProgress({ done: 0, total: files.length });

    const uploadedUrls = [];
    const failed = [];

    // Ek ek file upload karo — parallel
    await Promise.all(
      files.map(async (file) => {
        try {
          const url = await uploadSingleFile(file, token);
          uploadedUrls.push(url);
        } catch (err) {
          failed.push(file.name);
        } finally {
          setUploadProgress((prev) => ({ ...prev, done: prev.done + 1 }));
        }
      }),
    );

    if (uploadedUrls.length > 0) {
      setForm((p) => ({ ...p, images: [...p.images, ...uploadedUrls] }));
      toast.success(`${uploadedUrls.length} image(s) uploaded! ✅`);
    }
    if (failed.length > 0) {
      toast.error(`${failed.length} image(s) fail thyi: ${failed.join(", ")}`);
    }

    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });
    e.target.value = "";
  };

  const addImgUrl = () => {
    if (!imgUrl.trim()) return;
    if (form.images.length >= 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    setForm((p) => ({ ...p, images: [...p.images, imgUrl.trim()] }));
    setImgUrl("");
    toast.success("Image added! ✅");
  };

  // ── Drag to reorder ──
  const moveImage = (from, to) => {
    const imgs = [...form.images];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    setForm((p) => ({ ...p, images: imgs }));
  };

  const removeImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

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
      if (!response.ok) throw new Error(data.message || "Save failed");

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
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-6 transition-colors"
      >
        <FiArrowLeft size={16} /> Back to Products
      </button>

      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">
        {isEdit ? "Edit Product" : "Add New Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
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

          {/* Sizes */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block font-medium">
              Available Sizes
            </label>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all
                    ${
                      form.sizes.includes(size)
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white text-gray-600 border-gray-200 hover:border-primary hover:text-primary"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
            {form.sizes.length > 0 && (
              <p className="text-xs text-green-600 mt-2 font-medium">
                ✅ Selected: {form.sizes.join(", ")}
              </p>
            )}
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

        {/* ── Images Section ── */}
        <div className="card p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-700">Product Images</h2>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full
              ${
                form.images.length >= 10
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {form.images.length} / 10
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Pehli image main photo tarke dikhe che. Drag karva thi order
            badlavo.
          </p>

          {/* Image Preview Grid */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <div
                    className={`relative rounded-xl overflow-hidden border-2 transition-all
                    ${i === 0 ? "border-primary" : "border-gray-200"}`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full aspect-[3/4] object-cover"
                    />

                    {/* Main photo label */}
                    {i === 0 && (
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-primary/80
                                      text-white text-center text-xs py-1 font-semibold"
                      >
                        Main
                      </div>
                    )}
                  </div>

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full
                               p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <FiX size={11} />
                  </button>

                  {/* Move left / right */}
                  <div
                    className="absolute bottom-1 left-1 right-1 flex justify-between
                                  opacity-0 group-hover:opacity-100 transition-opacity z-10 gap-1"
                  >
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i - 1)}
                        className="bg-white/90 text-gray-700 rounded-full px-1.5 py-0.5 text-xs font-bold shadow"
                      >
                        ←
                      </button>
                    )}
                    {i < form.images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveImage(i, i + 1)}
                        className="bg-white/90 text-gray-700 rounded-full px-1.5 py-0.5 text-xs font-bold shadow ml-auto"
                      >
                        →
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload Area */}
          {form.images.length < 10 && (
            <label
              className={`flex flex-col items-center gap-2 p-6 border-2 border-dashed
                              rounded-xl cursor-pointer transition-all mb-3
                              ${
                                uploading
                                  ? "border-primary bg-rose/20 cursor-not-allowed"
                                  : "border-gray-200 hover:border-primary hover:bg-rose/20"
                              }`}
            >
              {uploading ? (
                <>
                  <div
                    className="w-8 h-8 border-2 border-primary border-t-transparent
                                  rounded-full animate-spin"
                  />
                  <span className="text-sm text-primary font-medium">
                    Uploading {uploadProgress.done}/{uploadProgress.total}...
                  </span>
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${uploadProgress.total > 0 ? (uploadProgress.done / uploadProgress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <FiUpload className="text-primary" size={28} />
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">
                      Click karva thi multiple photos select karo
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Ek saath ghanaye photos choose kari shakay • Max 5MB per
                      image • JPG, PNG, WebP
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <FiImage size={14} className="text-primary" />
                    <span className="text-xs text-primary font-medium">
                      {10 - form.images.length} image(s) add kari shakay cho
                    </span>
                  </div>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}

          {/* URL input */}
          <div className="flex gap-2">
            <input
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="Ya image URL paste karo..."
              className="input-field flex-1 text-sm"
              onKeyDown={(e) =>
                e.key === "Enter" && (e.preventDefault(), addImgUrl())
              }
            />
            <button
              type="button"
              onClick={addImgUrl}
              className="btn-outline text-sm px-4 py-2.5 shrink-0"
              disabled={form.images.length >= 10}
            >
              Add
            </button>
          </div>
        </div>

        {/* Submit */}
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
