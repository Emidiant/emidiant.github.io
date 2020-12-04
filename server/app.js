const express = require('express')
const fetch = require("node-fetch");
const app = express()
const port = 8080
const api_key = '52fd465732929bce2b208cdcf6b2c155'
const mysql = require("mysql2");
const cors = require('cors')
const createError = require('http-errors')

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "FAVOURITES",
    password: "Emidiant17!"
});

app.use(cors())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    res.setHeader('Accept-Charset', 'utf-8')
    next();
});


connection.connect(function(err){
    if (err) {
        return console.error("Ошибка: " + err.message);
    }
    else{
        console.log("Подключение к серверу MySQL успешно установлено");
    }
});

// http://localhost:3000/weather/city?city=Moscow
app.get('/weather/city', (req, res) => {
    let city = req.query.city;
    city = encodeURI(city);
    fetch('https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=metric' + '&appid=' + api_key).then(function (resp) {
        if (resp.status === 200) {
            return resp.json()
        } else {
            return 404
        }
    }).then(function (data) {
        res.send(data)
    })
})

app.get('/weather/coordinates', (req, res) => {
    let lat = req.query.lat;
    let lon = req.query.long;
    fetch('https://api.openweathermap.org/data/2.5/weather?lat=' + lat + '&lon=' + lon + '&units=metric' + '&appid=' + api_key)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {
            res.send(data)
        })
})

app.get('/favourites', (req, res) => {
    let sql = "SELECT * FROM cities"
    connection.query(sql, function(err, data) {
        if(err) return console.log(err);
        let cities = []
        for (let i = 0; i < data.length; i++) {
            cities.push(data[i].city_name)
        }
        res.send(cities)
    });
})

app.post('/favourites', (req, res) => {
    let city_name = req.query.city_name;

    // city_name = encodeURI(city_name);
    let textType = typeof city_name;

    res.setHeader('Content-Type', `text/${textType}; charset=UTF-8`)
    let sql = "INSERT INTO cities (city_name) VALUES (?)"
    connection.query(sql, [city_name], function(err, results) {
        if(err) return console.log(err);
        try {
            res.sendStatus(200);
        } catch (error) {
            throw createError(400, `City ${city_name} existы`)
        }

    });
})

app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS, POST');
    res.send('ok');
});

app.delete('/favourites', (req, res) => {
    let city_name = '\'' + req.query.city_name + '\'';
    let sql = 'DELETE FROM cities WHERE city_name=' + city_name;

    connection.query(sql, function( err, results) {
        try {
            res.send(city_name + ' deleted')
        } catch (error) {
            res.sendStatus(400);
            console.log(error)
        }
    });


});


app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})
