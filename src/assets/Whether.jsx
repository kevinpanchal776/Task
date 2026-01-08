import React, { useState } from "react";
import  { Box,Container, Typography, Paper, TextField, Button } from "@mui/material";
import axios from "axios";

function Whether() {
    const [city, setCity] = useState("");
    const [weatherData, setWeatherData] = useState(null);

    const handleSubmit = () =>{
        if(!city){
            alert("enter a city name");
            return;
        }

        const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
        const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

        axios.get(url)
        .then((res)=>{
            setWeatherData(res.data);
            console.log(res.data)
        })
        .catch((err)=>{
            console.log("err")
        })
    }
    return (
        <Box sx={{
            minHeight:"100vh",
            background : "linear-gradient(to right,#74ebd5,#ACB6E5)",
            display:"flex",
            flexDirection:"column"
        }}>
            <Container maxWidth="sm" sx={{mt : 8}}>
                <Paper elevation={6} sx={{padding:4,borderRadius:3}}>
                    <Typography variant="h5" gutterBottom align="center">
                        check the weather
                    </Typography>

                    <Box sx={{display:"flex",flexDirection:"column",gap:2}}>
                        <TextField
                        label = "Enter a city "
                        variant="outlined"
                        value={city}
                        onChange={(e)=>setCity(e.target.value)}
                        fullWidth
                        />

                        <Button variant="contained" onClick={handleSubmit}>
                            Get weather
                        </Button>

                        {weatherData && (
                            <Box sx={{mt:3,textAlign:"center"}}>
                                <Typography variant="h6">
                                    {weatherData.location.name},{weatherData.location.region}
                                </Typography>
                                <Typography>
                                    {weatherData.location.country}
                                </Typography>
                                <Typography variant="h4" sx={{mt:1}}>
                                    {weatherData.current.temp_c}°C
                                </Typography>
                                <img src={weatherData.current.condition.icon}
                                alt="Weather Icon"
                                style={{marginTop:"10px"}}
                                />
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    )
}
export default Whether