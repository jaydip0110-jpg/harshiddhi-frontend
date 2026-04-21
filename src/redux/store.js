import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

import authReducer    from './slices/authSlice';
import cartReducer    from './slices/cartSlice';
import productReducer from './slices/productSlice';
import orderReducer   from './slices/orderSlice';

const persistConfig = {
  key: 'harshiddhi',
  storage,
  whitelist: ['auth', 'cart'], // Only persist auth and cart
};

const rootReducer = combineReducers({
  auth:    authReducer,
  cart:    cartReducer,
  product: productReducer,
  order:   orderReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
    }),
});

export const persistor = persistStore(store);
