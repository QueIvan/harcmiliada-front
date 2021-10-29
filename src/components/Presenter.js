import React, {useState, useEffect} from "react";
import { styled } from "@mui/material/styles";
import { Box as MuiBox,
    Box,
    Fade,
    Skeleton,
} from "@mui/material";
import io from "socket.io-client";

const BackBox = styled(MuiBox)(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  display: "flex",
  backgroundColor: theme.palette.board.bg,
  overflow: "hidden",
  justifyContent: "center",
}));

const HeaderContent = styled(MuiBox)(({ theme }) => ({
  color: "#f1f1f1",
  fontSize: "1rem",
  marginTop: "150px",
}));

export default function Presenter() {
  const host = "https://harcmiliada.herokuapp.com/";
  const [question, setQuestion] = useState({});
  const [reload, setReload] = useState(false);
  const socket = io("https://harcmiliada-socket.herokuapp.com");

  const initiateSocket = (room) => {
    console.log(`Connecting socket...`);
    if (socket && room) socket.emit("join", room);
  };

  const disconnectSocket = () => {
    console.log("Disconnecting socket...");
    if (socket) socket.disconnect();
  };

  const listenForCommands = () => {
    socket.on("recieveCommand", (data) => {
      if (data === "toggleQuestion") {
        handleSetReload();
      }
    });
  };

  const handleSetReload = () => {
    setReload(!reload);
  };


  useEffect(() => {
    fetch(host + "questions/current")
      .then((response) => response.json())
      .then((json) => {
        setQuestion(json);
      })
      .catch((err) => console.log(err));

    initiateSocket("presenters");

    listenForCommands();

    return () => {
      disconnectSocket();
    };
  }, [reload]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BackBox>
      <HeaderContent sx={{ width: "90%", textAlign: "center" }}>
        {question ? (
          <Fade in={question} timeout={1500}>
            <Box>
              Pytanie 3211-231-111-213a:
              <Box
                sx={{
                  fontSize: "1.9rem",
                  fontWeight: "bold",
                  textShadow: "0px 0px 15px #f1f1f1",
                }}
              >
                {question.content}
              </Box>
            </Box>
          </Fade>
        ) : (
          <Skeleton
            sx={{ marginLeft: "auto", marginRight: "auto" }}
            width="90%"
            height="85px"
            animation="wave"
          />
        )}
      </HeaderContent>
    </BackBox>
  );
}