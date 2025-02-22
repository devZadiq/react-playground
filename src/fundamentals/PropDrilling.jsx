import PDrillA from "../components/PDrillA";

/*
  Prop Drilling Explanation:
  --------------------------
  "Prop drilling" refers to the process of passing data from a parent component down
  to deeply nested child components through props. In the example below, the variable
  "name" is defined in the PropDrilling component and is passed down to PDrillA.

  Consider a component hierarchy like this:

               PropDrilling
                    |
                    |  name="Hazrat"
                    v
                 PDrillA
                    |
                    |  (if further props were passed)
                    v
                 PDrillB
                    |
                    |  (if further props were passed)
                    v
                 PDrillC  (where "name" might eventually be used)

  In cases where many components are nested, prop drilling can become unwieldy and hard to manage.
  To solve this, React provides the Context API, which allows you to share data without explicitly
  passing props through every level. For more details on that approach, refer to the ContextApi.jsx file.
*/

const PropDrilling = () => {
  const name = "Hazrat";
  return (
    <div>
      <PDrillA name={name} />
      {/*
        Here, the prop "name" is passed to PDrillA.
        If PDrillA needs to pass the same prop further down to its children (e.g., to PDrillB and then PDrillC),
        this is a typical example of prop drilling. For large component trees, consider using the Context API.
      */}
    </div>
  );
};

export default PropDrilling;
