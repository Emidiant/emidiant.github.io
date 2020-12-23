const express = require('express');
const fetch = require("node-fetch");
const app = express();
const port = 8080;
const cors = require('cors');

const apiKey = '52fd465732929bce2b208cdcf6b2c155';
const openWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';
const db = require('./db');

app.use(cors())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    res.setHeader('Accept-Charset', 'utf-8')
    next();
});


app.get('/weather/city', (req, res) => {
    let city = req.query.city;
    city = encodeURI(city);
    fetch(openWeatherUrl + '?q=' + city + '&units=metric' + '&appid=' + apiKey).then(function (resp) {
        if (resp.status === 200) {
            return resp.json()
        } else {
            return res.sendStatus(404)
        }
    }).then(function (data) {
        res.send(data)
    })
})


app.get('/weather/coordinates', (req, res) => {
    let lat = req.query.lat;
    let lon = req.query.long;
    fetch(openWeatherUrl + '?lat=' + lat + '&lon=' + lon + '&units=metric' + '&appid=' + apiKey)
        .then(function (resp) {
            if (resp.status === 200) {
                return resp.json()
            } else {
                return res.sendStatus(404)
            }
        })
        .then(function (data) {
            res.send(data)
        })
})


app.get('/favourites', (req, res) => {

    db.getAllCities().then((result) => {
        res.send(result)
    }).catch((err) => {
        res.sendStatus(503);
    })
})


app.post('/favourites', (req, res) => {
    let city_name = req.query.city_name;
    let textType = typeof city_name;
    res.setHeader('Content-Type', `text/${textType}; charset=UTF-8`)

    db.insertCity(city_name).then((result) => {
        if (result) {
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });
})


app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS, POST');
    res.send('ok');
});


app.delete('/favourites', (req, res) => {
    let city_name = req.query.city_name;

    db.deleteCity(city_name).then((result) => {
        res.sendStatus(200);
    });
});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})

module.exports = app