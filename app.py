import json
import os
from flask import Flask, session, redirect, render_template, request, url_for, make_response
import workos
from flask_lucide import Lucide
from functools import wraps



# Flask Setup
app = Flask(__name__)
app.secret_key = os.getenv("APP_SECRET_KEY")
base_api_url = os.getenv("WORKOS_BASE_API_URL")
lucide = Lucide(app)

# WorkOS Setup
workos_client = workos.WorkOSClient(
    api_key=os.getenv("WORKOS_API_KEY"),
    client_id=os.getenv("WORKOS_CLIENT_ID"),
    base_url=base_api_url,
)

# Enter Organization ID here

CUSTOMER_ORGANIZATION_ID = ""  # Use org_test_idp for testing

cookie_password = os.getenv("WORKOS_COOKIE_PASSWORD")

def to_pretty_json(value):
    return json.dumps(value, sort_keys=True, indent=4)


app.jinja_env.filters["tojson_pretty"] = to_pretty_json

def with_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        session = workos_client.user_management.load_sealed_session(
            sealed_session=request.cookies.get("wos_session"),
            cookie_password=cookie_password,
        )
        auth_response = session.authenticate()
        if auth_response.authenticated:
            return f(*args, **kwargs)

        if (
            auth_response.authenticated == False
            and auth_response.reason == "no_session_cookie_provided"
        ):
            return make_response(redirect("/login"))

        # If no session, attempt a refresh
        try:
            print("Refreshing session")
            result = session.refresh()
            if result.authenticated == False:
                return make_response(redirect("/login"))

            response = make_response(redirect(request.url))
            response.set_cookie(
                "wos_session",
                result.sealed_session,
                secure=True,
                httponly=True,
                samesite="lax",
            )
            return response
        except Exception as e:
            print("Error refreshing session", e)
            response = make_response(redirect("/login"))
            response.delete_cookie("wos_session")
            return response

    return decorated_function

@app.route("/")
def login_successful():
    # directory_id = os.getenv("DIRECTORY_ID")

    session = workos_client.user_management.load_sealed_session(
        sealed_session=request.cookies.get("wos_session"),
        cookie_password=cookie_password,
    )
    response = session.authenticate()

    if response.authenticated:
        user = response.user
        return render_template("login_successful.html", first_name=user.first_name, last_name=user.last_name)
    else:
        return render_template("login.html")


@app.route("/auth/callback")
def auth_callback():

    code = request.args.get("code")

    try:
        auth_response = workos_client.user_management.authenticate_with_code(
            code=code,
            session={"seal_session": True, "cookie_password": cookie_password},
        )

        print("Successfully authenticated")

        # store the session in a cookie
        response = make_response(redirect("/"))
        response.set_cookie(
            "wos_session",
            auth_response.sealed_session,
            secure=True,
            httponly=True,
            samesite="lax",
        )
        return response

    except Exception as e:
        print("Error authenticating with code", e)
        return redirect(url_for("/login"))

@app.route("/login")
def login():
    redirect_uri = os.getenv("WORKOS_REDIRECT_URI")
    print("Using redirect URI:", redirect_uri)
    authorization_url = workos_client.user_management.get_authorization_url(
        provider="authkit", redirect_uri=os.getenv("WORKOS_REDIRECT_URI")
    )

    return redirect(authorization_url)

@app.route("/logout")
def logout():
    session = workos_client.user_management.load_sealed_session(
        sealed_session=request.cookies.get("wos_session"),
        cookie_password=cookie_password,
    )
    url = session.get_logout_url()

    # After log out has succeeded, the user will be redirected to your app homepage which is configured in the WorkOS dashboard
    response = make_response(redirect(url))
    response.delete_cookie("wos_session")

    return response


@app.route("/game")
@with_auth
def game_page():
    session = workos_client.user_management.load_sealed_session(
        sealed_session=request.cookies.get("wos_session"),
        cookie_password=cookie_password,
    )
    auth_response = session.authenticate()
    if auth_response.authenticated:
        user = auth_response.user
        return render_template("game.html", first_name=user.first_name, last_name=user.last_name)
    else:
        return redirect("/login")

if __name__ == "__main__":
    app.run(debug=True, port=3000)
