const express = require('express')
const fetch = require("node-fetch");
const app = express()
const port = 8080
const api_key = '52fd465732929bce2b208cdcf6b2c155'
const cors = require('cors')
const createError = require('http-errors')


const pg = require('pg');

const config = {
    host: 'localhost',
    user: 'root',
    password: 'Emidiant17!',
    database: 'favourites',
    port: 5432
};

const client = new pg.Client(config);

client.connect();

function queryDatabase() {

    console.log(`Running query to PostgreSQL server: ${config.host}`);


}



// const pg = require('pg');
// const conString = "postgres://root:Emidiant17!@localhost:5432/favourites";
// const client = new pg.Client(conString);
// client.connect();

// const pool = new Pool({
//     user: "root",
//     host: "localhost",
//     database: "favourites",
//     password: "Emidiant17!",
//     port: "5432"
// })

// pool.connect();



// const connection = mysql.createConnection({
//     host: "localhost",
//     user: "root",
//     database: "FAVOURITES",
//     password: "Emidiant17!"
// });

app.use(cors())

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    res.setHeader('Accept-Charset', 'utf-8')
    next();
});


// connection.connect(function(err){
//     if (err) {
//         return console.error("Ошибка: " + err.message);
//     }
//     else{
//         console.log("Подключение к серверу MySQL успешно установлено");
//     }
// });

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

    const query = 'SELECT * FROM cities;';

    client.query(query)
        .then(data => {
            let cities_data = data.rows;
            let cities = []
            for (let i = 0; i < cities_data.length; i++) {
                cities.push(cities_data[i].city_name)
            }
            res.send(cities)
        })
        .catch(err => {
            console.log(err);
        });
})

app.post('/favourites', (req, res) => {
    let city_name = req.query.city_name;

    // city_name = encodeURI(city_name);
    let textType = typeof city_name;

    res.setHeader('Content-Type', `text/${textType}; charset=UTF-8`)
    let query = "INSERT INTO cities (city_name) VALUES ('"+ city_name + "')";

    client.query(query)
        .then(() => {
            res.sendStatus(200);

        })
        .catch(err => {
            res.sendStatus(400);
        });
})

app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS, POST');
    res.send('ok');
});

app.delete('/favourites', (req, res) => {
    let city_name = '\'' + req.query.city_name + '\'';
    let query = 'DELETE FROM cities WHERE city_name=' + city_name;


    client
        .query(query)
        .then(result => {
            res.send(city_name + ' deleted');
        })
        .catch(err => {
            res.sendStatus(400);
            console.log(err);
            throw err;
        });


});


app.listen(port, () => {

    console.log(`App listening at http://localhost:${port}`)
})
