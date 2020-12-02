const express = require('express')
const fetch = require("node-fetch");
const app = express()
const port = 3000
const api_key = '52fd465732929bce2b208cdcf6b2c155'

// http://localhost:3000/weather/city?city=Moscow
app.get('/weather/city', (req, res) => {
    let city = req.query.city;
    res.set('Access-Control-Allow-Origin', '*')
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=metric' + '&appid=' + api_key).then(function (resp) {
        return resp.json()
    }).then(function (data) {
        res.send(data)
    })
})

// http://localhost:3000/weather/coordinates?lat=-8.7&long=115.21
app.get('/weather/coordinates', (req, res) => {
    let lat = req.query.lat;
    let lon = req.query.long;
    // res.send(`lat: ${lat}, long: ${lon}`)
    // -8.669786, 115.213571
    res.set('Access-Control-Allow-Origin', '*')
    fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&units=metric' + '&appid=' + api_key)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {
            res.send(data)
        })
})

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
