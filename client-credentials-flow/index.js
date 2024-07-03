const readline = require("node:readline");

const quitIfEmpty = (val, message) => {
  if (!val) {
    console.error(message);
    process.exit(1);
  }
};

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const AUDIENCE = process.env.AUDIENCE;
const API_ENDPOINT = process.env.INFORMACAST_URI;

// If you run into these errors, we most likely don't have all the
// environment variables we need to start. Make sure to edit
// test.sample.sh to set the variables we need.
quitIfEmpty(CLIENT_ID, "Client ID is empty.");
quitIfEmpty(CLIENT_SECRET, "Client secret is empty.");
quitIfEmpty(AUDIENCE, "Audience is empty.");
quitIfEmpty(API_ENDPOINT, "API endpoint is empty.");

const start = async () => {
  // The first step is to get an access token so we can make requests
  // to the API. The process for this is slightly different for server
  // and client applications. We'll show the process for server applications
  // here.
  const body = new FormData();
  body.set("client_id", CLIENT_ID);
  body.set("client_secret", CLIENT_SECRET);
  body.set("grant_type", "client_credentials");
  body.set("audience", AUDIENCE);
  const url = new URL(API_ENDPOINT + "/token");

  try {
    let response = await fetch(url,
                       {
                            method: "POST",
                            body,
                        }
    );
    // In a real application, you'll want to check the status code
    // after every HTTP request and make sure we are in good shape
    // to continue.
    // To keep things simple, we won't do any of those checks after this first request.
    const accessTokenData = await response.json();
    let token = null;
    if (response.ok) {
        token = accessTokenData.access_token;
    } else {
        console.error(response.status + ": " + response.statusText);
        process.exit(1);
    }

    // Uncomment this to verify that we have a token
    // console.log(token);

    // Okay - now that we have an access token, we'll need to set
    // that access token as a URL parameter on all future requests.
    const scenariosUrl = new URL(API_ENDPOINT + "/v1/scenarios");
    response = await fetch(scenariosUrl,
                {
                    headers: {
                        'authorization': 'Bearer ' + token,
                    }
                }
    );
    const scenarios = await response.json();

    // Nice! If we're here that means we were able to successfully fetch the list
    // of scenarios on this provider without issue. Let's ask the user to pick
    // a scenario so we can demonstrate how to send one.
    console.table(
      scenarios.data.map((scenario) => ({
        scenario_id: scenario.id,
        scenario_name: scenario.name,
      }))
    );
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      `Enter an index to send that scenario, or enter 'q' to quit: `,
      async (val) => {
        if (val.toLowerCase() === "q" || val.toLowerCase() === "quit") {
          rl.close();
          return;
        }

        const index = parseInt(val, 10);
        if (isNaN(index) || index > scenarios.data.length) {
          console.error("Invalid index.");
          rl.close();
          return;
        }

        // Okay, here is the fun part - actually sending a scenario!
        // As we did before, we'll need to set the access token in
        // the query parameters, in addition to a 'scenarioId' parameter.
        // Consult the API documentation for more information on this
        // and other APIs.
        console.log("Sending scenario: %s", scenarios.data[index].name);
        const scenariosNotificationsUrl = new URL(
          API_ENDPOINT + "/v1/scenario-notifications"
        );
        scenariosNotificationsUrl.searchParams.set("access_token", token);
        scenariosNotificationsUrl.searchParams.set(
          "scenarioId",
          scenarios.data[index].id
        );
        response = await fetch(scenariosNotificationsUrl, {
          method: "POST",
        });
        console.log("Success!");
        rl.close();
      }
    );
  } catch (e) {
    // If you get here, there was probably a network error that occured.
    // Assuming you're using the naked fetch in Node.js, anyway.
    // The semantics will vary depending on the language you're
    // using, as well as the API you're using to make HTTP requests.
    console.error("Something went wrong, aborting.", e);
    process.exit(1);
  }
};

start();
