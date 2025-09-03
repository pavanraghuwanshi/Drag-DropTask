"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useSelector, useDispatch } from "react-redux";
import { fetchBoard, updateColumns } from "../redux/slices/boardSlice";

export default function BoardPage() {
  const dispatch = useDispatch();
  const columnsFromRedux = useSelector((state) => state.board.columns);
  const [columns, setColumns] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("");

  useEffect(() => {
    dispatch(fetchBoard());
  }, [dispatch]);

  useEffect(() => {
    if (columnsFromRedux && columnsFromRedux.length > 0) {
      setColumns(columnsFromRedux);
      setNewTaskStatus(columnsFromRedux[0].name); // default status
    }
  }, [columnsFromRedux]);

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newColumns = JSON.parse(JSON.stringify(columns));
    const sourceColIndex = newColumns.findIndex(
      (col) => String(col.id) === String(source.droppableId)
    );
    const destColIndex = newColumns.findIndex(
      (col) => String(col.id) === String(destination.droppableId)
    );
    if (sourceColIndex === -1 || destColIndex === -1) return;

    let movedItem;
    if (source.droppableId === destination.droppableId) {
      const items = Array.from(newColumns[sourceColIndex].items);
      [movedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, movedItem);
      newColumns[sourceColIndex].items = items;
    } else {
      const sourceItems = Array.from(newColumns[sourceColIndex].items);
      const destItems = Array.from(newColumns[destColIndex].items);
      [movedItem] = sourceItems.splice(source.index, 1);
      movedItem.status = newColumns[destColIndex].name;
      destItems.splice(destination.index, 0, movedItem);
      newColumns[sourceColIndex].items = sourceItems;
      newColumns[destColIndex].items = destItems;
    }

    setColumns(newColumns);
    dispatch(updateColumns(newColumns));

    try {
      const res = await fetch("http://localhost:3001/api/boards/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: source.droppableId,
          to: destination.droppableId,
          fromIndex: source.index,
          toIndex: destination.index,
          itemId: draggableId,
        }),
      });
      if (!res.ok) console.error("Move API failed", await res.text());
    } catch (err) {
      console.error("Move API error:", err);
    }
  };

  const handleAddTaskSubmit = async () => {
    if (!newTaskTitle.trim()) return;

    // Build data in /boards API format
    const payload = {
      name: "My First Board",
      columns: [
        { title: newTaskTitle, status: newTaskStatus }
      ],
    };

    // Optimistic UI update
    const newColumnsState = columns.map((col) =>
      col.name === newTaskStatus
        ? {
            ...col,
            items: [
              ...col.items,
              { _id: Date.now().toString(), title: newTaskTitle, status: newTaskStatus }
            ],
          }
        : col
    );
    setColumns(newColumnsState);
    dispatch(updateColumns(newColumnsState));

    try {
      // POST API using new format
      const res = await fetch(
        `http://localhost:3001/api/boards/My First Board/tasks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        console.error("Add Task API failed", await res.text());
      } else {
        const updatedBoard = await res.json();
        // Sync frontend with backend
        setColumns(
          updatedBoard.columns.map((col) => ({
            id: col._id,
            name: col.title,
            items: col.tasks.map((task) => ({ ...task, _id: task._id })),
          }))
        );
        dispatch(updateColumns(updatedBoard.columns));
      }
    } catch (err) {
      console.error("Add Task API error:", err);
    }

    setShowPopup(false);
    setNewTaskTitle("");
    setNewTaskStatus(columns[0]?.name || "");
  };

  if (!columns || columns.length === 0)
    return <div className="text-center mt-10 text-gray-500">Loading...</div>;

  return (
    <div className="flex flex-col items-center mt-10 gap-6">
      <button
        className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition"
        onClick={() => setShowPopup(true)}
      >
        + Add Task
      </button>

      <div className="bg-gray-50 p-8 rounded-3xl shadow-2xl w-full max-w-7xl">
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex justify-center gap-8">
            {columns.map((col) => (
              <Droppable key={String(col.id)} droppableId={String(col.id)}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`bg-white rounded-2xl p-6 min-h-[400px] w-80 flex-shrink-0 shadow-xl transition-all duration-200 ${
                      snapshot.isDraggingOver ? "bg-blue-50" : ""
                    }`}
                  >
                    <h2 className="text-2xl font-bold mb-4 text-center">{col.name}</h2>

                    {col.items && col.items.length > 0 ? (
                      col.items.map((item, index) => (
                        <Draggable key={String(item._id)} draggableId={String(item._id)} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`bg-gray-100 p-4 rounded-xl mb-4 shadow-md cursor-grab transition-all duration-200 ${
                                snapshot.isDragging ? "bg-blue-100 shadow-2xl scale-105" : ""
                              }`}
                              style={{
                                ...provided.draggableProps.style,
                                zIndex: snapshot.isDragging ? 50 : "auto",
                              }}
                            >
                              {item.title}
                            </div>
                          )}
                        </Draggable>
                      ))
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg text-center text-gray-400">
                        Drop tasks here
                      </div>
                    )}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-96">
            <h3 className="text-xl font-bold mb-4">Add New Task</h3>
            <input
              type="text"
              className="border p-2 rounded w-full mb-4"
              placeholder="Task Title"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
            <select
              className="border p-2 rounded w-full mb-4"
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value)}
            >
              {columns.map((col) => (
                <option key={col.id} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setShowPopup(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600"
                onClick={handleAddTaskSubmit}
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
