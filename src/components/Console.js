import React, {useState, useEffect} from 'react'
import { Grid, Typography, Tooltip } from '@mui/material'
import Drawer from './Drawer'

export default function Console() {
    const host = "https://harcmiliada.herokuapp.com/";
    const [question, setQuestion] = useState({});
    const [reload] = useState(false);
    const  crumbs={ past: [
        { path: "/dashboard", label: "Pulpit" }
    ], current: "Konsola kontrolna" }

    useEffect(() => {
      fetch(host + "questions/current")
        .then((response) => response.json())
        .then((json) => {
          setQuestion(json);
        })
        .catch((err) => console.log(err));
    }, [reload]);

    return (
        <Drawer crumbs={crumbs}>
            {question ? 
            <Grid container sx={{backgroundColor: "#fff", width: "100%", borderRadius: "5px"}}>
                <Grid item xs={12} sx={{textAlign: "center", padding: "1rem 1.75rem", marginBottom: "1.25rem"}}>
                    <Tooltip title={<React.Fragment>
                        <Typography sx={{fontSize: ".85rem"}}>ID: {question.id}</Typography>
                        <Typography sx={{fontSize: ".85rem", textAlign: "center"}}>Treść: {question.content}</Typography>
                    </React.Fragment>
                    } arrow placement="top">
                        <Typography sx={{fontWeight: "bold", fontSize: "1.35rem", marginBottom: ".25rem"}}>Panel kontrolny tablicy</Typography>
                    </Tooltip>
                </Grid>
                <Grid item container>
                    
                </Grid>
            </Grid>:null}
        </Drawer>
    )
}
