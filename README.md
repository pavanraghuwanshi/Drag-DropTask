
## Features

- Drag-and-drop tasks between columns with smooth animations.
- Column and task management with backend integration.
- Persistent board state across sessions.

---

### State Management

- **Redux** manages the state across the application.
  - `boardsSlice`: Handles board and column data.


### Drag-and-Drop

- Implemented with `@hello-pangea/dnd` for a smooth drag-and-drop experience.
- Columns are `Droppable` areas and tasks are `Draggable` components.

---

## Implementation Details

- **Drag-and-Drop:**
  - Tasks can be moved between columns.
  - Visual feedback provided while dragging.
  - Works with real-time updates.

- **Optimistic UI:**
  - Immediate UI update before server response.
  - Reverts changes and shows errors if the server request fails.

- **Code Quality:**
  - Used `React.memo` and `useCallback` to avoid unnecessary re-renders.
  - Centralized API calls using custom hooks.
  - State management improved using Redux instead of prop drilling.

---

## Testing

- **Frameworks:** Jest & React Testing Library.
- **Coverage:** 85% across components and core logic.
- **Test Patterns:**
  - Render components with providers.
  - Mock API calls and WebSocket connections.
  - Simulate user interactions and verify state changes.

**Run Tests:**

```bash
npm test
npm test -- --coverage --watchAll=false
