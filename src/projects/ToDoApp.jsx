import { useState } from "react";
import { IoMdCheckboxOutline } from "react-icons/io";
import { MdCheckBoxOutlineBlank } from "react-icons/md";

const ToDoApp = () => {
  const [inputVal, setInputVal] = useState("");
  const [taskList, setTaskList] = useState([]);

  const handleVal = (e) => setInputVal(e.target.value);

  const handleClick = (e) => {
    if (e.key !== "Enter" || !inputVal.trim()) return;

    setTaskList([...taskList, { text: inputVal, completed: false }]);
    setInputVal("");
  };

  const toggleComplete = (index) => {
    setTaskList((prevTasks) =>
      prevTasks.map((task, i) =>
        i === index ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return (
    <div className="w-full">
      <header className="mb-10">
        <h1 className="mb-4 text-2xl">
          DOIT<span className="text-sky-400">NOW</span>
        </h1>
        <input
          type="text"
          value={inputVal}
          onChange={handleVal}
          onKeyDown={handleClick}
          placeholder="Add a task..."
          className="p-2 border rounded"
        />
      </header>
      <main className="flex gap-4 items-center flex-col w-full">
        {taskList.map((task, index) => (
          <div
            key={index}
            className="py-2 px-4 text-xl bg-gray-900/50 w-full flex justify-between items-center rounded-md border shadow-xl hover:bg-gray-800/50 hover:shadow-2xl transition-all duration-300 border-gray-700"
          >
            <p className={task.completed ? "line-through text-gray-500" : ""}>
              {task.text}
            </p>
            <span
              className={`cursor-pointer transition-all duration-50 ${
                task.completed ? "text-green-500" : ""
              }`}
              onClick={() => toggleComplete(index)}
            >
              {task.completed ? (
                <IoMdCheckboxOutline />
              ) : (
                <MdCheckBoxOutlineBlank />
              )}
            </span>
          </div>
        ))}
      </main>
    </div>
  );
};

export default ToDoApp;
