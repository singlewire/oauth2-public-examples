import React, { useEffect, useState } from "react";
import ScenariosList from "./ScenariosList";

const generateCodeVerifier = () => {
  var text = "";
  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 128; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));
  return text;
};

const generateCodeChallenge = async (verifier) => {
  // https://datatracker.ietf.org/doc/html/rfc7636#section-4.2
  const data = new TextEncoder().encode(verifier);
  const digest = await window.crypto.subtle.digest("SHA-256", data);
  // JS's implementation of base64 encoding is weird, so we need to convert
  // this to a string first.
  const byteArr = Array.from(new Uint8Array(digest));
  return btoa(String.fromCodePoint(...byteArr))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

const Home = ({ token }) => {
  const [authURL, setAuthURL] = useState("");

  useEffect(() => {
    const codeChallenge = async () => {
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

        const verifier = generateCodeVerifier();
        const challenge = await generateCodeChallenge(verifier);
        url.searchParams.append("code_challenge", challenge);
        url.searchParams.append("code_challenge_method", "S256");
        window.sessionStorage.setItem(
          "informacast-example-app-code-verifier",
          verifier
        );

        setAuthURL(url.toString());
    }
    codeChallenge();
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
