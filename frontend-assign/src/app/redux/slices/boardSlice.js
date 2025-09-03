import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// Async thunk to fetch board from backend
export const fetchBoard = createAsyncThunk("board/fetchBoard", async () => {
  const res = await fetch("http://localhost:3001/api/boards");
  const data = await res.json();
  return data[0] || { columns: [] }; // first board if API returns array
});

const boardSlice = createSlice({
  name: "board",
  initialState: {
    columns: [], // store as array instead of object
    status: "idle",
    error: null,
  },
  reducers: {
    updateColumns: (state, action) => {
      state.columns = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        const board = action.payload;

        // Convert columns to array with id
        state.columns = ["To Do", "In Progress", "Done"].map((status) => ({
          id: status,
          name:
            status === "To Do"
              ? "To Do"
              : status === "In Progress"
              ? "In Progress"
              : "Done",
          items: board.columns
            .filter((t) => t.status === status)
            .map((t) => ({ _id: t._id.toString(), title: t.title, status })),
        }));

        state.status = "succeeded";
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { updateColumns } = boardSlice.actions;
export default boardSlice.reducer;
