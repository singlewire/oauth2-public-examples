import React, { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthRedirect = ({ setToken }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const getAccessToken = useCallback(async (code) => {
    const verifier = window.sessionStorage.getItem(
      "informacast-example-app-code-verifier"
    );
    window.sessionStorage.removeItem("informacast-example-app-code-verifier");

    const redirect_uri = window.location.origin + "/oauth";
    return fetch(
      `/api/token?code=${code}&verifier=${verifier}&redirect_uri=${redirect_uri}`,
      {
        method: "POST",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        return {
          accessToken: data.access_token,
        };
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      alert("User denied access.");
      navigate("/");
      return;
    }

    const code = searchParams.get("code");
    getAccessToken(code).then((data) => {
      if (data?.accessToken) {
        setToken(data.accessToken);
      }
      navigate("/");
    });
  }, []);

  return <div>Attempting to obtain token....</div>;
};

export default OAuthRedirect;
