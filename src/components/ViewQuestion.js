import { Box, Typography, Grid, TextField, FormGroup } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import Drawer from "./Drawer";
import React, { useRef, useState, useEffect } from "react";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";

export default function ViewQuestion() {
  const host = "https://harcmiliada.herokuapp.com/";
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(false);
  const [current, setCurrent] = useState(false);
  const [answers, setAnswers] = useState([
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ]);
  const formRef = useRef(null);
  const history = useHistory();
  const { id } = useParams();

  const socket = io("https://harcmiliada-socket.herokuapp.com");

  const crumbs = {
    past: [{ path: "/dashboard", label: "Pulpit" }],
    current: "Kreator",
  };

  const handleClick = () => {
    formRef.current.requestSubmit();
  };

  const initiateSocket = (room) => {
    console.log(`Connecting socket...`);
    if (socket && room) socket.emit('join', room);
  }

  const disconnectSocket = () => {
    console.log('Disconnecting socket...');
    if(socket) socket.disconnect();
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(!loading);
    let obj = {
      current: current,
      content: content,
      answers: answers.filter((value) => Object.keys(value).length !== 0),
    };
    if (id) {
      obj["id"] = id;
    }
    fetch(host + "questions/", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      method: id ? "PUT" : "POST",
      body: JSON.stringify(obj),
    })
      .then(() => {
        socket.emit("sendCommand", "toggleQuestion", ["consoles"])
        if(current){
          socket.emit("sendCommand", "toggleQuestion", ["boards"])
        }
        history.push("/dashboard")
      })
      .catch((err) => console.log(err));
  };

  const handleAnswerContentSetting = (id, content) => {
    let answer = [...answers];
    answer[id]["content"] = content.target.value;
    setAnswers(answer);
  };

  const handleAnswerPointsSetting = (id, points) => {
    let answer = [...answers];
    answer[id]["points"] = points.target.value;
    setAnswers(answer);
  };

  useEffect(() => {
    if (id) {
      fetch(host + "questions/" + id)
        .then((response) => response.json())
        .then((json) => {
          if (json.id !== null) {
            let answer = new Array(10 - json.answers.length)
              .fill(null)
              .map(() => ({}));
            setContent(json.content);
            setAnswers([...json.answers, ...answer]);
            setCurrent(json.current);
          }
        })
        .catch((err) => console.log(err));
    }

    initiateSocket("viewer");

    listenForCommands();

    return () => {
      disconnectSocket();
    };
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  return (
    <Drawer crumbs={crumbs}>
      <Box
        sx={{
          padding: "25px",
        }}
      >
        {!id ||
        (content && answers.length > 0 && answers[0].content != null) ? (
          <Grid
            container
            sx={{
              backgroundColor: "#fff",
              borderRadius: "5px",
              padding: ".75rem 1.25rem",
            }}
          >
            <Grid
              item
              xs={12}
              sx={{
                textAlign: "center",
                padding: "1rem 1.75rem",
                marginBottom: "1.25rem",
              }}
            >
              <Typography sx={{ fontWeight: "bold", fontSize: "1.35rem" }}>
                Formularz dodawania pytań
              </Typography>
            </Grid>
            <form onSubmit={handleSubmit} ref={formRef}>
              <Grid item container sx={{ marginBottom: "1.25rem" }}>
                <Grid
                  item
                  xs={3}
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", fontSize: "1.15rem" }}>
                    Treść pytania
                  </Typography>
                </Grid>
                <Grid
                  item
                  xs={9}
                  sx={{ display: "flex", justifyContent: "center" }}
                >
                  <TextField
                    onChange={(e) => setContent(e.target.value)}
                    defaultValue={content ? content : null}
                    required
                    sx={{ width: "90%" }}
                    id="outlined-basic"
                    label="Wpisz treść pytania"
                    variant="outlined"
                  />
                </Grid>
              </Grid>
              <Grid container>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #1
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(0, e)}
                      defaultValue={answers[0].content}
                      required
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[0].points}
                      onChange={(e) => handleAnswerPointsSetting(0, e)}
                      required
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #2
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(1, e)}
                      defaultValue={answers[1].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[1].points}
                      onChange={(e) => handleAnswerPointsSetting(1, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #3
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(2, e)}
                      defaultValue={answers[2].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[2].points}
                      onChange={(e) => handleAnswerPointsSetting(2, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #4
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(3, e)}
                      defaultValue={answers[3].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[3].points}
                      onChange={(e) => handleAnswerPointsSetting(3, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #5
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(4, e)}
                      defaultValue={answers[4].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[4].points}
                      onChange={(e) => handleAnswerPointsSetting(4, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #6
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(5, e)}
                      defaultValue={answers[5].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[5].points}
                      onChange={(e) => handleAnswerPointsSetting(5, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #7
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(6, e)}
                      defaultValue={answers[6].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[6].points}
                      onChange={(e) => handleAnswerPointsSetting(6, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #8
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(7, e)}
                      defaultValue={answers[7].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[7].points}
                      onChange={(e) => handleAnswerPointsSetting(7, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #9
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(8, e)}
                      defaultValue={answers[8].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[8].points}
                      onChange={(e) => handleAnswerPointsSetting(8, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
                <Grid item container sx={{ marginBottom: "1.25rem" }}>
                  <Grid
                    item
                    xs={3}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      sx={{ fontWeight: "bold", fontSize: "1.15rem" }}
                    >
                      Odpowiedź #10
                    </Typography>
                  </Grid>
                  <Grid
                    item
                    xs={7}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      onChange={(e) => handleAnswerContentSetting(9, e)}
                      defaultValue={answers[9].content}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Wpisz treść odpowiedzi"
                      variant="outlined"
                    />
                  </Grid>
                  <Grid
                    item
                    xs={2}
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <TextField
                      inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                      defaultValue={answers[9].points}
                      onChange={(e) => handleAnswerPointsSetting(9, e)}
                      sx={{ width: "90%" }}
                      id="outlined-basic"
                      label="Podaj ilość punktów za pytanie"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid
                item
                container
                justifyContent="end"
                sx={{ paddingLeft: "0 !important" }}
              >
                <FormGroup>
                  <LoadingButton
                    loading={loading}
                    loadingPosition="start"
                    startIcon={<FontAwesomeIcon icon={faSave} />}
                    variant="contained"
                    onClick={() => handleClick()}
                    sx={{
                      width: "fit-content",
                      backgroundColor: "#243E36",
                      "&:hover": { backgroundColor: "#20262D" },
                    }}
                  >
                    Dodaj
                  </LoadingButton>
                </FormGroup>
              </Grid>
            </form>
          </Grid>
        ) : null}
      </Box>
    </Drawer>
  );
}
