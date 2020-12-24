const chai = require('chai');
const chaiHttp = require('chai-http');
const should = chai.should();
const sinon = require('sinon');
const server = require('../app');
const assert = require('assert');
const fetchMock = require('fetch-mock');
const db = require('../db');
require('sinon-mongo');

chai.use(chaiHttp);
const apiKey = '52fd465732929bce2b208cdcf6b2c155'
const openWeatherUrl = 'https://api.openweathermap.org/data/2.5/weather';

describe('SERVER: GET /weather/city', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    const responseBodyMoscow = {
        coord: { lon: 37.62, lat: 55.75 },
        base: 'stations',
        timezone: 10800,
        id: 524901,
        name: 'Moscow',
        cod: 200
    }

    it('get the response for the correct city', (done) => {

        let city = 'Moscow'

        fetchMock.once(`${openWeatherUrl}?q=${city}&appid=${apiKey}`, {
            body: JSON.stringify(responseBodyMoscow),
            status: 200,
            statusText: 'OK',
            headers: {'Content-Type': 'application/json'},
            sendAsJson: false
        }, {
            method: 'GET'
        });

        chai.request(server)
            .get('/weather/city?city=' + city)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.name.should.eql(city);
                res.body.should.be.an('object');
                res.body.should.have.property('coord').eql({ lon: 37.62, lat: 55.75 })
                done();
            });
    });


    it('error in response for the wrong city', (done) => {
        let city = 'Moscow123'

        fetchMock.once(`${openWeatherUrl}?q=${city}&appid=${apiKey}`,404)

        chai.request(server)
            .get('/weather/city?city=' + city)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    })
})

describe('SERVER: GET /weather/coordinates', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    const responseBodyDenpasar = {
        coord: { lon: 37.62, lat: 55.75 },
        base: 'stations',
        timezone: 10800,
        id: 524901,
        name: 'Moscow',
        cod: 200
    }

    it('get the response for the correct coordinates', (done) => {

        let lat = -8.67;
        let lon = 115.21;
        let city = 'Denpasar';

        fetchMock.once(openWeatherUrl + '?lat=' + lat + '&lon=' + lon + '&units=metric' + '&appid=' + apiKey, {
            body: JSON.stringify(responseBodyDenpasar),
            status: 200,
            statusText: 'OK',
            headers: {'Content-Type': 'application/json'},
            sendAsJson: false
        }, {
            method: 'GET'
        });

        chai.request(server)
            .get('/weather/coordinates?lat=' + lat + '&long=' + lon)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.name.should.eql(city);
                res.body.should.be.an('object');
                res.body.should.have.property('coord').eql( { lon: 115.21, lat: -8.67 })
                done();
            });
    });

    it('error in response for the wrong coordinates', (done) => {

        let lat = -100000;
        let lon = 100000;

        fetchMock.once(openWeatherUrl + '?lat=' + lat + '&lon=' + lon + '&units=metric' + '&appid=' + apiKey, 404, {
            method: 'GET'
        });

        chai.request(server)
            .get('/weather/coordinates?lat=' + lat + '&long=' + lon)
            .end((err, res) => {
                res.should.have.status(404);
                done();
            });
    });
})

describe('SERVER: GET /favourites', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    let mockCollection;

    beforeEach(() => {
        mockCollection = sinon.mongo.collection();
        global.collection = mockCollection;
    });


    it('get all cities from db', (done) => {
        const docArray = [
            {_id: '1', name: 'Moscow'},
            {_id: '2', name: 'Pushkin'}
        ];
        const resultArray = ['Moscow', 'Pushkin'];
        mockCollection.find
            .withArgs({})
            .returns(sinon.mongo.documentArray(docArray));

        chai.request(server)
            .get('/favourites')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.an('array');
                res.body.should.be.eql(resultArray);
                sinon.assert.calledOnce(mockCollection.find);
                done();
            });
    });
})

describe('SERVER: DELETE /favourites', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    let mockCollection;

    beforeEach(() => {
        mockCollection = sinon.mongo.collection();
        global.collection = mockCollection;
    });

    it('delete city from db', (done) => {
        let cityName = 'Moscow'
        mockCollection.deleteOne
            .withArgs({name: cityName})
            .resolves();
        chai.request(server).delete('/favourites?city_name=' + cityName).send().end((err, res) => {
            res.should.have.status(200);
            sinon.assert.calledOnce(mockCollection.deleteOne);
            done();
        });
    });
})

describe('SERVER: POST /favourites', () => {

    afterEach(() => {
        fetchMock.reset();
        fetchMock.restore();
    });

    let mockCollection;

    beforeEach(() => {
        mockCollection = sinon.mongo.collection();
        global.collection = mockCollection;
    });

    it('insert new city into db', (done) => {
        let city_name = 'Monako';
        mockCollection.insertOne
            .withArgs({name: city_name})
            .resolves(true);
        chai.request(server).post('/favourites?city_name=' + city_name).send().end((err, res) => {
            res.should.have.status(200);
            sinon.assert.calledOnce(mockCollection.insertOne);
            done();
        });
    });
})

describe('DATABASE: mongo db tests', () => {

    let mockCollection;

    beforeEach(() => {
        mockCollection = sinon.mongo.collection();
        global.collection = mockCollection;
    });

    it('get a list of favourite cities from db', (done) => {
        const docArray = [
            {_id: '1', name: 'Moscow'},
            {_id: '2', name: 'Pushkin'}
        ];
        const resultArray = ['Moscow', 'Pushkin'];
        mockCollection.find
            .withArgs({})
            .returns(sinon.mongo.documentArray(docArray));
        db.getAllCities().then((response) => {
            response.should.be.an('array');
            response.should.be.eql(resultArray);
            sinon.assert.calledOnce(mockCollection.find);
            done();
        });
    });

    it('insert city into db', (done) => {
        mockCollection.insertOne
            .withArgs({name: 'London'})
            .resolves();
        db.insertCity('London').then(() => {
            sinon.assert.calledOnce(mockCollection.insertOne);
            sinon.verify();
            done();
        })
    });

    it('delete city from db', (done) => {
        mockCollection.deleteOne
            .withArgs({name: 'London'})
            .resolves();
        db.deleteCity('London').then(() => {
            sinon.assert.calledOnce(mockCollection.deleteOne);
            sinon.verify();
            done();
        })
    });

});