require("dotenv").config();
const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../dist")));

const INFORMACAST_URI = process.env.INFORMACAST_URI;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.post("/api/token", (req, res) => {
  const code = req.query.code;
  const redirect_uri = req.query.redirect_uri;
  const verifier = req.query.verifier;
  if (!code || !verifier) {
    res.statusCode = 400;
    res.json(null);
    return;
  }

  const url = new URL(INFORMACAST_URI + "/token");
  url.searchParams.set("grant_type", "authorization_code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("client_secret", CLIENT_SECRET);
  url.searchParams.set("code", code);
  url.searchParams.set("code_verifier", verifier);
  url.searchParams.set("redirect_uri", redirect_uri);

  fetch(url, { method: "POST" }).then(async (response) => {
    const data = await response.json();
    res.statusCode = 200;
    res.json(data);
  });
});

app.get('/api/scenarios', (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    res.statusCode = 400;
    res.json('We need to send an access token in the authorization header');
    return;
  }

  const url = new URL(INFORMACAST_URI + "/v1/scenarios");
  fetch(url, {
    headers: {
      'authorization': token // it already has Bearer prepended
    }
  },
  )
   .then(async (response) => {
    const data = await response.json();
    res.statusCode = 200;
    res.json(data);
  });
});

app.post("/api/scenario-notifications", (req, res) => {
  const token = req.headers.authorization;
  const scenarioId = req.query.scenarioId;
  if (!token || !scenarioId) {
    res.statusCode = 400;
    res.json('We need to send an access token in the authorization header');
    return;
  }
  const url = new URL(INFORMACAST_URI + "/v1/scenario-notifications");
  fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authentication': token // it already has Bearer prepended
    },
    body: JSON.stringify({ scenarioId }),
  }).then(async (response) => {
    const data = await response.json();
    res.statusCode = 200;
    res.json(data);
  });
});

// We need this as express won't play nicely with React Router otherwise.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

const port = 8080;
app.listen(port);
console.log("App is listening on port " + port);
