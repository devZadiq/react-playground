import WeatherApp from "./projects/WeatherApp";

const App = () => {
  return (
    <div className="bg-gray-100">
      <div className="py-6 px-4 h-min-[100dvh] max-w-[450px] mx-auto bg-gray-100 text-gray-800 font-lato">
        <WeatherApp />
      </div>
    </div>
  );
};

export default App;
