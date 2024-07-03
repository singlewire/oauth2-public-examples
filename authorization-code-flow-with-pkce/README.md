# Example App using Authorization Code Flow, with PKCE

## Running the code

At a high level, we will need to do three things to get this code running:

- Configure a redirect endpoint
- Configure a third-party application in the Administrative Console
- Copy `.env_template` to `.env` and enter the third-party application credentials into the `.env` file
- Build and run the application

### Configure a redirect endpoint
For security, we do not allow localhost redirects for these apps (where InformaCast will redirect successful login requests once complete). Instead, we need to use an [ngrok](https://ngrok.com) redirect to the example app running locally.

Configure your public endpoint (something like _myname_.ngrok.io) so that it points at localhost:8080. The command should be similar to `ngrok http http://localhost:8080 --subdomain=myname`

### Configuring the Example Third-Party App

1. From the Administrative Console, open the "Applications" page. You can find this page by searching for "Applications" in the search field in the sidebar.
2. Click the "Create Application" button.
3. Fill in the required fields on the page:
   1. Fill in the name field with your name of choice.
   2. Choose an application type of `Generic Client`.
   3. **Make sure the "Require Proof Key for Code Exchange (PKCE)" checkbox is ON.**
   4. Enter a random short description.
   5. Enter a redirect URI of "https://myname.ngrok.io/oauth".
   6. Add the scopes `urn:singlewire:scenario-notifications:write` and `urn:singlewire:scenarios:read`.
4. Click "Save", and then click the Edit button on the new application row to see the credentials created for the application (under the credentials tab).
5. IMPORTANT: The app must be ENABLED on your provider before it can be used. Navigate to the Applications List page and enable it.

### Populating the `.env` file with the App credentials

Copy the `.env_template` to a file called `.env`, then update the `.env` file's `CLIENT_ID` field with the Client ID given in the Application's Credentials tab of the Administrative Interface. Do the same for the `CLIENT_SECRET` field (don't modify the `.env_template`).

### Building and Running the App

You'll need to have `node` installed on your machine to run this example. Afterward, run `npm install` and then `npm start`, and the application should be up!

Navigate to https://myname.ngrok.io/ (where _myname_ is the ngrok domain you've set up) and you should see the UI for the Example Application and a Login button. Click it, authenticate, and you should be able to send a scenario. **Note: you must have preconfigured scenarios—with no questions—in order for this simple app to work.**

## How does it work?

If you aren't already familiar with how OAuth2 and PKCE works, we recommend you get a basic understanding of it first. The [RFC for OAuth](https://datatracker.ietf.org/doc/html/rfc6749) and [RFC for PKCE](https://datatracker.ietf.org/doc/html/rfc7636) are good and thorough resources. If you want a gentler introduction, Okta put up a good [high-level video](https://www.youtube.com/watch?v=996OiexHze0).

The application goes through the following steps:

1. When the user first lands on the app, they are navigated to the `Home.tsx` file. This renders a login button, which when clicked will navigate the user to InformaCast's login page. The following query parameters are passed along to the login page:
   - `client_id`: The Client ID of the application
   - `response_type`: This must equal `code`
   - `redirect_uri`: The URI to navigate the user to after the user login and gives consent for this application to read their InformaCast related data.
   - `state`: String containing state that will be passed back to the `redirect_uri`
   - `scopes`: The list of permissions the application is asking for
   - `code_challenge`: A string generated as described by [section 4.2 of the PKCE RFC](https://datatracker.ietf.org/doc/html/rfc7636#section-4.2).
   - `code_challenge_method`: The method used for generating the code challenge.
2. If the user gives consent for this application to read their data, the application will receive a code. `OAuthRedirect.tsx` then uses that code to get a token, by passing the code and the code verifier along to the `/api/token` endpoint defined in our `server/index.js`.
   - The application needs to have the server make requests on behalf of the client, because the Administrative Console currently does not allow specifying allowed origins.
   - The server will use the code and code verifier to make a request to the InformaCast token endpoint.
3. We can use that token to make requests to the server. This is shown in `ScenariosList.tsx` and `Scenarios.tsx`, where we make requests to the `/api/scenarios` and `/api/scenario-notifications` endpoint defined in `server/index.js`.

Note that this application is extremely simplified, and doesn't include error handling. You'll want to include error handling while making HTTP requests to make sure your client is robust.
