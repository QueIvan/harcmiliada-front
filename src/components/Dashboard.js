import React, { useEffect, useState } from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  Box,
  TableBody,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import io from 'socket.io-client';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlusSquare,
  faTrashAlt,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router";
import Drawer from "./Drawer";

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const TypeBadge = styled("div")(({ theme, ...props }) => ({
  padding: ".35rem .75rem",
  fontSize: ".70rem",
  borderRadius: "5px",
  width: "60%",
  textAlign: "center",
  marginLeft: "auto",
  marginRight: "auto",
  color:
    props.type === "available"
      ? theme.palette.available.text
      : props.type === "done"
      ? theme.palette.done.text
      : theme.palette.shown.text,
  backgroundColor:
    props.type === "available"
      ? theme.palette.available.main
      : props.type === "done"
      ? theme.palette.done.main
      : theme.palette.shown.main,
  boxShadow:
    "3px 3px 0px 0px " +
    (props.type === "available"
      ? theme.palette.available.backDrop
      : props.type === "done"
      ? theme.palette.done.backDrop
      : theme.palette.shown.backDrop),
  "&:after": {
    content:
      "'" +
      capitalizeFirstLetter(
        props.type === "available"
          ? "dostępne"
          : props.type === "done"
          ? "skończone"
          : "wyświetlone"
      ) +
      "'",
  },
}));

function Row(props) {
  const row = props.data;
  const currentHandle = props.currentHandle;
  const editHandle = props.editHandle;
  const deleteHandle = props.deleteHandle;

  return (
    <TableRow key={row.id}>
      <TableCell
        component="th"
        scope="column"
        sx={{
          maxWidth: "75px",
          "&>*:not(:first-of-type)": { marginTop: ".45rem" },
        }}
      >
        <TypeBadge
          type={
            row.answers.every((value) => value.checked) ? "done" : "available"
          }
        />
        {row.current ? <TypeBadge type="shown" /> : null}
      </TableCell>
      <TableCell component="th" scope="row">
        <span style={{ marginLeft: "25px" }}>{row.content}</span>
      </TableCell>
      <TableCell align="center">{row.answers.length}</TableCell>
      <TableCell align="center">
        <Tooltip title="Wyświetl" arrow placement="bottom">
          <IconButton onClick={() => currentHandle(row.id)}>
            <FontAwesomeIcon size="xs" icon={faUpload} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edytuj" arrow placement="bottom">
          <IconButton onClick={() => editHandle(row.id)}>
            <FontAwesomeIcon size="xs" icon={faEdit} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Usuń" arrow placement="bottom">
          <IconButton onClick={() => deleteHandle(row.id)}>
            <FontAwesomeIcon size="xs" icon={faTrashAlt} />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

export default function Dashboard() {
  const host = "https://harcmiliada.herokuapp.com/";
  const [questions, setQuestions] = useState({});
  const history = useHistory();
  const [reload, setReload] = useState(false);

  const handleSetReload = () => {
    setReload(!reload);
  }

  const crumbs = { past: [], current: "Pulpit" };

  let socket = io('http://localhost:4001');

  const initiateSocket = (room) => {
    console.log(`Connecting socket...`);
    if (socket && room) socket.emit('join', room);
  }

  const disconnectSocket = () => {
    console.log('Disconnecting socket...');
    if(socket) socket.disconnect();
  }

  function moveToCreator() {
    history.push("/dashboard/add");
  }

  function moveToViewer(id) {
    history.push("/dashboard/view/" + id);
  }

  function deleteQuestion(id) {
    fetch("https://harcmiliada.herokuapp.com/questions/" + id, {
      method: "DELETE",
    })
      .then(() => {
        history.push({ pathname: "/empty" });
        history.replace({ pathname: "/dashboard" });
      })
      .catch((err) => console.log(err));
  }

  const listenForCommands = () => {
    socket.on('recieveCommand', (data) => {
      handleSetReload()
    })
  }

  function changeCurrentQuestion(id) {
    fetch("https://harcmiliada.herokuapp.com/questions/current/" + id, {
      method: "PUT",
    })
      .then(() => {
        socket.emit("sendCommand", "toggleQuestion", ["boards", "consoles"])
        history.push({ pathname: "/empty" });
        history.replace({ pathname: "/dashboard" });
      })
      .catch((err) => console.log(err));
  }

  const columns = [
    { id: "status", label: "" },
    { id: "content", label: "Treść", minWidth: "300px", align: "center" },
    { id: "answerCount", label: "Ilość odpowiedzi", align: "center" },
    {
      id: "options",
      label: (
        <Tooltip title="Dodaj pytanie" arrow placement="left">
          <IconButton onClick={moveToCreator}>
            <FontAwesomeIcon size="xs" icon={faPlusSquare} />
          </IconButton>
        </Tooltip>
      ),
      align: "center",
    },
  ];

  useEffect(() => {
    fetch(host + "questions")
      .then((response) => response.json())
      .then((json) => {
        setQuestions(json);
      })
      .catch((err) => console.log(err));

    initiateSocket("lists");

    listenForCommands();

    return () => {
      disconnectSocket();
    }
  }, [reload]);

  return (
    <Drawer crumbs={crumbs}>
      <Box
        sx={{
          padding: "25px",
        }}
      >
        <TableContainer component={Paper}>
          <Table stickyHeader aria-label="collapsible sticky table">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: "bold", fontSize: "1.25rem" }}
                  align="center"
                  colSpan={4}
                >
                  Lista Pytań
                </TableCell>
              </TableRow>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ top: 57, minWidth: column.minWidth }}
                    sx={{ fontSize: "1.1rem" }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {questions.length > 0 &&
                questions.map((question, key) => {
                  return (
                    <Row
                      editHandle={moveToViewer}
                      deleteHandle={deleteQuestion}
                      currentHandle={changeCurrentQuestion}
                      key={key}
                      data={question}
                    />
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Drawer>
  );
}
