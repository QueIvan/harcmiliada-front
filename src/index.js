import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <Auth0Provider
    domain="dev-6x5bsznk.us.auth0.com"
    clientId="w9oZIPZyRhMrvdaGo0xwf585KtwtfuBT"
    redirectUri={window.location.origin + "/#/dashboard"}
  >
    <App />
  </Auth0Provider>,
  document.getElementById("root")
);
reportWebVitals();
