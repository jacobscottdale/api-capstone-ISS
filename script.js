let tense = '';
let currentTime;
let ISSLocation = {};

function scrollToResults() {
    console.log('scrolling');
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#results").offset().top
    }, 700);
}

function displayResults(locationData) {
    console.log(locationData);
    if (ISSLocation.isWater) {
        $('#results-message').html(
            `<h3>The ISS ${tense} over the ocean at this time, but it ${tense} ${locationData.distance}km away from* ${locationData.city}, ${locationData.country}</h3>
            <p class='small-text'>*and a few hundred kilometers above</p>`
        );
    }
    else {
        $('#results-message').html(
            `<p>The ISS ${tense} ${locationData.distance}km away* from ${locationData.city}, ${locationData.country}</p>
            <p class='small-text'>*and a few hundred kilometers above</p>`
        );
    }
    $('#country-flag').attr('src', locationData.flagURL);
    $('#country-flag').attr('alt', `${locationData.country} flag`);
    $('#country-desc').text(locationData.description);
    $('#content-link').attr('href', locationData.contentURL);
    console.log(ISSLocation.isWater);
    showHide();
    scrollToResults();
}

function storeLocationData(countryWikiJson, cityData) {
    console.log(`'storeLocationData' ran`);
    console.log(countryWikiJson);
    const locationData = {
        city: cityData.city,
        distance: cityData.distance,
        country: countryWikiJson.title,
        flagURL: countryWikiJson.thumbnail.source,
        description: countryWikiJson.extract,
        contentURL: countryWikiJson.content_urls.desktop.page
    };
    displayResults(locationData);
}

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
            showHide();
            $('#results').html(
                `<div id='results-message'>Sorry, something went wrong. Try again!</div>
            <div id='results-content'>
                <img src='' id='country-flag' alt=''>
                <p id='country-desc'></p>
                <a id='content-link' href=''>Read more</a>
            </div>`);
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
            showHide();
            $('#results-message').text('Something went wrong. Try again!');
        });
}

function determineTense(searchTimestamp) {
    console.log('determineTense ran');
    console.log(searchTimestamp);
    console.log(currentTime);
    if (searchTimestamp < currentTime) {
        tense = 'was';
    }
    else if (searchTimestamp > currentTime) {
        tense = 'will be';
    }
    else {
        tense = 'is';
    }
    console.log(tense);
}

function updateISSLocation(isWaterJson) {
    console.log(isWaterJson);
    ISSLocation = {
        lat: isWaterJson.lat,
        lon: isWaterJson.lon,
        isWater: isWaterJson.water
    };
    console.log(ISSLocation);
    getNearestCity(ISSLocation.lat, ISSLocation.lon);
}

function determineOverWater(lat, lon) {
    const api_key = 'uMcb1fNa4_dyFbyYcd1y';
    const waterURL = `https://api.onwater.io/api/v1/results/${lat},${lon}?access_token=${api_key}`;
    fetch(waterURL)
        .then(isWater => {
            if(isWater.ok) {
                return isWater.json();
            }
            throw new Error(isWater.statusText)
        })
        .then(isWaterJson => updateISSLocation(isWaterJson))
        .catch(err => {
            console.log('something went wrong with determineOverWater');
        });
}

function showHide() {
    console.log('hiding landing-section')
    $('#landing-section').addClass('hidden');
    $('.form-results').removeClass('hidden');
}

function generateCoordinates(searchTimestamp, ISSData) {
    console.log(ISSData);
    const lat = ISSData.latitude.toFixed(6);
    const lon = ISSData.longitude.toFixed(6);
    console.log(`The ISS coordinates are ${lat}, ${lon}`);
    determineOverWater(lat, lon);
    determineTense(searchTimestamp);
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

function getPosition(searchTimestamp) {
    console.log(`'getPosition' ran`);
    const ISSURL = generateISSURL(searchTimestamp);
    console.log(ISSURL);
    fetch(ISSURL)
        .then(ISSData => {
            if (ISSData.ok) {
                return ISSData.json();
            }
            throw new Error(ISSData.statusText);
        })
        .then(ISSDataJson => generateCoordinates(searchTimestamp, ISSDataJson))
        .catch(err => {
            showHide();
            $('#results-message').text('Something went wrong. Try again!')
        });
}

function convertDateTime(date, time) {
    console.log(`'convertDateTime' ran`);
    unixTimestamp = new Date(`${date}T${time}`).getTime() / 1000;
    console.log(unixTimestamp);
    return unixTimestamp;
}

function logCurrentTime() {
    currentTime = Math.floor(Date.now() / 1000);
    console.log(`the current time is ${currentTime}`);
}

function watchForm() {
    $('#landing-now-button').on('click', function () {
        logCurrentTime();
        console.log(`'landing-now' clicked`);
        tense = 'is';
        getPosition(currentTime);
    })

    $('#now-button').on('click', function () {
        logCurrentTime();
        console.log(`'now' clicked`);
        tense = 'is';
        getPosition(currentTime);
    })

    $('#iss-location-search').submit(event => {
        event.preventDefault();
        console.log(`'later' clicked`);
        logCurrentTime();
        const searchDate = $('#date').val();
        const searchTime = $('#time').val();
        const unixTimestamp = convertDateTime(searchDate, searchTime);
        getPosition(unixTimestamp);
    })
}

$(watchForm);