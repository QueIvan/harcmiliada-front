import React, { useState, useEffect } from "react";
import { Grid, Typography, Tooltip, Box as MuiBox, Box, Skeleton } from "@mui/material";
import Drawer from "./Drawer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faTimes } from "@fortawesome/free-solid-svg-icons";
import { styled, useTheme } from "@mui/material/styles";
import io from "socket.io-client";

const WrongBoxContainer = styled(MuiBox)(({ theme }) => ({
  display: "flex",
  gap: "50px",
  flexDirection: "row",
  justifyContent: "center",
}));

const WrongBox = styled(MuiBox)(({ theme }) => ({
  width: "40px",
  height: "40px",
  border: "2.5px solid",
  borderRadius: "5px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  cursor: "pointer",
  transition: "0.25s ease-out",
  "&>*": {
    textShadow: "0px 0px 10px #7c7c7c",
  },
}));

function Wrong(props) {
  const theme = useTheme();
  const checked = props.checked;
  const clickHandler = props.clickHandler;

  return (
    <WrongBox
      onClick={clickHandler}
      sx={{
        borderColor: checked
          ? theme.palette.done.main
          : theme.palette.available.main,
        color: checked ? theme.palette.done.main : theme.palette.available.main,
        boxShadow: checked
          ? "0px 0px 10px 0px #7c7c7c, inset 0px 0px 10px 0px #7c7c7c"
          : "",
        "&:hover": {
          borderColor: checked
            ? theme.palette.done.main
            : theme.palette.done.backDrop,
          color: checked
            ? theme.palette.done.main
            : theme.palette.done.backDrop,
          boxShadow: "0px 0px 10px 0px #7c7c7c, inset 0px 0px 10px 0px #7c7c7c",
        },
      }}
    >
      <FontAwesomeIcon size="2x" icon={faTimes} />
    </WrongBox>
  );
}

export default function Console() {
  const theme = useTheme();
  const host = "https://harcmiliada.herokuapp.com/";
  const [question, setQuestion] = useState({});
  const [showContent, setShowContent] = useState([false, false]);
  const [checked, setChecked] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  const [reload, setReload] = useState(false);

  const socket = io("https://harcmiliada-socket.herokuapp.com");

  const handleSetReload = () => {
    setReload(!reload);
  };

  const listenForCommands = () => {
    socket.on("recieveCommand", (data) => {
      handleSetReload();
    });
  };

  const crumbs = {
    past: [{ path: "/dashboard", label: "Pulpit" }],
    current: "Konsola kontrolna",
  };

  const initiateSocket = (room) => {
    console.log(`Connecting socket...`);
    if (socket && room) socket.emit("join", room);
  };

  const disconnectSocket = () => {
    console.log("Disconnecting socket...");
    if (socket) socket.disconnect();
  };

  const sendCommand = (type) => {
    socket.emit("sendCommand", type, ["boards", "lists"]);
  };

  const toggleAnswer = (id) => {
    let dummy = { ...question };
    dummy.answers.forEach((el) => {
      if (el.id === id) {
        el.checked = !el.checked;
      }
    });
    setQuestion(dummy);
  };

  const toggleChecked = (id, commandType) => {
    fetch("https://harcmiliada.herokuapp.com/questions/answers/" + id, {
      method: "PUT",
    })
      .then(() => {
        sendCommand(commandType);
        toggleAnswer(id);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {

    document.title = 'Harcmiliada | Panel Sterowania';

    setChecked([false, false, false, false, false, false]);

    fetch(host + "questions/current")
      .then((response) => response.json())
      .then((json) => {
        setQuestion(json);
      })
      .catch((err) => console.log(err));

    initiateSocket("consoles");

    listenForCommands();

    socket.emit("sendCommand", { type: "wrongAnswer", counter: [0, 0] }, ["boards"]);

    return () => {
      disconnectSocket();
    };
  }, [reload]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleShowContent = (id) => {
    let dummy = [ ...showContent ];
    dummy[id] = !dummy[id];
    setShowContent(dummy);
    socket.emit("sendCommand", { type: "displayContent", contentStatus: dummy }, ["boards"]);
  }

  const handleCounterAddition = (checks) => {
    let sideCounter = [0, 0];
    checks.forEach((el, key) => {
      if (key < 3) {
        if (el) {
          sideCounter[0]++;
        }
      } else {
        if (el) {
          sideCounter[1]++;
        }
      }
    });

    socket.emit("sendCommand", { type: "wrongAnswer", counter: sideCounter }, [
      "boards",
    ]);
  };

  const checkedHandler = (id, side) => {
    let checks = [...checked];
    checks[id] = !checks[id];
    setChecked(checks);
    handleCounterAddition(checks);
  };

  return (
    <Drawer crumbs={crumbs}>
      {question ? (
        <Grid
          container
          sx={{
            backgroundColor: "#fff",
            padding: "1rem 1.75rem",
            width: "100%",
            borderRadius: "5px",
          }}
        >
          <Grid
            item
            xs={12}
            sx={{ textAlign: "center", marginBottom: ".75rem" }}
          >
            <Tooltip
              title={
                <React.Fragment>
                  <Typography sx={{ fontSize: ".85rem" }}>
                    ID: {question.id}
                  </Typography>
                  <Typography sx={{ fontSize: ".85rem", textAlign: "center" }}>
                    Treść: {question.content}
                  </Typography>
                </React.Fragment>
              }
              arrow
              placement="top"
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "1.35rem",
                  marginBottom: ".25rem",
                }}
              >
                Panel kontrolny tablicy
              </Typography>
            </Tooltip>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              textAlign: "center",
              marginBottom: ".75rem",
              paddingBottom: ".25rem",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Typography
              sx={{
                fontVariant: "small-caps",
                fontSize: "1.15rem",
                marginBottom: ".25rem",
                fontWeight: "550",
              }}
            >
              Kontroler błędnych odpowiedzi
            </Typography>
          </Grid>
          <Grid
            container
            sx={{
              marginBottom: "1.25rem",
              justifyContent: "center",
              gap: "50px",
            }}
          >
            <Grid item xs={3}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  sx={{
                    fontVariant: "small-caps",
                    fontSize: "1.05rem",
                    marginBottom: ".5rem",
                    textAlign: "center",
                  }}
                >
                  Strona lewa
                </Typography>
                <WrongBoxContainer>
                  <Wrong
                    checked={checked[0]}
                    clickHandler={() => checkedHandler(0, 0)}
                  />
                  <Wrong
                    checked={checked[1]}
                    clickHandler={() => checkedHandler(1, 0)}
                  />
                  <Wrong
                    checked={checked[2]}
                    clickHandler={() => checkedHandler(2, 0)}
                  />
                </WrongBoxContainer>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <Typography
                  sx={{
                    fontVariant: "small-caps",
                    fontSize: "1.05rem",
                    marginBottom: ".5rem",
                    textAlign: "center",
                  }}
                >
                  Strona prawa
                </Typography>
                <WrongBoxContainer>
                  <Wrong
                    checked={checked[3]}
                    clickHandler={() => checkedHandler(3, 1)}
                  />
                  <Wrong
                    checked={checked[4]}
                    clickHandler={() => checkedHandler(4, 1)}
                  />
                  <Wrong
                    checked={checked[5]}
                    clickHandler={() => checkedHandler(5, 1)}
                  />
                </WrongBoxContainer>
              </Box>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              textAlign: "center",
              marginBottom: ".75rem",
              paddingBottom: ".25rem",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Typography
              sx={{
                fontVariant: "small-caps",
                fontSize: "1.15rem",
                marginBottom: ".25rem",
                fontWeight: "550",
              }}
            >
              Kontroler wyświetlania zawartości
            </Typography>
          </Grid>
          <Grid
            container
            sx={{
              marginBottom: "1.25rem",
              justifyContent: "center",
              gap: "50px",
            }}
          >
            <Grid item xs={4} sx={{display: 'flex',justifyContent: 'center'}}>
              <Grid
                item
                sx={{
                  width: "75%",
                  padding: ".5rem .5rem",
                  backgroundColor: "#f1f1f1",
                  boxShadow: "0px 0px 5px #adadad",
                  cursor: "pointer",
                  transition: "background-color 0.25s ease-out",
                  "&:not(:nth-of-type(4n+1))": {
                    marginLeft: "25px",
                  },
                  "&:hover": {
                    backgroundColor: "#e5e5e5",
                  },
                }}
                onClick={() => handleShowContent(0)}
              >
                <Grid
                  container
                  sx={{
                    padding: ".75rem",
                    border: "5px solid ",
                    borderColor: showContent[0]
                      ? theme.palette.shown.main
                      : theme.palette.available.main,
                    boxShadow: "0px 0px 5px #adadad",
                  }}
                >
                  <Grid
                    item
                    xs={10}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    Wyświetl treść pytania
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={showContent[0] ? faEye : faEyeSlash}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={4} sx={{display: 'flex',justifyContent: 'center'}}>
              <Grid
                item
                sx={{
                  width: "75%",
                  padding: ".5rem .5rem",
                  backgroundColor: "#f1f1f1",
                  boxShadow: "0px 0px 5px #adadad",
                  cursor: "pointer",
                  transition: "background-color 0.25s ease-out",
                  "&:not(:nth-of-type(4n+1))": {
                    marginLeft: "25px",
                  },
                  "&:hover": {
                    backgroundColor: "#e5e5e5",
                  },
                }}
                onClick={() => handleShowContent(1)}
              >
                <Grid
                  container
                  sx={{
                    padding: ".75rem",
                    border: "5px solid ",
                    borderColor: showContent[1]
                      ? theme.palette.shown.main
                      : theme.palette.available.main,
                    boxShadow: "0px 0px 5px #adadad",
                  }}
                >
                  <Grid
                    item
                    xs={10}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    Wyświetl dostępny pytania
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <FontAwesomeIcon
                      icon={showContent[1] ? faEye : faEyeSlash}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid
            item
            xs={12}
            sx={{
              textAlign: "center",
              marginBottom: "1.75rem",
              paddingBottom: ".25rem",
              borderBottom: "1px solid rgba(224, 224, 224, 1)",
            }}
          >
            <Typography
              sx={{
                fontVariant: "small-caps",
                fontSize: "1.15rem",
                marginBottom: ".25rem",
                fontWeight: "550",
              }}
            >
              Kontroler wyświetlania pytań
            </Typography>
          </Grid>
          <Grid container sx={{ display: "flex", justifyContent: "center" }}>
            {question.answers
              ? question.answers.length > 0
                ? question.answers.map((row, key) => {
                    return (
                      <Grid
                        item
                        key={row.id}
                        sx={{
                          width: "calc(25% - 18.75px)",
                          padding: ".5rem .5rem",
                          backgroundColor: "#f1f1f1",
                          boxShadow: "0px 0px 5px #adadad",
                          cursor: "pointer",
                          marginBottom: "25px",
                          transition: "background-color 0.25s ease-out",
                          "&:not(:nth-of-type(4n+1))": {
                            marginLeft: "25px",
                          },
                          "&:hover": {
                            backgroundColor: "#e5e5e5",
                          },
                        }}
                        onClick={() => toggleChecked(row.id, "toggleAnswer")}
                      >
                        <Tooltip
                          title={"Ilość punktów: " + row.points}
                          arrow
                          placement="bottom"
                        >
                          <Grid
                            container
                            sx={{
                              padding: ".75rem",
                              border: "5px solid ",
                              borderColor: row.checked
                                ? theme.palette.shown.main
                                : theme.palette.available.main,
                              boxShadow: "0px 0px 5px #adadad",
                            }}
                          >
                            <Grid
                              item
                              xs={10}
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                              }}
                            >
                              {row.content}
                            </Grid>
                            <Grid
                              item
                              xs={2}
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                              }}
                            >
                              <FontAwesomeIcon
                                icon={row.checked ? faEye : faEyeSlash}
                              />
                            </Grid>
                          </Grid>
                        </Tooltip>
                      </Grid>
                    );
                  })
                : null
              : <Skeleton sx={{marginLeft: "auto", marginRight: "auto"}} width="90%"  height="85px" animation="wave" />}
          </Grid>
        </Grid>
      ) : <Skeleton sx={{marginLeft: "auto", marginRight: "auto"}} width="90%"  height="85px" animation="wave" />}
    </Drawer>
  );
}
