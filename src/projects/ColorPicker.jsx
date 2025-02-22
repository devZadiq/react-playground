const availableColors = [
  { name: "Soft White", hex: "#F8F9FA" },
  { name: "Cloud Gray", hex: "#ECEFF1" },
  { name: "Muted Beige", hex: "#F5F5F5" },
  { name: "Pale Ivory", hex: "#FAF3E0" },
  { name: "Light Mist", hex: "#E3E6E8" },
  { name: "Soft Lilac", hex: "#EAE6FF" },
  { name: "Pastel Mint", hex: "#E3F8E3" },
  { name: "Sky Blue", hex: "#E6F7FF" },
  { name: "Blush Pink", hex: "#FFE6E9" },
  { name: "Warm Peach", hex: "#FFECD6" },
  { name: "Serene Lavender", hex: "#F2EBFA" },
  { name: "Cool Aqua", hex: "#DFF6F0" },
  { name: "Muted Rose", hex: "#F9E4E6" },
  { name: "Soft Sand", hex: "#F4EDE7" },
  { name: "Pearl Gray", hex: "#E8E8E8" },
];

const ColorPicker = () => {
  const hex = "#e1e1e1";
  const changeColor = ({ name, availableColors }) => {};
  return (
    <div className="w-full h-full ">
      <div className="coloredDiv  rounded-2xl  w-full h-full shadow-xl  ">
        <div
          style={{ backgroundColor: hex || "white" }}
          className="h-20 rounded-2xl border-b border-black/20"
        ></div>
      </div>
      <div className="sideBar  bg-slate-100   w-full h-10 grid grid-cols-3 my-8  ">
        {availableColors.map(({ name, hex }) => (
          <div
            style={{ backgroundColor: hex }}
            className={`w-full  px-2 aspect-video shadow-sm center hover:-translate-y-1 hover:shadow-md   hover:saturate-200 transition-all duration-300`}
            key={Math.random()}
            value={name}
            onClick={changeColor(availableColors)}
          >
            <span>{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
