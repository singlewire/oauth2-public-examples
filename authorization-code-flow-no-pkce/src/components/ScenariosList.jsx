import React, { useEffect, useState } from "react";
import Scenario from "./Scenario";

const ScenariosList = ({ token }) => {
  const [scenarios, setScenarios] = useState([]);

  useEffect(() => {
    fetch('/api/scenarios',
            {
              headers: {
                  'authorization': 'Bearer ' + token,
              }
    }).then((response) => response.json())
      .then((data) => {
        const scenarios = data.data.map((scenario) => ({
          name: scenario.name,
          id: scenario.id,
        }));
        setScenarios(scenarios);
      })
      .catch((e) => {
        console.error(e);
      });
  }, [token]);

  return (
    <ul>
      {scenarios.length > 0 &&
        scenarios.map((scenario) => (
          <Scenario key={scenario.id} scenario={scenario} token={token} />
        ))}
    </ul>
  );
};

export default ScenariosList;
