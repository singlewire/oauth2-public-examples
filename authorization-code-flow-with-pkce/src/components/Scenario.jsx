import React, { useCallback, useState } from "react";

const Scenario = ({ scenario, token }) => {
  const [isBeingSent, setIsBeingSent] = useState(false);

  const onClickSendScenario = useCallback(() => {
    if (isBeingSent) return;
    setIsBeingSent(true);

    fetch(
      `/api/scenario-notifications?scenarioId=${scenario.id}`,
      {
        method: 'POST',
        headers: {
            'authorization': 'Bearer ' + token,
        }
      }
    )
      .then((response) => response.json())
      .then(() => {
        setIsBeingSent(false);
        alert("Scenario sent!");
      })
      .catch(() => {
        setIsBeingSent(false);
        alert("Scenario failed to send.");
      });
  }, [isBeingSent]);

  return (
    <li>
      <button aria-disabled={isBeingSent} onClick={onClickSendScenario}>
        {isBeingSent ? `Sending ${scenario.name}...` : `Send ${scenario.name}`}
      </button>
    </li>
  );
};

export default Scenario;
