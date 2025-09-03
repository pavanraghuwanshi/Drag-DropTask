import { configureStore } from "@reduxjs/toolkit";
import boardReducer from "./slices/boardSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    board: boardReducer, // Kanban Board state
    cart: cartReducer,   // Cart state
  },
});
