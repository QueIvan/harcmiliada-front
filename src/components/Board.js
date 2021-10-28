import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import io from "socket.io-client";
import {
  Box as MuiBox,
  Grid,
  Grid as MuiGrid,
  Typography as MuiTypography,
  Fade,
  Zoom,
  Box,
  Skeleton,
} from "@mui/material";
import { useHistory } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const BackBox = styled(MuiBox)(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  display: "flex",
  backgroundColor: theme.palette.board.bg,
  overflow: "hidden",
  alignItems: "center",
  justifyContent: "center",
}));

const GridOuterContainer = styled(MuiGrid)(({ theme }) => ({
  width: "75%",
  height: "75%",
}));

const GridHeader = styled(MuiGrid)(({ theme }) => ({
  width: "100%",
  height: "15%",
  display: "flex",
  alignContent: "center",
  justifyContent: "center",
}));

const HeaderContent = styled(MuiBox)(({ theme }) => ({
  color: "#f1f1f1",
  fontSize: "1.9rem",
  textShadow: "0px 0px 15px #f1f1f1",
  fontWeight: "bold",
}));

const GridBody = styled(MuiGrid)(({ theme }) => ({
  height: "85%",
  gap: "20px",
}));

const GridRow = styled(MuiGrid)(({ theme }) => ({
  height: "calc(20% - 20px)",
  gap: "50px",
  alignContent: "center",
  justifyContent: "center",
}));

const GridItem = styled(MuiGrid)(({ theme }) => ({
  width: "calc(50% - 25px)",
  height: "100%",
  position: "relative",
}));

const BodyContent = styled(MuiGrid)(({ theme }) => ({
  height: "100%",
}));

const BodyTypography = styled(MuiTypography)(({ theme }) => ({
  fontVariant: "small-caps",
  width: "90%",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  fontWeight: "bold",
  textShadow: "0px 0px 10px rgba(0, 82, 64, 1)",
}));

const IdTypography = styled(MuiTypography)(({ theme }) => ({
  padding: "5px 35px",
  backgroundColor: "#00FFC580",
  borderRadius: "50%",
  fontSize: "1.25rem",
  fontWeight: "bold",
  textShadow: "0px 0px 10px rgba(0, 82, 64, 1)",
  boxShadow: "0px 0px 10px 0px #005240",
}));

const WrongBoxContainer = styled(MuiBox)(({ theme }) => ({
  position: "absolute",
  display: "flex",
  gap: "50px",
  flexDirection: "column",
}));

const WrongBox = styled(MuiBox)(({ theme }) => ({
  width: "100px",
  aspectRatio: "1",
  border: "10px solid",
  borderColor: theme.palette.done.main,
  color: theme.palette.done.main,
  borderRadius: "5px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  boxShadow: "0px 0px 10px 0px #7c7c7c, inset 0px 0px 10px 0px #7c7c7c",
  "&>*": {
    textShadow: "0px 0px 10px #7c7c7c",
  },
}));

function AnswerBox(props) {
  const label = props.children;
  const checked = props.checked;
  const loading = props.loading;
  const id = props.visibleId;
  const status = props.status;

  return (
    <GridItem item>
      <AnswerLabel status={status} loading={loading} id={id} checked={checked} />
      <BodyContent>{label}</BodyContent>
    </GridItem>
  );
}

function AnswerContent(props) {
  const label = props.children;
  const value = props.value;
  const checked = props.checked;
  return (
    <Grid
      container
      sx={{
        display: checked ? "flex" : "none",
        height: "100%",
        textAlign: "center",
        border: "5px solid #00FFC5",
        boxShadow: "0px 0px 10px 0px #005240",
        backgroundColor: "#62929E",
        "&>.MuiGrid-root": {
          height: "100%",
          color: "#fff",
          position: "relative",
        },
      }}
    >
      <Grid sx={{ boxShadow: "inset 0px 0px 10px 0px #005240" }} item xs={10}>
        <BodyTypography sx={{ fontSize: "1.35rem" }}>
          {capitalizeFirstLetter(label)}
        </BodyTypography>
      </Grid>
      <Grid
        sx={{
          borderLeft: "5px solid #00FFC5",
          boxShadow: "inset 0px 0px 10px 0px #005240",
        }}
        item
        xs={2}
      >
        <BodyTypography>{value}</BodyTypography>
      </Grid>
    </Grid>
  );
}

function AnswerLabel(props) {
  const id = props.id;
  const checked = props.checked;
  const loading = props.loading;
  const status = props.status;

  return (
    <Fade in={!checked}>
      <Grid
        container
        sx={{
          position: "absolute",
          top: 0,
          zIndex: 999,
          height: "100%",
          textAlign: "center",
          border: "5px solid #00FFC5",
          boxShadow: "0px 0px 10px 0px #005240",
          backgroundColor: "#62929E",
          "&>.MuiGrid-root": {
            height: "100%",
            color: "#fff",
            position: "relative",
          },
        }}
      >
        <Grid sx={{ boxShadow: "inset 0px 0px 10px 0px #005240", display: "flex", justifyContent: "center", alignItems: "center"}} item xs={12}>
          {id && id ? (
            <Zoom in={status} timeout={100*id}>
              <IdTypography>{id}</IdTypography>
            </Zoom>
          ) : loading ? (
            <Skeleton
              sx={{ marginLeft: "auto", marginRight: "auto" }}
              width="90%"
              height="85px"
              animation="wave"
            />
          ) : null}
        </Grid>
      </Grid>
    </Fade>
  );
}

export default function Board() {
  const host = "https://harcmiliada.herokuapp.com/";
  const [question, setQuestion] = useState({});
  const [showContent, setShowContent] = useState([false, false]);
  const [sideCounter, setSideCounter] = useState([0, 0]);
  const [showError, setShowError] = useState(false);
  const [reload, setReload] = useState(false);
  const history = useHistory();

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
      if (data === "toggleAnswer") {
        handleSetReload();
      } else if (data === "toggleQuestion") {
        history.push("/empty");
        history.push("/");
      } else if (data.type === "wrongAnswer") {
        if((data.counter[0] > 0 || data.counter[1] > 0)){
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
            setTimeout(() => {
              setSideCounter(data.counter);
            }, 100)
          }, 500)
        }else{
          setSideCounter(data.counter);
        }
      } else if (data.type === "displayContent"){
        setShowContent(data.contentStatus)
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

    initiateSocket("boards");

    listenForCommands();

    return () => {
      disconnectSocket();
    };
  }, [reload]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <BackBox>
      <GridOuterContainer container>
        <GridHeader item container sx={{ marginBottom: "15px" }}>
          <HeaderContent sx={{ width: "90%", textAlign: "center" }}>
            {(showContent[0] && question.content) ? (
              <Fade in={true} timeout={1500}>
                <Box>{question.content}</Box>
              </Fade>
            ) : (
              <Skeleton
                sx={{ marginLeft: "auto", marginRight: "auto" }}
                width="90%"
                height="85px"
                animation="wave"
              />
             ) }
          </HeaderContent>
        </GridHeader>
        <GridBody item container>
          {Array.from(Array(5).keys()).map((el) => {
            return (
              <GridRow item container key={el}>
                {showContent[1] && question.answers && question.answers.length > el ? (
                  <AnswerBox
                    id={question.answers[el].id}
                    visibleId={el + 1}
                    status={showContent}
                    checked={question.answers[el].checked}
                  >
                    <AnswerContent
                      value={question.answers[el].points}
                      checked={question.answers[el].checked}
                    >
                      {question.answers[el].content}
                    </AnswerContent>
                  </AnswerBox>
                ) : (
                  <AnswerBox loading={!(showContent[1] && question.answers)} />
                )}
                {showContent[1] && question.answers && question.answers.length > el + 5 ? (
                  <AnswerBox
                    id={question.answers[el + 5].id}
                    visibleId={el + 6}
                    status={showContent}
                    checked={question.answers[el + 5].checked}
                  >
                    <AnswerContent
                      value={question.answers[el + 5].points}
                      checked={question.answers[el + 5].checked}
                    >
                      {question.answers[el + 5].content}
                    </AnswerContent>
                  </AnswerBox>
                ) : (
                  <AnswerBox loading={!(showContent[1] && question.answers)} />
                )}
              </GridRow>
            );
          })}
          ;
        </GridBody>
      </GridOuterContainer>
      <WrongBoxContainer sx={{ left: "50px" }}>
        {[...Array(sideCounter[0])].map((el) => {
          return (
            <Zoom in={true}>
              <WrongBox
                key={el}
                sx={{
                  aspectRatio:
                    sideCounter[1] === 3 && sideCounter[0] === 1 ? ".25" : "1",
                }}
              >
                <FontAwesomeIcon size="6x" icon={faTimes} />
              </WrongBox>
            </Zoom>
          );
        })}
      </WrongBoxContainer>
      <WrongBoxContainer sx={{ right: "50px" }}>
        {[...Array(sideCounter[1])].map((el) => {
          return (
            <Zoom in={true}>
              <WrongBox
                key={el+3}
                sx={{
                  aspectRatio:
                    sideCounter[0] === 3 && sideCounter[1] === 1 ? ".25" : "1",
                }}
              >
                <FontAwesomeIcon size="6x" icon={faTimes} />
              </WrongBox>
            </Zoom>
          );
        })}
      </WrongBoxContainer>
      <Box sx={{position:"absolute", top: "0", left: "0", display: "flex", width: "100vw", height: "100vh", zIndex: 9999, justifyContent: "center", alignItems: "center"}}>
        <Zoom in={showError}>
          <Box>
            <WrongBox
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "250px",
                aspectRatio: 1,
                zIndex: 99999,
                borderWidth: "1rem",
                boxShadow: "0px 0px 10px 0px #000, inset 0px 0px 10px 0px #000",
                "&>*": {
                  filter: "drop-shadow(0px 0px 10px #000)"
                },
              }}
            >
              <FontAwesomeIcon style={{fontSize: "15rem"}} icon={faTimes} />
            </WrongBox>
          </Box>
        </Zoom>
      </Box>
    </BackBox>
  );
}
