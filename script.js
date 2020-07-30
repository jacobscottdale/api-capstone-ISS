
function displayResults(locationData) {
    console.log(locationData);
    $('#results-message').html(
        `<p>The ISS is ${locationData.distance}km away* from ${locationData.city}, ${locationData.country}</p>
        <p class='small-text'>*and a few hundred kilometers above</p>`
    );

    //$('#city-image').attr('src', locationData.flagURL);
    //$('#city-image').attr('alt', `${locationData.country} image`);
    //$('#city-desc').text(locationData.description);
    $('#country-flag').attr('src', locationData.flagURL);
    $('#country-flag').attr('alt', `${locationData.country} flag`);
    $('#country-desc').text(locationData.description);

}

function storeLocationData(countryWikiJson, cityData) {
    console.log(`'storeLocationData' ran`);
    console.log(countryWikiJson);
    const locationData = {
        city : cityData.city,
        distance : cityData.distance,
        country : countryWikiJson.title,
        flagURL : countryWikiJson.thumbnail.source,
        description : countryWikiJson.extract,
        contentURL : countryWikiJson.content_urls.desktop.page
    };
    displayResults(locationData);
}

//function getCityWiki(countryWikiJson, cityData) {
//   console.log(`'getCityWiki' ran`);
//    const cityWikiURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityData.city.split(' ').join('_').split('"').join('')}, ${cityData.country.split(' ').join('_').split('"').join('')}`;
//    console.log(cityWikiURL);
//    fetch(cityWikiURL)
//        .then(cityWiki => cityWiki.json())
//        .then(cityWikiJson => storeLocationData(countryWikiJson, cityData));
//}

function getCountryWiki(cityData) {
    console.log(`'getCountryWiki' ran`);
    const wikiURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityData.country.split(' ').join('_').split('"').join('')}`;
    fetch(wikiURL)
        .then(countryWiki => {
            if (countryWiki.ok) {
            return countryWiki.json();
            }
            throw new Error(countryWiki.statusText);
        })
        .then(countryWikiJson => storeLocationData(countryWikiJson, cityData))
        .catch(err => {
            $('#results-message').text('Something went wrong. Try again!')
        });
    
}

function storeCityData(nearbyCitiesDataJson) {
    console.log(`'storeCityData' ran`);
    console.log(nearbyCitiesDataJson);
    const cityData = {
        city: nearbyCitiesDataJson[0].City,
        country: nearbyCitiesDataJson[0].Country,
        distance: Math.floor(nearbyCitiesDataJson[0].Distance / 1000)
    };
    console.log(`${cityData.city}, ${cityData.country} is ${cityData.distance}km away`);
    getCountryWiki(cityData);
}

function getNearestCity(lat, lon) {
    console.log(`'getNearestCity' ran`);
    const nearestCityURL = `https://geocodeapi.p.rapidapi.com/GetNearestCities?latitude=${lat}&longitude=${lon}&range=0`;
    const options = {
        "method": "GET",
        "headers": {
            "x-rapidapi-host": "geocodeapi.p.rapidapi.com",
            "x-rapidapi-key": "57b3727e23msh192554544a0e32dp1cabd6jsnbf7625af0664"
        }
    };
    fetch(nearestCityURL, options)
        .then(nearbyCitiesData => {
            if (nearbyCitiesData.ok) {
            return nearbyCitiesData.json();
            }
            throw new Error(nearbyCitiesData.statusText);
        })
        .then(nearbyCitiesDataJson => storeCityData(nearbyCitiesDataJson))
        .catch(err => {
            $('#results-message').text('Something went wrong. Try again!')
        });
}

function convertDateTime(date, time) {
    console.log(`'convertDateTime' ran`);
    unixTimestamp = new Date(`${date}T${time}`).getTime() / 1000;
    console.log(unixTimestamp);
    return unixTimestamp;
}

function generateISSURL(searchTimestamp) {
    console.log(`Generating ISS API URL`);
    if (searchTimestamp) {
        return `https://api.wheretheiss.at/v1/satellites/25544?timestamp=${searchTimestamp}`;
    }
    else {
        return `https://api.wheretheiss.at/v1/satellites/25544`;
    }
}

function generateCoordinates(ISSData) {
    console.log(ISSData);
    const lat = ISSData.latitude.toFixed(6);
    const lon = ISSData.longitude.toFixed(6);
    console.log(`The ISS coordinates are ${lat}, ${lon}`);
    getNearestCity(lat, lon);
}

function getPosition(searchTimestamp) {
    console.log(`'getPosition' ran`);
    ISSURL = generateISSURL(searchTimestamp);
    console.log(ISSURL);
    fetch(ISSURL)
        .then(ISSData => {
            if (ISSData.ok) {
            return ISSData.json();
            }
            throw new Error(ISSData.statusText);
        })
        .then(ISSDataJson => generateCoordinates(ISSDataJson))
        .catch(err => {
            $('#results-message').text('Something went wrong. Try again!')
        });
}

function watchForm() {
    $('#now-button').on('click', function () {
        console.log(`'now' clicked`);
        getPosition(false);
    })

    $('#iss-location-search').submit(event => {
        event.preventDefault();
        console.log(`'later' clicked`)
        const searchDate = $('#date').val();
        const searchTime = $('#time').val();
        const unixTimestamp = convertDateTime(searchDate, searchTime);
        getPosition(unixTimestamp);
    })
}

$(watchForm);