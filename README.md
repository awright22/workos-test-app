# workos-test-app

An example Flask application demonstrating how to use the [WorkOS Python SDK](https://github.com/workos/workos-python) to authenticate users via SSO and use a Directory.

## Prerequisites

- Python 3.6+

## Flask Project Setup

1. Clone the main git repo for these Python example apps using your preferred secure method (HTTPS or SSH).

   ```bash
   # HTTPS
   $ git clone git@github.com:awright22/workos-test-app.git
   ```

   or

   ```bash
   # SSH
   $ git clone git@github.com:awright22/workos-test-app.git
   ```

2. Navigate to the sso app within the cloned repo.

   ```bash
   $ cd workos-test-app
   ```

3. Create and source a Python virtual environment. You should then see `(env)` at the beginning of your command-line prompt.

   ```bash
   $ python3 -m venv env
   $ source env/bin/activate
   (env) $
   ```

4. Install the cloned app's dependencies.

   ```bash
   (env) $ pip install -r requirements.txt
   ```

5. Obtain and make note of the following values. In the next step, these will be set as environment variables.

   - Your [WorkOS API key](https://dashboard.workos.com/api-keys)
   - Your [SSO-specific, WorkOS Client ID](https://dashboard.workos.com/configuration)

6. Ensure you're in the root directory for the example app, `workos-test-app/`. Create a `.env` file to securely store the environment variables. Open this file with the Nano text editor. (This file is listed in this repo's `.gitignore` file, so your sensitive information will not be checked into version control.)

   ```bash
   (env) $ touch .env
   (env) $ nano .env
   ```

7. Once the Nano text editor opens, you can directly edit the `.env` file by listing the environment variables:

   ```bash
   WORKOS_API_KEY=<value found in step 6>
   WORKOS_CLIENT_ID=<value found in step 6>
   APP_SECRET_KEY=<any string value you\'d like>
   ```

   To exit the Nano text editor, type `CTRL + x`. When prompted to "Save modified buffer", type `Y`, then press the `Enter` or `Return` key.

8. Source the environment variables so they are accessible to the operating system.

   ```bash
   (env) $ source .env
   ```

   You can ensure the environment variables were set correctly by running the following commands. The output should match the corresponding values.

   ```bash
   (env) $ echo $WORKOS_API_KEY
   (env) $ echo $WORKOS_CLIENT_ID
   ```

9. In `workos-test-app/app.py` change the `CUSTOMER_ORGANIZATION_ID` string value to the organization you will be testing the login for. This can be found in your WorkOS Dashboard.

10. The final setup step is to start the server.

```bash
(env) $ flask run
```

If you are using macOS Monterey, port 5000 is not available and you'll need to start the app on a different port with this slightly different command.

```bash
(env) $ flask run -p 5001
```

You'll know the server is running when you see no errors in the CLI, and output similar to the following is displayed:

```bash
* Tip: There are .env or .flaskenv files present. Do "pip install python-dotenv" to use them.
* Environment: production
WARNING: This is a development server. Do not use it in a production deployment.
Use a production WSGI server instead.
* Debug mode: off
* Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

Navigate to `localhost:5000`, or `localhost:5001` depending on which port you launched the server, in your web browser. You should see a "Login" button. If you click this link, you'll be redirected to an HTTP `404` page because we haven't set up SSO yet!

You can stop the local Flask server for now by entering `CTRL + c` on the command line.

## SSO Setup with WorkOS

Follow the [SSO authentication flow instructions](https://workos.com/docs/sso/guide/introduction) to set up an SSO connection.

When you get to the step where you provide the `REDIRECT_URI` value, use http://localhost:5000/auth/callback.

If you get stuck, please reach out to us at support@workos.com so we can help.

## Directory Sync Setup with WorkOS
1. Follow the [Create a New Directory Connection](https://workos.com/docs/directory-sync/guide/create-new-directory-connection) step in the WorkOS Directory Sync guide.

2. Next we need to add the DIRECTORY_ID environment variable to our `.env` file. 

3. Navigate to the [WorkOS dashboard](dashboard.workos.com/), then go to Organizations -> select the desired Organization, and click "View Directory" under "User provisioning".

4. Copy the Directory Id.

2. In command line, ensure you're in the root directory for the example app, `workos-test-app/`. Use nano to edit the `.env` file

   ```bash
   (env) $ nano .env
   ```

7. Once the Nano text editor opens, add the DIRECTORY_ID environment variable the `.env` file:

   ```bash
   DIRECTORY_ID=<directory id from step 4>
   ```

   To exit the Nano text editor, type `CTRL + x`. When prompted to "Save modified buffer", type `Y`, then press the `Enter` or `Return` key.

## Testing the Integration

11. Naviagte to the `workos-test-app` directory. Source the virtual environment we created earlier, if it isn't still activated from the steps above. Start the Flask server locally.

```bash
$ cd ~/Desktop/workos-test-app/
$ source env/bin/activate
(env) $ flask run
```

Once running, navigate to `localhost:5000`, or `localhost:5001` depending on which port you launched the server, to test out the SSO workflow.

Hooray!

## Need help?

If you get stuck and aren't able to resolve the issue by reading our API reference or tutorials, you can reach out to us at support@workos.com and we'll lend a hand.
