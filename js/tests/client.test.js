const chai = require('chai');
const chai_http = require('chai-http');
chai.use(chai_http);
const expect = require('chai').expect;
const mocha = require('mocha');
const sinon = require('sinon');
const assert = require('assert');
const afterEach = mocha.afterEach;
const beforeEach = mocha.beforeEach;
require('sinon-mongo');
// const fetch = require('isomorphic-fetch');
const fetchMock = require('fetch-mock');
const describe = mocha.describe;
const it = mocha.it;
chai.should();
const JSDOM = require('jsdom').JSDOM;
// global.windDirection = require('../utils').windDirection;
// global.getIcon = require('../utils').getIcon;
// global.sanitize = require('../utils').sanitize;

const html = `<head>
        <meta charset="UTF-8">
        <title>Погода</title>
        <link rel="stylesheet" href="css/main.css" type="text/css">
        <link href="css/media-queries.css" rel="stylesheet" type="text/css">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    </head>
    <body>
    <header>
        <h1>Прогноз погоды</h1>
        <div>
            <h2>Погода здесь</h2>
            <div class="update" id = "find-me"><button class="update-button"><span>Обновить геолокацию</span></button></div>
        </div>
    </header>
    
    <main>
        <div class="current-city-data">
            <div class="preloader">
                <div class="main-loader"></div>
            </div>
            <citydata class="current-city"></citydata>
            <div class="current-city-li">
                <uldata class="current-weather-data"></uldata>
            </div>
    
        </div>
    
        <template id="info-cur">
            <h3 class="current-city-h3"></h3>
            <div>
                <p class="current-temp"></p>
            </div>
        </template>
    
        <template id="content-cur">
            <li><b></b><p></p></li>
            <li><b></b><p></p></li>
            <li><b></b><p></p></li>
            <li><b></b><p></p></li>
            <li><b></b><p></p></li>
        </template>
    
        <div class="favorites-header">
            <h2>Избранное</h2>
    
            <form class="new-city" name="addCity" method="get">
                <input type="text" placeholder="Добавить новый город" name="new-city-input">
                <input type="submit" class="button" id="new-city" value="">
            </form>
        </div>
    
        <ulcity class="favorites-cities" id="favorites">
    
        </ulcity>
    
        <template id="fav-city-loader">
            <li>
                <div class="preloader">
                    <div class="preloader-image"></div>
                </div>
            </li>
        </template>
    
        <template id="fav-city">
            <li>
                <div class="city">
                    <h3 id="cityname"></h3>
                    <p></p>
                    <div id="imgcity"></div>
                    <button onclick="deleteCity(this)"></button>
                </div>
                <ul class="weather-data">
                    <li><b></b><p></p></li>
                    <li><b></b><p></p></li>
                    <li><b></b><p></p></li>
                    <li><b></b><p></p></li>
                    <li><b></b><p></p></li>
                </ul>
            </li>
        </template>
    
        <script src="js/weather_data.js"></script>
        <script>init()</script>
    </main>
    </body>
    </html>`


const moscowHtml = `
    <li>
        <div class="city">
            <h3 id="cityname">Moscow</h3>
            <p>-8°</p>
            <div id="imgcity"><img src="images/icons/13n@2x.png" width="48" height="48" alt="Snow"></div>
            <button onclick="deleteCity(this)"></button>
        </div>
        <ul class="weather-data">
            <li><b>Ветер</b><p>Light breeze, 3 m/s, South</p></li>
            <li><b>Облачность</b><p>Broken clouds</p></li>
            <li><b>Давление</b><p>1019 hpa</p></li>
            <li><b>Влажность</b><p>85 %</p></li>
            <li><b>Координаты</b><p>[37.62, 55.75]</p></li>
        </ul>
    </li>`

const moscowResponse = {
    clouds: {all: 90},
    coord: {lat: 55.75, lon: 37.62},
    main: {
        humidity: 85,
        pressure: 1019,
        temp: -8.33,
    },
    name: "Moscow",
    weather: [{
        icon: "13n",
        main: "Snow"
    }],
    wind: {
        deg: 180,
        speed: 3
    }
}

window = new JSDOM(html).window;
document = window.document;

global.window = window;
window.alert = sinon.spy();
global.document = window.document;
global.navigator = {
    userAgent: 'node.js'
};
// global.fetch = fetch;
global.alert = window.alert;
global.FormData = window.FormData;

const geolocate = require('mock-geolocation');
geolocate.use();
let client = null;
describe('CLIENT: info about city innerHTML', () => {

    beforeEach(() => {
        client = require('../weather_data');
    });

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });


    it('adding a new city to html', (done) => {
        fetchMock.get(`http://localhost:8080/favourites`, []);
        client.init();
        fetchMock.get('http://localhost:8080/weather/city?city=Moscow', moscowResponse);
        fetchMock.once('http://localhost:8080/favourites?city_name=Moscow', moscowResponse);
        client.gettingJSONbyCity('Moscow', 'add').then((res) => {
            const parsingCity = document.getElementsByTagName('ulcity')[0].lastChild;
            parsingCity.innerHTML.should.be.eql(moscowHtml);
        });
        done();
    });

    it('adding a repeat city to html', (done) => {
        fetchMock.get('http://localhost:8080/favourites', ['Moscow'], {overwriteRoutes: true});
        client.init();
        fetchMock.get('http://localhost:8080/weather/city?city=Moscow', moscowResponse);
        fetchMock.post('http://localhost:8080/favourites?city_name=Moscow', moscowResponse);

        alert = sinon.spy();
        client.gettingJSONbyCity('Moscow', 'add').then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        })
    });

    it('parsing a city in html', (done) => {

        fetchMock.once('http://localhost:8080/weather/city?city=Moscow', moscowResponse);
        fetchMock.once('http://localhost:8080/favourites?city_name=Moscow', moscowResponse);
        client.gettingJSONbyCity('Moscow', 'parsing').then((res) => {
            const parsingCity = document.getElementsByTagName('ulcity')[0];
            parsingCity.innerHTML.should.be.eql(moscowHtml);
        });
        done();
    });
});

const uldata = '';

const moscowCurrentHTML =`
            <div class="preloader" style="display: none;">
                <div class="main-loader"></div>
            </div>
            <citydata class="current-city">
            <h3 class="current-city-h3">Moscow</h3>
            <div><img src="images/icons/13n@2x.png"><p class="current-temp">-8°</p>
            </div>
        </citydata>
            <div class="current-city-li">
                <uldata class="current-weather-data">
            <li><b>Ветер</b><p>Light breeze, 3 m/s, South</p></li>
            <li><b>Облачность</b><p>Broken clouds</p></li>
            <li><b>Давление</b><p>1019 hpa</p></li>
            <li><b>Влажность</b><p>85 %</p></li>
            <li><b>Координаты</b><p>[37.62, 55.75]</p></li>
        </uldata>
            </div>
    
        `;

describe('CLIENT: info about current city', () => {

    beforeEach(() => {
        client = require('../weather_data');
        fetchMock.get(`http://localhost:8080/favourites`, []);
        client.init();
    });

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });


    it('empty field for the current city', (done) => {
        client.getCurrentCity();
        const loader = document.getElementsByTagName("uldata")[0];
        loader.innerHTML.should.be.eql(uldata);
        done()
    });

    it('current city by coordinates', (done) => {
        let lat = '55.75';
        let lon = '37.62';
        fetchMock.once('http://localhost:8080/weather/coordinates?lat=' + lat + '&long=' + lon, moscowResponse);
        client.gettingJSONbyCoord(lat, lon).then((res) => {
            const currentCity = document.getElementsByClassName('current-city-data')[0];
            currentCity.innerHTML.should.be.eql(moscowCurrentHTML);
            done();
        }).catch(done);
    });
});

describe('CLIENT: server error and alerts', () => {
    beforeEach(() => {
        client = require('../weather_data');
        fetchMock.get(`http://localhost:8080/favourites`, []);
        client.init();
    });

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('city with wrong name', (done) => {
        alert = sinon.spy();
        fetchMock.once('http://localhost:8080/weather/city?city=Moscow123', 404);
        client.gettingJSONbyCity('Moscow123', 'add').then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });

    it('get alert for server error', (done) => {
        alert = sinon.spy();
        fetchMock.once('http://localhost:8080/weather/city?city=Moscow', 503);
        client.gettingJSONbyCity('Moscow', 'add').then((res) => {
            expect(alert.calledOnce).to.be.true;
            done();
        });
    });
})


describe('CLIENT: delete city', () => {
    beforeEach(() => {
        client = require('../weather_data');
        fetchMock.get(`http://localhost:8080/favourites`, []);
        client.init();
    });

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    it('delete favourite city', (done) => {
        fetchMock.once('http://localhost:8080/favourites?city_name=Moscow', moscowResponse, {overwriteRoutes: true});

        let countButtonAfterDelete = document.getElementsByTagName("button");
        client.deleteCity(countButtonAfterDelete[1]).then((res) => {
            document.getElementsByClassName('button').length.should.be.eql(countButtonAfterDelete.length - 1);
        });
        done();
    });
})