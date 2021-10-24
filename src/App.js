import { HashRouter as Router, Route, Switch } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import Board from "./components/Board";
import Dashboard from "./components/Dashboard";
import { CssBaseline } from "@mui/material";
import ViewQuestion from "./components/ViewQuestion";
import Drawer from "./components/Drawer";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import Console from "./components/Console";

function App() {
  const { user, isAuthenticated, getAccessTokenSilently, logout } = useAuth0();

  const mainTheme = createTheme({
    palette: {
      board: {
        bg: "#243E36",
        text: "#ff0025",
      },
      primary: {
        main: "#1E1E1E",
      },
      secondary: {
        main: "#20262D",
        text: "#CCCCCC",
      },
      available: {
        main: "#5FBB97",
        backDrop: "#BAA7B080",
        text: "#FFFFFF",
      },
      done: {
        main: "#E00000",
        backDrop: "#E0000080",
        text: "#FFFFFF",
      },
      shown: {
        main: "#5DA9E9",
        backDrop: "#5DA9E980",
        text: "#FFFFFF",
      },
      breadcrumbs: {
        current: "#f1f1f1",
        past: "#8f8f8f",
      },
    },
    overrides: {
      root: {
        padding: "25px",
      },
    },
  });

  useEffect(() => {}, [getAccessTokenSilently, user?.sub]);

  return (
    <ThemeProvider theme={mainTheme}>
      <CssBaseline />
      <Router>
        <Switch>
          <Route exact path="/">
            <Board />
          </Route>
          <Route exact path="/dashboard/console">
            {isAuthenticated ? <Console /> : <Drawer loggedout />}
          </Route>
          <Route exact path="/dashboard">
            {isAuthenticated ? <Dashboard /> : <Drawer loggedout />}
          </Route>
          <Route exact path="/dashboard/add">
            {isAuthenticated ? <ViewQuestion /> : <Drawer loggedout />}
          </Route>
          <Route exact path="/dashboard/view/:id">
            {isAuthenticated ? <ViewQuestion /> : <Drawer loggedout />}
          </Route>
          <Route exact path="/logout">
            {() => {
              logout({redirectTo: "https://ivanplease.github.io/harcmiliada-front/#/dashboard"});
              return null;
            }}
          </Route>
        </Switch>
      </Router>
    </ThemeProvider>
  );
}

export default App;
