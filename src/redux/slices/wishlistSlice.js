import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {
    addToWishlist(state, { payload }) {
      const exists = state.items.find(i => i._id === payload._id);
      if (exists) {
        state.items = state.items.filter(i => i._id !== payload._id);
        toast.success('Removed from wishlist');
      } else {
        state.items.push(payload);
        toast.success('Added to wishlist 🤍');
      }
    },
    removeFromWishlist(state, { payload }) {
      state.items = state.items.filter(i => i._id !== payload);
    },
    clearWishlist(state) {
      state.items = [];
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;