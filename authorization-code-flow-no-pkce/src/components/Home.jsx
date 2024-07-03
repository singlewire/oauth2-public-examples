import React, { useEffect, useState } from "react";
import ScenariosList from "./ScenariosList";

const Home = ({ token }) => {
  const [authURL, setAuthURL] = useState("");

  useEffect(() => {
    const url = new URL(INFORMACAST_URI + "/authorize");
    const redirect_uri = window.location.origin + "/oauth";

    url.searchParams.append("client_id", CLIENT_ID);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("redirect_uri", redirect_uri);
    url.searchParams.append("state", "standard_oauth");
    const scopes = [
      "urn:singlewire:scenarios:read",
      "urn:singlewire:scenario-notifications:write",
      "offline_access"
    ];
    url.searchParams.append("scope", scopes.join(" "));
    setAuthURL(url.toString());
  }, []);

  return (
    <main>
      <h1>Example Application</h1>
      {token ? (
        <ScenariosList token={token} />
      ) : (
        <button onClick={() => (window.location.href = authURL.toString())}>
          Login
        </button>
      )}
    </main>
  );
};

export default Home;
