import { useEffect } from "react";

const WeatherApp = () => {
  useEffect(() => {
    const API_key = "14cb0031a73ffdbe5a61c7025e427dd7";
    let city_name = "Dhubri";
    const getData = async () => {
      const url = `https://api.openweathermap.org/data/2.5/find?q=${city_name}&appid=${API_key}
`;

      const response = await fetch(url);
      const data = await response.json();
      console.log(data);
    };

    getData();
  }, []);

  return <div>Wether</div>;
};
export default WeatherApp;
