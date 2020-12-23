const MongoClient = require('mongodb').MongoClient;

const mongoClient = new MongoClient('mongodb://localhost:27017/', {useNewUrlParser: true, useUnifiedTopology: true});
mongoClient.connect();
global.collection = mongoClient.db('weather').collection('cities');

module.exports = {
    insertCity: (cityName) => {
        const collection = global.collection;
        return collection.insertOne({name: cityName});
    },

    deleteCity: (cityName) => {
        const collection = global.collection;
        return collection.deleteOne({name: cityName});
    },

    getAllCities: () => {
        const collection = global.collection;
        return collection.find({}).toArray().then(res => res.map((city) => city.name));
    }
};