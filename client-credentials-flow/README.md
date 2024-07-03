# Example App using Client Credentials Flow

## Running the code

At a high level, we will need to do three things to get this code running:

- Configure a third-party application in the Administrative Console
- Copy `start.sample.sh` to `start.sh` and enter the third-party application credentials into the `start.sh` file
- Invoke `./start.sh` on the command line to start the application

### Configuring the Example Third-Party App

1. From the Administrative Console, open the "Applications" page. You can find this page by searching for "Applications" in the search field in the sidebar.
2. Click the "Create Application" button.
3. Fill in the required fields on the page:
   1. Fill in the name field with your name of choice.
   2. Choose an application type of `Server`.
   3. Enter a random short description.
   4. The client credentials oauth flow doesn't require a Redirect URI, leave that blank. This is only required for the authorization-code-flow.
   5. Add the scopes `urn:singlewire:scenario-notifications:write` and `urn:singlewire:scenarios:read`.
4. Click "Save", and then enable the application.
5. Click the Edit button on the new application row to see the credentials created for the application (under the credentials tab).
6. IMPORTANT: The app must be ENABLED on your provider before it can be used. Navigate to the Applications List page and enable it.

### Populating the `start.sh` file with the App credentials

In the `start.sh` file, replace the `CLIENT_ID` field with the Client ID given in the Credentials tab. Do the same for the `CLIENT_SECRET` field.
Finally, you'll need to replace the `AUDIENCE` field with the ID of the provider the application is installed on. The provider ID is the first UUID in the address following `/icmobile/`, once you've logged into the provider. So for our example provider's home page: https://admin.icmobile.singlewire.com/icmobile/1986f678-bce1-11e8-b18d-0f0acbc9a0b9/#/home, the provider ID is `1986f678-bce1-11e8-b18d-0f0acbc9a0b9`.

### Building and Running the App

You'll need to have `node` installed on your machine ([Node.js](https://nodejs.org/en/download/package-manager) 20+ is recommended) to run this example. Afterward, run `start.sh` and the application should be up!

*Note: For this simple app, only scenarios without questions (or with pre-filled answers) will send correctly. Scenarios with questions will not send/return validation errors, and those are not checked (even though a success message will be displayed when the request is submitted).*
