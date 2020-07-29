const taApi_Key = "57b3727e23msh192554544a0e32dp1cabd6jsnbf7625af0664";

const mapQuestApi_Key = "2U5fDBQJ4diWz0ylGjFEud0Gnds2DFRb";



function displayResults(countryData) {
    console.log(countryData);
    $('#results-message').text(
        `The ISS is ${countryData.distance}km away from ${countryData.city}, ${countryData.country}`
    );
    $('#country-flag').attr('src', countryData.flagURL);
    $('#country-desc').text(countryData.description);

}

function storeCountryData(countryWikiJson, cityData) {
    console.log(`'storeCountryData' ran`);
    
    const countryData = cityData;
    cityData['country'] = countryWikiJson.title;
    cityData['flagURL'] = countryWikiJson.thumbnail.source;
    cityData['description'] = countryWikiJson.extract;
    cityData['contentURL'] = countryWikiJson.content_urls.desktop.page;
    displayResults(countryData);
}

function getCountryWiki(cityData) {
    console.log(`'getCountryWiki' ran`);
    const wikiURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${cityData.country.split(' ').join('_').split('"').join('')}`;
    fetch(wikiURL)
        .then(countryWiki => countryWiki.json())
        .then(countryWikiJson => storeCountryData(countryWikiJson, cityData));
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
        .then(nearbyCitiesData => nearbyCitiesData.json())
        .then(nearbyCitiesDataJson => storeCityData(nearbyCitiesDataJson));
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
        .then(ISSData => ISSData.json())
        .then(ISSDataJson => generateCoordinates(ISSDataJson));
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