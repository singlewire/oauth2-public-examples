# Singlewire Example App Integrations
This repository contains three simple example programs Singlewire has provided to help you add authentication code to your application. You can use these programs to authenticate integrations with InformaCast. The basic layout of the authorization-code-flow apps follows the conventions of the [create-react-app](https://create-react-app.dev/) template.

Since we're using node and express here, it adds a little complexity to the request flow (i.e., requiring server-side API calls). Additional information about those specifics can be found [here](https://medium.com/@madelinecorman/making-http-requests-in-node-js-16fe74af0a79).

## Example Programs
In the simplest example, [client-credentials-flow](client-credentials-flow), we show how a simple command-line app can interact with an app created in the Administrative Console to send scenarios from an authorized external system. See that example's [readme](client-credentials-flow/README.md) for detailed instructions.

The second example, [authorization-code-flow-no-pkce](authorization-code-flow-no-pkce), uses an interactive interface to allow users to authorize any generic app with given scopes configured via the Administrative Console. See that example's [readme](authorization-code-flow-no-pkce/README.md) for detailed instructions.

The third example, [authorization-code-flow-with-pkce](authorization-code-flow-with-pkce), is the same as the previous example but requires a PKCE exchange rather than relying on stored Client_ID and Client_Secrets. This is the best practice for code that will be distributed and could be decompiled (like a native app on mobile or desktops). See that example's [readme](authorization-code-flow-with-pkce/README.md) for detailed instructions.

Each of these examples show:

- The configuration steps to take within InformaCast's interface, the Administrative Console
- How to get an access token to interact with the InformaCast server
- How to use the access token to fetch a list of scenarios
- How to use the access token to send a scenario notification

Once you've authenticated and granted the app access via appropriate scopes, you'll have access to the full range of API access that each scope conveys. 

Note: Access this document to create an app using the InformaCast interface, and to learn how scopes are granted.
https://documentation.singlewire.com/fusion/staging/fusion/en/about-applications.html#create-an-application


## Troubleshooting

### User Denied Access
**Message:** 
"User denied Access" with a corresponding 304 response saying "Your InformaCast Administrator has not enabled the usage of this application." (use a network capture to view the response)

Indicates:
You must enable the app from the InformaCast user interface:
1. From the Administrative Console, type **Applications** in the Search Menu.
2. In the left navigation pane, click **Applications**.
3. Find your application on the Applications List page.
4. Next to the Status column, click the **Enable** link.

**Note:** You may also encounter a “User Denied Access” error if you have declined permissions during the authorization flow.

### Invalid redirection url provided
**Message:**
“Invalid redirection URL provided."

Upon completing the log-in workflow, you are not redirected to the app and receive that error message. If the URL shows http://localhost:8080/oauth, you must log in via the Ngrok portal (_myname_.ngrok.io). You MUST use the Ngrok redirect to authenticate these apps correctly.

If the error specifies an Ngrok URI, ensure the redirect URI for your application includes the `/oauth` path and matches the URI specified in the error. Also, be sure to specify the correct client ID and client secret for your app.

## Scopes
The following scopes can be granted, with one or both **read** or **write**. **Write** implies create, delete, and update permissions. (e.g., `urn:singlewire:scenarios:read`, or `urn:singlewire:scenario-notifications:write`):

* ALARMS
* AREAS-OF-INTEREST
* BELL-SCHEDULES
* COLLABORATION-GROUPS
* CONFIRMATION-REQUESTS
* DISTRIBUTION-LISTS
* INCIDENT-PLANS
* NOTIFICATIONS
* NOTIFICATION-PROFILES
* MESSAGE-TEMPLATES
* REPORTS
* RING-LISTS
* SCENARIO-NOTIFICATIONS
* SESSION
* SITES
* SITES-ROLES
* TRACKING-EVENTS
* USERS

Refer to [this document](scopes.json) for a consumable JSON file with allowable scopes and verbs.

## Refreshing Tokens
Not covered in these example apps is the need to request renewed access and refresh tokens after users' initial logins. Generally, the flow we expect the apps to implement is consistent with a standard [access](https://oauth.net/2/access-tokens/)/[refresh](https://oauth.net/2/refresh-tokens/) token exchange when a user is actively using your application. If the user omits this refresh logic, they will be logged out when the access token expires (usually reasonably quickly—around 5 minutes after the initial token was issued), and need to provide their credentials again. When implemented correctly, refreshing these tokens behind the scenes improves the user experience.

Applications should manage access tokens to check the access token expiration when it will used to make a request, then first make a `POST` request using the refresh token to the `/api/token` endpoint with the following parameters, then store and use the newly created access token in the original request:
```code
POST /api/token HTTP/1.1
Host: https://api.icmobile.singlewire.com/api/token

grant_type=refresh_token
&refresh_token=GEbRxBN...edjnXbL
&client_id=eKNjzFFjH9A1ysYd
&client_secret=lfaldfjladNfl (optional)
```
(note the `grant_type=refresh_token`)

The response will contain a new access token and a new refresh token. Store or cached each for use in future requests. You can use each _refresh token_ only once. Use this new access token until it is about to expire. Then you may repeat the process.

```code
{
  "access_token": "eyJz93a...k4laUWw",
  "refresh_token": "3877341f...511ec723",
  "token_type": "Bearer",
  "scope": "urn:singlewire:ring-lists:read urn:singlewire:message-templates:write",
  "expires": 3600
}
```
The expiration of those tokens is specified in the `exp` field in each token (in milliseconds from epoch, encoded in [JWT](https://jwt.io) format). As shown above, the expiration of the new access token is also returned in the `expires` field of the response. Requests made using an access token after it has expired will be denied, and refresh requests after the refresh token expires will be rejected with a 401 `bad_token` response, and the user will need to log in again to get a new refresh token. Those refresh tokens also have a finite lifespan before the user MUST log in again.

When a user logs out or wants to end a session, your app should make a DELETE request to invalidate the current refresh tokens via the `/session` API endpoint.
