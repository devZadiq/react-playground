import { useEffect, useState } from "react";

const UseEffect = () => {
  // useState hook to create a state variable 'data' initialized as an empty array
  const [data, setData] = useState([]);

  /*
    useEffect hook is used to perform side effects in functional components.
    By providing an empty dependency array ([]), this effect runs only once after the component mounts. if given a dependencies, it will change as dependencies change
  */
  useEffect(() => {
    // Define an asynchronous function to fetch data
    async function getData() {
      // Fetch posts
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts"
      );
      const data = await response.json();

      // Update state if data is available and is an array with items
      if (data && data.length) setData(data);
    }

    // Call the asynchronous function immediately to fetch data
    getData();
  }, []); // Empty dependency array ensures the effect runs only once

  return (
    <div className="container mx-auto p-4">
      {/* Display total number of posts */}
      <p className="text-lg font-medium mb-6">There are: {data.length} posts</p>

      <div className="grid grid-cols-1 gap-6">
        {data.map(({ id, title, body }) => (
          <div
            key={id}
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{title}</h3>
              <p className="text-gray-700">{body}</p>
            </div>
            <div className="px-4 pb-4 flex justify-end">
              <button className="text-blue-500 hover:text-blue-600 font-medium">
                Read More
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UseEffect;
