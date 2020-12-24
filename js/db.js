const MongoClient = require('mongodb').MongoClient;

const mongoClient = new MongoClient('mongodb://localhost:27017/', {useNewUrlParser: true, useUnifiedTopology: true});
mongoClient.connect();
global.collection = mongoClient.db('weather').collection('cities');

function insertCity (cityName) {
    const collection = global.collection;
    return collection.insertOne({name: cityName});
}

function deleteCity (cityName) {
    const collection = global.collection;
    return collection.deleteOne({name: cityName});
}

function getAllCities ()  {
    const collection = global.collection;
    return collection.find({}).toArray().then(res => res.map((city) => city.name));
}

module.exports = {
    insertCity: insertCity,
    deleteCity: deleteCity,
    getAllCities: getAllCities
};