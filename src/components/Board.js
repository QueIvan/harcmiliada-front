import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import io from 'socket.io-client';
import {
  Box as MuiBox,
  Grid,
  Grid as MuiGrid,
  Typography as MuiTypography,
  Fade,
} from "@mui/material";
import { useHistory } from "react-router";

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

const HeaderContent = styled(MuiTypography)(({ theme }) => ({
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
  width: "90%",
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  fontSize: "1rem",
  fontWeight: "bold",
  textShadow: "0px 0px 10px rgba(0, 82, 64, 1)",
}));

const IdTypography = styled(MuiTypography)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  padding: "5px 35px",
  backgroundColor: "#00FFC580",
  borderRadius: "50%",
  fontSize: "1.25rem",
  fontWeight: "bold",
  textShadow: "0px 0px 10px rgba(0, 82, 64, 1)",
  boxShadow: "0px 0px 10px 0px #005240",
}));

function AnswerBox(props) {
  const label = props.children;
  const checked = props.checked;
  const id = props.visibleId;
  return (
    <GridItem item>
      <AnswerLabel id={id} checked={checked} />
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
        <BodyTypography>{label}</BodyTypography>
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
        <Grid sx={{ boxShadow: "inset 0px 0px 10px 0px #005240" }} item xs={12}>
          {id && id ? <IdTypography>{id}</IdTypography> : null}
        </Grid>
      </Grid>
    </Fade>
  );
}

function changePort(port){
  var portValue = parseInt(port);
  portValue += (portValue === 65535) ? -1:1;
  return portValue.toString();
}

export default function Dashboard() {
  console.log(process.env.PORT)
  const host = "https://harcmiliada.herokuapp.com/";
  const webSocketHost = "https://harcmiliada-front.herokuapp.com:" + changePort(process.env.PORT);
  const [question, setQuestion] = useState({});
  const [reload, setReload] = useState(false);
  const history = useHistory();
  
  let socket = io(webSocketHost);

  const initiateSocket = (room) => {
    console.log(`Connecting socket...`);
    console.log(webSocketHost)
    if (socket && room) socket.emit('join', room);
  }

  const disconnectSocket = () => {
    console.log('Disconnecting socket...');
    if(socket) socket.disconnect();
  }

  const listenForCommands = () => {
    socket.on('recieveCommand', (data) => {
      if(data === "toggleAnswer"){
        handleSetReload();
      }else if(data === "toggleQuestion"){
        history.push("/empty")
        history.push("/")
      }
    })
  }

  const handleSetReload = () => {
    setReload(!reload);
  }

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
    }

  }, [reload]);

  return (
    <BackBox>
      <GridOuterContainer container>
        <GridHeader item container sx={{ marginBottom: "15px" }}>
          <HeaderContent>
            {question.content ? question.content : null}
          </HeaderContent>
        </GridHeader>
        <GridBody item container>
          <GridRow item container>
            {question.answers && question.answers.length > 0 ? (
              <AnswerBox
                id={question.answers[0].id}
                visibleId={1}
                checked={question.answers[0].checked}
              >
                <AnswerContent
                  value={question.answers[0].points}
                  checked={question.answers[0].checked}
                >
                  {question.answers[0].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
            {question.answers && question.answers.length > 5 ? (
              <AnswerBox
                id={question.answers[5].id}
                visibleId={6}
                checked={question.answers[5].checked}
              >
                <AnswerContent
                  value={question.answers[5].points}
                  checked={question.answers[5].checked}
                >
                  {question.answers[5].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
          </GridRow>
          <GridRow item container>
            {question.answers && question.answers.length > 1 ? (
              <AnswerBox
                id={question.answers[1].id}
                visibleId={2}
                checked={question.answers[1].checked}
              >
                <AnswerContent
                  value={question.answers[1].points}
                  checked={question.answers[1].checked}
                >
                  {question.answers[1].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
            {question.answers && question.answers.length > 6 ? (
              <AnswerBox
                id={question.answers[6].id}
                visibleId={7}
                checked={question.answers[6].checked}
              >
                <AnswerContent
                  value={question.answers[6].points}
                  checked={question.answers[6].checked}
                >
                  {question.answers[6].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
          </GridRow>
          <GridRow item container>
            {question.answers && question.answers.length > 2 ? (
              <AnswerBox
                id={question.answers[2].id}
                visibleId={3}
                checked={question.answers[2].checked}
              >
                <AnswerContent
                  value={question.answers[2].points}
                  checked={question.answers[2].checked}
                >
                  {question.answers[2].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
            {question.answers && question.answers.length > 7 ? (
              <AnswerBox
                id={question.answers[7].id}
                visibleId={8}
                checked={question.answers[7].checked}
              >
                <AnswerContent
                  value={question.answers[7].points}
                  checked={question.answers[7].checked}
                >
                  {question.answers[7].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
          </GridRow>
          <GridRow item container>
            {question.answers && question.answers.length > 3 ? (
              <AnswerBox
                id={question.answers[3].id}
                visibleId={4}
                checked={question.answers[3].checked}
              >
                <AnswerContent
                  value={question.answers[3].points}
                  checked={question.answers[3].checked}
                >
                  {question.answers[3].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
            {question.answers && question.answers.length > 8 ? (
              <AnswerBox
                id={question.answers[8].id}
                visibleId={9}
                checked={question.answers[8].checked}
              >
                <AnswerContent
                  value={question.answers[8].points}
                  checked={question.answers[8].checked}
                >
                  {question.answers[8].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
          </GridRow>
          <GridRow item container>
            {question.answers && question.answers.length > 4 ? (
              <AnswerBox
                id={question.answers[4].id}
                visibleId={5}
                checked={question.answers[4].checked}
              >
                <AnswerContent
                  value={question.answers[4].points}
                  checked={question.answers[4].checked}
                >
                  {question.answers[4].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
            {question.answers && question.answers.length > 9 ? (
              <AnswerBox
                id={question.answers[9].id}
                visibleId={10}
                checked={question.answers[9].checked}
              >
                <AnswerContent
                  value={question.answers[9].points}
                  checked={question.answers[9].checked}
                >
                  {question.answers[9].content}
                </AnswerContent>
              </AnswerBox>
            ) : (
              <AnswerBox />
            )}
          </GridRow>
        </GridBody>
      </GridOuterContainer>
    </BackBox>
  );
}
