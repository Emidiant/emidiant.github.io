
function windSpeed(speed) {
    var windDescription;

    switch (true) {
        case(speed >= 0 && speed <= 0.5):
            windDescription = "Calm";
            break;
        case(speed > 0.5 && speed <= 1.5):
            windDescription = "Light air";
            break;
        case(speed > 1.5 && speed <= 3.3):
            windDescription = "Light breeze";
            break;
        case(speed > 3.3 && speed <= 5.5):
            windDescription = "Gentle breeze";
            break;
        case(speed > 5.5 && speed <= 7.9):
            windDescription = "Moderate breeze";
            break;
        case(speed > 7.9 && speed <= 10.7):
            windDescription = "Fresh breeze";
            break;
        case(speed > 10.7 && speed <= 13.8):
            windDescription = "Strong breeze";
            break;
        case(speed > 13.8 && speed <= 17.1):
            windDescription = "Moderate gale";
            break;
        case(speed > 17.1 && speed <= 20.7):
            windDescription = "Fresh gale";
            break;
        case(speed > 20.8 && speed <= 24.4):
            windDescription = "Strong gale";
            break;
        case(speed > 24.4 && speed <= 28.4):
            windDescription = "Whole gale";
            break;
        case(speed > 28.4 && speed <= 32.6):
            windDescription = "Storm";
            break;
        case(speed > 32.6):
            windDescription = "Hurricane over";
            break;
    }
    return windDescription;
}

function windDirection(degree) {
    var direction;
    switch (true) {
        case(degree >= 348.75 && degree < 11.25):
            direction = "North";
            break;
        case(degree >= 11.25 && degree < 33.75):
            direction = "North-northeast";
            break;
        case(degree >= 33.75 && degree < 56.25):
            direction = "Northeast";
            break;
        case(degree >= 56.25 && degree < 78.75):
            direction = "East-northeast";
            break;
        case(degree >= 78.75 && degree < 101.25):
            direction = "East";
            break;
        case(degree >= 101.25 && degree < 123.75):
            direction = "East-southeast";
            break;
        case(degree >= 123.75 && degree < 146.25):
            direction = "Southeast";
            break;
        case(degree >= 146.25 && degree < 168.75):
            direction = "South-southeast";
            break;
        case(degree >= 168.75 && degree < 191.25):
            direction = "South";
            break;
        case(degree >= 191.25 && degree < 213.75):
            direction = "South-southwest";
            break;
        case(degree >= 213.75 && degree < 236.25):
            direction = "Southwest";
            break;
        case(degree >= 236.25 && degree < 258.75):
            direction = "West-southwest";
            break;
        case(degree >= 258.75 && degree < 281.25):
            direction = "West";
            break;
        case(degree >= 281.25 && degree < 303.75):
            direction = "West-northwest";
            break;
        case(degree >= 303.75 && degree < 326.25):
            direction = "Northwest";
            break;
        case(degree >= 326.25 && degree < 348.75):
            direction = "North-northwest";
            break;
    }
    return direction
}

function cloudsType(percent) {
    var type;
    switch (true) {
        case(percent <= 10):
            type = 'Clear sky';
            break;
        case (percent > 10 && percent <= 50):
            type = 'Scattered clouds';
            break
        case (percent > 50 && percent <= 90):
            type = 'Broken clouds';
            break;
        case (percent > 90):
            type = 'Overcast';
            break;
    }
    return type;
}

function iconType(name) {
    return "images/icons/" + name + "@2x.png"
}

function fillContent(b, p, data, i, h3, temp) {
    h3.textContent = data.name;
    temp.textContent = Math.round(data.main['temp']) + '\u00B0';

    b[0].textContent = "Ветер";
    b[1].textContent = "Облачность";
    b[2].textContent = "Давление";
    b[3].textContent = "Влажность";
    b[4].textContent = "Координаты";

    p[i].textContent = windSpeed(data.wind['speed']) + ', ' + data.wind['speed'] + ' m/s, ' + windDirection(data.wind['deg']);
    p[i + 1].textContent = cloudsType(data.clouds['all']);
    p[i + 2].textContent = data.main['pressure'] + ' hpa';
    p[i + 3].textContent = data.main['humidity'] + ' %';
    p[i + 4].textContent = '[' + data.coord['lon'] + ', ' + data.coord['lat'] + ']';
}


function gettingJSONbyCoord(lat, lon) {
    let loader = document.getElementsByClassName('preloader')[0];

    var tb = document.getElementsByTagName("uldata")[0];
    if (tb.childElementCount > 0) {
        while (tb.firstChild) {
            tb.removeChild(tb.firstChild);
        }
    }
    var tb2 = document.getElementsByTagName("citydata")[0];
    if (tb2.childElementCount > 0) {
        while (tb2.firstChild) {
            tb2.removeChild(tb2.firstChild);
        }
    }

    loader.style.display = "";
    return fetch('http://localhost:8080/weather/coordinates?lat=' + lat + '&long=' + lon)
        .then(function (resp) {
            return resp.json()
        })
        .then(function (data) {
            fillingInfo(data);
            loader.style.display = "none";
        })

}


function gettingJSONbyCity(city, method = 'parsing') {
    city = city.charAt(0).toUpperCase() + city.substr(1).toLowerCase();

    t1 = document.querySelector('#fav-city-loader');
    var tb = document.getElementsByTagName("ulcity");
    var clone = document.importNode(t1.content, true);
    tb[0].appendChild(clone);
    if (method === 'parsing') {
        return fetch('http://localhost:8080/weather/city?city=' + city).then(function (resp) {
            return resp.json()
        }).then(function (data) {
            fillingInfoCity(data, city, method);
            return data
        }).catch(err => {
            console.log(err)
        })
    } else {
        let cities_arr = null;

        fetch('http://localhost:8080/favourites', {
            method: 'GET'
        }).then(function (resp) {
            return resp.json()
        }).then(function (data) {
            cities_arr = data;
        }).catch(err => {
            console.log(err)
        })

        return fetch('http://localhost:8080/weather/city?city=' + city).then(function (resp) {
            if (resp !== 404) {
                return resp.json()
            }
        }).then(function (data) {
            let flag = true;

            for (let i = 0; i < cities_arr.length; i++) {
                if (cities_arr[i] === data.name) {
                    alert("Введенный город уже есть в списке")
                    tb[0].removeChild(tb[0].lastElementChild);
                    flag = false;
                }
            }
            if (flag) {
                fillingInfoCity(data, city, method)
                let city_name = data.name;

                fetch('http://localhost:8080/favourites?city_name=' + city_name, {
                    method: 'POST'
                }).then(function (resp) {
                    return resp.json()
                }).catch(err => {
                    console.log(err)
                })
            }
        }).catch(err => {
            alert("Введенный город не найден");
            tb[0].removeChild(tb[0].lastElementChild);
        })
    }
}

function fillingInfoCity(data, city, method) {
    if ('content' in document.createElement('template')) {
        var t1 = document.querySelector('#fav-city'),
            temp = t1.content.querySelector("p"),
            p = t1.content.querySelectorAll("p"),
            b = t1.content.querySelectorAll("b"),
            h3 = t1.content.querySelector("h3"),
            icon = t1.content.querySelector("#imgcity");

        fillContent(b, p, data, 1, h3, temp);

        let path = iconType(data.weather[0]['icon'])
        icon.innerHTML = `<img src=${path} width="48" height="48" alt="${data.weather[0]['main']}">`;
        var tb = document.getElementsByTagName("ulcity");
        var clone = document.importNode(t1.content, true);
        if (method === 'parsing') {
            tb[0].removeChild(tb[0].children[0]);
        }
        if (method === 'add') {
            tb[0].removeChild(tb[0].lastElementChild);
        }

        tb[0].appendChild(clone);
        return tb[0].lastElementChild;
    }
}

function fillingInfo(data) {
    let i = 0;
    if ('content' in document.createElement('template')) {

        var t2 = document.querySelector('#info-cur'),
            h3 = t2.content.querySelector("h3"),
            temp = t2.content.querySelector("p"),
            icon = t2.content.querySelector("div");

        var t1 = document.querySelector('#content-cur'),
            p = t1.content.querySelectorAll("p"),
            b = t1.content.querySelectorAll("b");

        fillContent(b, p, data, 0, h3, temp);


        icon.removeChild(icon.firstChild);
        let path = iconType(data.weather[0]['icon'])
        icon.innerHTML = `<img src=${path}>` + icon.innerHTML;


        var tb = document.getElementsByTagName("uldata");
        var clone = document.importNode(t1.content, true);
        tb[i].appendChild(clone);

        var tb2 = document.getElementsByTagName("citydata");
        var clone2 = document.importNode(t2.content, true);
        tb2[i].appendChild(clone2);
    }
}

function getCurrentCity() {
    let longitude = null;
    let latitude= null;
    function success(position) {

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        return gettingJSONbyCoord(Math.round(latitude * 1000) / 1000, Math.round(longitude * 1000) / 1000)
    }

    function error() {
        return gettingJSONbyCoord(-8.669786, 115.213571)
    }

    if (!navigator.geolocation) {
    } else {
         navigator.geolocation.getCurrentPosition(success, error);
    }


}

function addCity() {
    let form = document.forms.namedItem('addCity');
    const formData = new FormData(form);
    let city = formData.get('new-city-input').toString().toLowerCase();
    if (city.length > 0) {
        form.reset();
        city = city.charAt(0).toUpperCase() + city.substr(1).toLowerCase();
        gettingJSONbyCity(city, 'add')
    }
}

function deleteCity(a){
    let cityName, b, c;

    b = a.parentNode;
    cityName = b.childNodes[1].textContent;
    c = b.parentNode;

    return fetch('http://localhost:8080/favourites?city_name=' + cityName, {
        method: 'DELETE'
    }).then(function (resp) {
        if (resp.status === 200) {
            c.parentNode.removeChild(c);
        }
    }).catch(err => {
        console.log(err)
    })
}

function sleep(milliseconds) {
    const date = Date.now();
    let currentDate = null;
    do {
        currentDate = Date.now();
    } while (currentDate - date < milliseconds);
}

function parsing() {

    let cities_arr = null;
    return fetch('http://localhost:8080/favourites', {
        method: 'GET'
    }).then(function (resp) {
        return resp.json()
    }).then(function (data) {
        cities_arr = data;
        for (let i = 0; i < cities_arr.length; i++) {
            sleep(500)
            gettingJSONbyCity(cities_arr[i], 'parsing')
        }
    }).catch(err => {
        console.log(err)
    })
}


function init() {
    getCurrentCity()
    document.querySelector('#find-me').addEventListener('click', getCurrentCity);
    document.forms.namedItem('addCity').addEventListener('submit', (event) => {
        addCity();
        event.preventDefault();
    })
    parsing()
}


module.exports = {
    init: init,
    fillContent: fillContent,
    gettingJSONbyCoord: gettingJSONbyCoord,
    gettingJSONbyCity: gettingJSONbyCity,
    fillingInfoCity: fillingInfoCity,
    fillingInfo: fillingInfo,
    getCurrentCity: getCurrentCity,
    addCity: addCity,
    deleteCity: deleteCity,
    parsing: parsing
};