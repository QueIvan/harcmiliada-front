import React, { useState, useEffect } from "react";
import { Grid, Typography, Tooltip } from "@mui/material";
import Drawer from "./Drawer";
import io from "socket.io-client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router";
import { useTheme } from "@mui/system";

export default function Console() {
  const theme = useTheme();
  const host = "https://harcmiliada.herokuapp.com/";
  const history = useHistory();
  const [question, setQuestion] = useState({});
  const [reload, setReload] = useState(false);

  const handleSetReload = () => {
    setReload(!reload);
  }

  const crumbs = {
    past: [{ path: "/dashboard", label: "Pulpit" }],
    current: "Konsola kontrolna",
  };

  const listenForCommands = () => {
    socket.on('recieveCommand', (data) => {
      handleSetReload()
    })
  }

  let socket = io("http://localhost:4001");

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

  const toggleChecked = (id, commandType) => {
    fetch("https://harcmiliada.herokuapp.com/questions/answers/" + id, {
      method: "PUT",
    })
      .then(() => {
        sendCommand(commandType);
        history.push({ pathname: "/empty" });
        history.replace({ pathname: "/dashboard/console" });
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetch(host + "questions/current")
      .then((response) => response.json())
      .then((json) => {
        setQuestion(json);
      })
      .catch((err) => console.log(err));

    initiateSocket("consoles");

    listenForCommands();

    return () => {
      disconnectSocket();
    };
  }, [reload]);

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
            sx={{ textAlign: "center", marginBottom: "1.25rem" }}
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
                        onClick={() =>
                          toggleChecked(
                            row.id,
                            "toggleAnswer"
                          )
                        }
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
                                alignItems: "center",
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
              : null}
          </Grid>
        </Grid>
      ) : null}
    </Drawer>
  );
}
