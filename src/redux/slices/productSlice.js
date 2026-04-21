import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// ── API URL — Dev અને Production બંને માટે ──
const PROD_URL = 'https://harshiddhi-backend.onrender.com/api';
const DEV_URL  = 'http://localhost:5000/api';
const API      = import.meta.env.MODE === 'production' ? PROD_URL : DEV_URL;

// ── Token Get ──
const getToken = () => {
  try {
    const t1 = localStorage.getItem('userToken');
    if (t1) return t1;

    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const t2 = JSON.parse(userInfo)?.token;
      if (t2) return t2;
    }

    const persisted = localStorage.getItem('harshiddhi');
    if (persisted) {
      const t3 = JSON.parse(persisted)?.auth?.user?.token;
      if (t3) return t3;
    }
  } catch (_) {}
  return null;
};

// ── Fetch All Products ──
export const fetchProducts = createAsyncThunk(
  'product/fetchAll',
  async (params = {}) => {
    const query = new URLSearchParams();
    if (params.category) query.append('category', params.category);
    if (params.search)   query.append('search',   params.search);
    if (params.minPrice) query.append('minPrice',  params.minPrice);
    if (params.maxPrice) query.append('maxPrice',  params.maxPrice);
    if (params.page)     query.append('page',      params.page);
    if (params.limit)    query.append('limit',     params.limit);

    const res  = await fetch(`${API}/products?${query}`);
    const data = await res.json();
    return data;
  }
);

// ── Fetch Featured Products ──
export const fetchFeatured = createAsyncThunk(
  'product/fetchFeatured',
  async () => {
    const res  = await fetch(`${API}/products/featured`);
    const data = await res.json();
    return data;
  }
);

// ── Fetch Single Product ──
export const fetchProductById = createAsyncThunk(
  'product/fetchById',
  async (id) => {
    const res  = await fetch(`${API}/products/${id}`);
    const data = await res.json();
    return data;
  }
);

// ── Create Product (Admin) ──
export const createProduct = createAsyncThunk(
  'product/create',
  async (productData) => {
    const token = getToken();
    const res   = await fetch(`${API}/products`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(productData),
    });
    const data = await res.json();
    return data;
  }
);

// ── Update Product (Admin) ──
export const updateProduct = createAsyncThunk(
  'product/update',
  async ({ id, ...rest }) => {
    const token = getToken();
    const res   = await fetch(`${API}/products/${id}`, {
      method:  'PUT',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(rest),
    });
    const data = await res.json();
    return data;
  }
);

// ── Delete Product (Admin) ──
export const deleteProduct = createAsyncThunk(
  'product/delete',
  async (id) => {
    const token = getToken();
    await fetch(`${API}/products/${id}`, {
      method:  'DELETE',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return id;
  }
);

// ── Product Slice ──
const productSlice = createSlice({
  name: 'product',
  initialState: {
    list:     [],
    featured: [],
    current:  null,
    loading:  false,
    error:    null,
    page:     1,
    pages:    1,
    total:    0,
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchProducts.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(fetchProducts.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.list    = payload.products || [];
        s.page    = payload.page     || 1;
        s.pages   = payload.pages    || 1;
        s.total   = payload.total    || 0;
      })
      .addCase(fetchProducts.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.error.message;
      })

      // Fetch Featured
      .addCase(fetchFeatured.pending,   (s) => { s.loading = true; })
      .addCase(fetchFeatured.fulfilled, (s, { payload }) => {
        s.loading  = false;
        s.featured = payload || [];
      })
      .addCase(fetchFeatured.rejected,  (s) => { s.loading = false; })

      // Fetch By ID
      .addCase(fetchProductById.pending,   (s) => { s.loading = true; s.current = null; })
      .addCase(fetchProductById.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.current = payload;
      })
      .addCase(fetchProductById.rejected,  (s, a) => {
        s.loading = false;
        s.error   = a.error.message;
      })

      // Delete
      .addCase(deleteProduct.fulfilled, (s, { payload }) => {
        s.list = s.list.filter(p => p._id !== payload);
      });
  },
});

export const { clearCurrent } = productSlice.actions;
export default productSlice.reducer;