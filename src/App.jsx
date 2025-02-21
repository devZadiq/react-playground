import ToDoApp from "./projects/ToDoApp";

const App = () => {
  return (
    <div className="bg-gray-950">
      <div className="py-6 px-4 h-screen h-min-[100dvh] max-w-[450px] mx-auto bg-gray-950 text-slate-50 font-lato">
        <ToDoApp />
      </div>
    </div>
  );
};

export default App;
