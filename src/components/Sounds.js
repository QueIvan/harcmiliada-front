import { Button } from "@mui/material";
import React, { Component } from "react"
import io from "socket.io-client"

export default class Sounds extends Component {

    socket = io("https://harcmiliada-socket.herokuapp.com");

    componentDidMount() {
        const audioEl1 = document.getElementsByClassName("audio-element")[0]
        const audioEl2 = document.getElementsByClassName("audio-element")[1]
    
        const listenForCommands = () => {
            this.socket.on("recieveCommand", (data) => {
                console.log("Got it")
                if(data.type === "correctAnswer") {
                    audioEl1.play()
                } else if (data.type === "wrongAnswer") {
                    audioEl2.play()
                }
            });
        };
    
        const initiateSocket = (room) => {
            console.log(`Connecting socket...`);
            if (this.socket && room) this.socket.emit("join", room);
        };

        initiateSocket("sound_boards")
        listenForCommands()

    }

    componentWillUnmount() {
        
        const disconnectSocket = () => {
            console.log("Disconnecting socket...");
            if (this.socket) this.socket.disconnect();
        };

        disconnectSocket()
    }

  render() {
    return (
      <div>
        <audio className="audio-element">
            <source src="https://www.mboxdrive.com/correct.mp3"></source>
        </audio>
        <audio className="audio-element">
          <source src="https://www.mboxdrive.com/error.mp3"></source>
        </audio>
        <Button>Let's go</Button>
      </div>
    )
  }
}