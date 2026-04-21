import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const placeOrder = createAsyncThunk('order/place', async (orderData) => {
  const { data } = await api.post('/orders', orderData);
  return data;
});

export const fetchMyOrders = createAsyncThunk('order/myOrders', async () => {
  const { data } = await api.get('/orders/myorders');
  return data;
});

export const fetchOrderById = createAsyncThunk('order/fetchById', async (id) => {
  const { data } = await api.get(`/orders/${id}`);
  return data;
});

export const fetchAllOrders = createAsyncThunk('order/fetchAll', async () => {
  const { data } = await api.get('/orders');
  return data;
});

export const updateOrderStatus = createAsyncThunk('order/updateStatus', async ({ id, status }) => {
  const { data } = await api.put(`/orders/${id}/status`, { status });
  return data;
});

const orderSlice = createSlice({
  name: 'order',
  initialState: {
    myOrders:  [],
    allOrders: [],
    current:   null,
    loading:   false,
    error:     null,
  },
  reducers: {
    clearCurrentOrder(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(placeOrder.pending,    (s) => { s.loading = true; })
      .addCase(placeOrder.fulfilled,  (s, { payload }) => { s.loading = false; s.current = payload; })
      .addCase(placeOrder.rejected,   (s, a) => { s.loading = false; s.error = a.error.message; })
      .addCase(fetchMyOrders.fulfilled,   (s, { payload }) => { s.myOrders   = payload; })
      .addCase(fetchOrderById.fulfilled,  (s, { payload }) => { s.current    = payload; })
      .addCase(fetchAllOrders.fulfilled,  (s, { payload }) => { s.allOrders  = payload; })
      .addCase(updateOrderStatus.fulfilled, (s, { payload }) => {
        const idx = s.allOrders.findIndex(o => o._id === payload._id);
        if (idx !== -1) s.allOrders[idx] = payload;
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;