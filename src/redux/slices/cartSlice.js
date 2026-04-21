import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], shippingAddress: null, paymentMethod: 'COD' },
  reducers: {
    addToCart(state, { payload }) {
      const existing = state.items.find(i => i._id === payload._id);
      if (existing) {
        existing.qty = Math.min(existing.qty + 1, payload.stock);
        toast.success('Quantity updated 🛒');
      } else {
        state.items.push({ ...payload, qty: 1 });
        toast.success('Added to cart 🛒');
      }
    },
    removeFromCart(state, { payload }) {
      state.items = state.items.filter(i => i._id !== payload);
      toast.success('Removed from cart');
    },
    updateQty(state, { payload: { id, qty } }) {
      const item = state.items.find(i => i._id === id);
      if (item) item.qty = qty;
    },
    clearCart(state) {
      state.items = [];
    },
    saveShippingAddress(state, { payload }) {
      state.shippingAddress = payload;
    },
    savePaymentMethod(state, { payload }) {
      state.paymentMethod = payload;
    },
  },
});

// Selectors
export const selectCartCount = (state) =>
  state.cart.items.reduce((acc, i) => acc + i.qty, 0);

export const selectCartTotal = (state) =>
  state.cart.items.reduce((acc, i) => acc + i.price * i.qty, 0);

export const { addToCart, removeFromCart, updateQty, clearCart, saveShippingAddress, savePaymentMethod } = cartSlice.actions;
export default cartSlice.reducer;
