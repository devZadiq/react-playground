import { useState } from "react";

const AdjustableCounter = () => {
  const [count, setCount] = useState(0);
  const [adjustmentValue, setAdjustmentValue] = useState("");

  const adjustment = parseInt(adjustmentValue, 10) || 1;

  const incrementCount = () => {
    setCount((prevCount) => prevCount + adjustment);
  };

  const decrementCount = () => {
    setCount((prevCount) => prevCount - adjustment);
  };

  const resetCount = () => {
    setCount(0);
  };

  const handleAdjustmentChange = (e) => {
    setAdjustmentValue(e.target.value);
  };

  const clearAdjustmentOnEnter = (e) => {
    if (e.key === "Enter") {
      setAdjustmentValue("");
    }
  };

  return (
    <div className="card center flex-col">
      <h1 className="heading secondCard">
        Count:
        <span className="bg-white/90 p-1 rounded border-b border-slate-400 ">
          {count}
        </span>
      </h1>
      <input
        type="number"
        value={adjustmentValue}
        onKeyDown={clearAdjustmentOnEnter}
        onChange={handleAdjustmentChange}
        placeholder="Enter adjustment value (or leave blank for 1)"
      />
      <div className="center gap-2">
        <button
          onClick={incrementCount}
          className="button bg-sky-500 hover:bg-sky-600"
        >
          Increment
        </button>
        <button
          onClick={decrementCount}
          className="button bg-red-500 hover:bg-red-600"
        >
          Decrement
        </button>
        <button
          onClick={resetCount}
          className="button bg-green-500 hover:bg-green-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default AdjustableCounter;
