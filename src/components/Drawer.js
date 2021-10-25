import React from "react";
import { ThemeProvider, useTheme } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { styled } from "@mui/system";
import {
  Box,
  Link,
  List,
  Zoom,
  Toolbar,
  Tooltip,
  IconButton,
  ListItemIcon,
  ListItemText,
  AppBar as MuiAppBar,
  Drawer as MuiDrawer,
  Divider as MuiDivider,
  Typography as MuiTypography,
  ListItem as MuiListItem,
  CssBaseline,
} from "@mui/material";
import BreadCrumbs from "./BreadCrumbs/BreadCrumbs";
import {
  faClipboardList,
  faTachometerAlt,
  faChalkboard,
  faSignInAlt,
  faSignOutAlt,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth0 } from "@auth0/auth0-react";
import { useHistory } from "react-router";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(0, 1),
  "&>*": {
    color: "#fff",
  },
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const DrawerFooter = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  width: "100%",
  position: "absolute",
  bottom: "0",
  left: "0",
  backgroundColor: "#6a676726",
  "&:hover": {
    backgroundColor: "#ffffff26",
  },
  "&>button": {
    marginLeft: "auto",
    marginRight: "auto",
  },
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const StyledDrawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "& > .MuiDrawer-paper": {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.text,
  },
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const Icons = styled(FontAwesomeIcon)(({ theme }) => ({
  color: theme.palette.secondary.text,
}));

const Divider = styled(MuiDivider)(({ theme }) => ({
  borderColor: theme.palette.primary,
  width: "90%",
  marginLeft: "auto",
  marginRight: "auto",
}));

const Typography = styled(MuiTypography)(({ theme }) => ({
  marginLeft: "auto",
  marginRight: "auto",
}));

const ListItem = styled(MuiListItem)(({ theme }) => ({
  paddingTop: ".75rem",
  paddingBottom: ".75rem",
  "&:hover": {
    backgroundColor: "#6a676726 !important",
  },
}));

const StyledLink = styled(Link)(({ theme }) => ({
  color: theme.palette.secondary.text,
  textDecoration: "none",
}));

export default function Drawer(content) {
  const theme = useTheme();
  const { logout, loginWithRedirect } = useAuth0();
  const history = useHistory();

  const navDest = [
    {
      label: "Pulpit",
      icon: faTachometerAlt,
      linkDest: "/dashboard",
      toNew: false,
    },
    {
      label: "Konsola",
      icon: faClipboardList,
      linkDest: "/dashboard/console",
      correction: "3px",
      toNew: false,
    },
    {
      label: "Przejdz do tablicy",
      icon: faChalkboard,
      linkDest: "/harcmiliada-front",
      toNew: true,
    },
  ];

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerOpen = () => {
    if (!content.loggedout) {
      setDrawerOpen(true);
    }
  };

  const handleDrawerClose = () => {
    if (!content.loggedout) {
      setDrawerOpen(false);
    }
  };

  const handleLogin = () => {
    loginWithRedirect({redirectUri: "http://localhost:3000/dashboard" });
  };

  const handleLogOut = () => {
    logout({ returnTo: "http://localhost:3000/dashboard" });
  };

  const handleMove = (dest, toNew) => {
    if (!toNew) {
      history.push(dest);
    } else {
      window.open(window.location.origin + dest, "_blank");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AppBar position="fixed" open={drawerOpen}>
          <Toolbar sx={{ paddingRight: "10px !important" }}>
            <Typography
              component="div"
              sx={{ flexGrow: 1, display: { xs: "none", sm: "block" } }}
            ></Typography>
            <Tooltip
              title={content.loggedout ? "Zaloguj się" : "Wyloguj się"}
              arrow
              TransitionComponent={Zoom}
              placement="right"
            >
              <IconButton
                sx={{
                  marginLeft: "10px",
                  marginRight: "5px",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                }}
                onClick={() =>
                  content.loggedout ? handleLogin() : handleLogOut()
                }
              >
                <FontAwesomeIcon
                  size="xs"
                  color="#CCCCCC"
                  icon={content.loggedout ? faSignInAlt : faSignOutAlt}
                />
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <StyledDrawer variant="permanent" open={drawerOpen}>
          <DrawerHeader />
          <Divider />
          <List>
            {navDest.map((obj, index) => (
              <Tooltip
                key={index}
                title={!drawerOpen ? obj.label : ""}
                arrow
                TransitionComponent={Zoom}
                placement="right"
              >
                <StyledLink
                  sx={{
                    pointerEvents: !content.loggedout || obj.toNew ? "auto" : "none",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    handleMove(
                      !content.loggedout || obj.toNew ? obj.linkDest : "/",
                      obj.toNew
                    )
                  }
                >
                  <ListItem alignItems="center">
                    <ListItemIcon sx={{ marginLeft: "10px" }}>
                      <Icons
                        sx={{
                          marginLeft: obj.correction ? obj.correction : "0px",
                        }}
                        icon={obj.icon}
                      />
                    </ListItemIcon>
                    <ListItemText primary={obj.label} />
                  </ListItem>
                </StyledLink>
              </Tooltip>
            ))}
          </List>
          <Box
            alignContent="center"
            sx={{
              cursor: "pointer",
              pointerEvents: !content.loggedout ? "auto" : "none",
            }}
            onClick={drawerOpen ? handleDrawerClose : handleDrawerOpen}
          >
            <DrawerFooter>
              <IconButton>
                <Icons
                  size="xs"
                  icon={drawerOpen ? faChevronLeft : faChevronRight}
                />
              </IconButton>
            </DrawerFooter>
          </Box>
        </StyledDrawer>
        <Box
          component="main"
          sx={{
            p: 3,
            flexGrow: 1,
            backgroundColor: theme.palette.board.bg,
            minHeight: "100vh",
            overflowY: "auto",
          }}
        >
          <DrawerHeader />
          {content.crumbs ? <BreadCrumbs crumbs={content.crumbs} /> : null}
          {content.children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
