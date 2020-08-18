// tense will hold was/is/will be respective to the user-selected time
let tense = '';
// currentTime will hold the time at the moment the user presses the button
let currentTime;
// will store information on the ISS from multiple APIs
let ISSLocation = {};

// Page will scroll to the results when they render-- intended for mobile displays
function scrollToResults() {
    $([document.documentElement, document.body]).animate({
        scrollTop: $("#results").offset().top
    }, 700);
}

// Renders the information received from APIs
function displayResults(locationData) {
    // If the ISS is above a body of water, the user is notified in the results-message
    if (ISSLocation.isWater) {
        $('#results-message').html(
            `<h3>The ISS ${tense} over the ocean or a body of water at this time, but it ${tense} ${locationData.distance}km away from* ${locationData.city}, ${locationData.country}</h3>
            <p class='small-text'>*and a few hundred kilometers above</p>`
        );
    }
    else {
        $('#results-message').html(
            `<h3>The ISS ${tense} ${locationData.distance}km away* from ${locationData.city}, ${locationData.country}</h3>
            <p class='small-text'>*and a few hundred kilometers above</p>`
        );
    }
    // Renders the image associated with the country from wikimedia
    $('#country-flag').attr('src', locationData.flagURL);
    $('#country-flag').attr('alt', `${locationData.country} flag`);
    // Renders country description from wikimedia
    $('#country-desc').text(locationData.description);
    // Renders a link for user to read more about the country on Wikipedia.org
    $('#content-link').attr('href', locationData.contentURL);
    // Reveals the results
    showHide();
    // If user is on a mobile display, page will scroll to the results
    if (screen.width < 800) {
        scrollToResults();
    }
}

// Stores information about the city and country
function storeLocationData(countryWikiJson, cityData) {
    const locationData = {
        city: cityData.city,
        distance: cityData.distance,
        country: countryWikiJson.title,
        flagURL: countryWikiJson.thumbnail.source,
        description: countryWikiJson.extract,
        contentURL: countryWikiJson.content_urls.desktop.page
    };
    // Call render function
    displayResults(locationData);
}

// Fetches information about the country from wikimedia API
function getCountryWiki(cityData) {
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
            // Reveals the results section so the error message can display for user
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

// Records the nearest city, country and its distance from the ISS coordinates
function storeCityData(nearbyCitiesDataJson) {
    const cityData = {
        city: nearbyCitiesDataJson[0].City,
        country: nearbyCitiesDataJson[0].Country,
        distance: Math.floor(nearbyCitiesDataJson[0].Distance / 1000)
    };
    // Pass nearest city, country to wikimedia API
    getCountryWiki(cityData);
}

// Finds the nearest city to the ISS coordinates from the geocode API
function getNearestCity(lat, lon) {
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
            // Reveals the results section so the error message can display for user
            showHide();
            $('#results-message').text('Something went wrong. Try again!');
        });
}

// Chooses appropriate tense for past, present and future
function determineTense(searchTimestamp) {
    // past
    if (searchTimestamp < currentTime) {
        tense = 'was';
    }
    // future
    else if (searchTimestamp > currentTime) {
        tense = 'will be';
    }
    // present
    else {
        tense = 'is';
    }
}

// Stores ISS coordinates and whether it is above water or not
function updateISSLocation(isWaterJson) {
    ISSLocation = {
        lat: isWaterJson.lat,
        lon: isWaterJson.lon,
        isWater: isWaterJson.water
    };
    getNearestCity(ISSLocation.lat, ISSLocation.lon);
}

// Finds out if the ISS is above water or land using the onwater API
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
            console.log('Something went wrong with onwater API. Try again!');
        });
}

// Function to hide initial landing page and reveal the results section
function showHide() {
    $('#landing-section').addClass('hidden');
    $('.form-results').removeClass('hidden');
}

// Formats coordinates for use as API parameters
function generateCoordinates(searchTimestamp, ISSData) {
    const lat = ISSData.latitude.toFixed(6);
    const lon = ISSData.longitude.toFixed(6);
    determineOverWater(lat, lon);
    determineTense(searchTimestamp);
}

// This function provides API URL depending on whether user selects "now" or their own date and time
function generateISSURL(searchTimestamp) {
    // past/future date and time
    if (searchTimestamp) {
        return `https://api.wheretheiss.at/v1/satellites/25544?timestamp=${searchTimestamp}`;
    }
    // current date and time
    else {
        return `https://api.wheretheiss.at/v1/satellites/25544`;
    }
}

// Determines ISS coordinates by calling ISS API
function getPosition(searchTimestamp) {
    const ISSURL = generateISSURL(searchTimestamp);
    fetch(ISSURL)
        .then(ISSData => {
            if (ISSData.ok) {
                return ISSData.json();
            }
            throw new Error(ISSData.statusText);
        })
        .then(ISSDataJson => generateCoordinates(searchTimestamp, ISSDataJson))
        .catch(err => {
            // Reveals the results section so the error message can display for user
            showHide();
            $('#results-message').text('Something went wrong. Try again!')
        });
}

// Converts user input date and time to a unix timestamp format for use as API parameter
function convertDateTime(date, time) {
    unixTimestamp = new Date(`${date}T${time}`).getTime() / 1000;
    return unixTimestamp;
}

// Stores the current time as a unix timestamp
function logCurrentTime() {
    currentTime = Math.floor(Date.now() / 1000);
}

// Event listener, waiting for user to interact with buttons
function watchForm() {
    // Only input option on the landing page
    $('#landing-now-button').on('click', function () {
        logCurrentTime();
        tense = 'is';
        getPosition(currentTime);
    })

    // One of two options once user has received their first results
    // Will call for the present time
    $('#now-button').on('click', function () {
        logCurrentTime();
        tense = 'is';
        getPosition(currentTime);
    })

    // Second option once user has received their first results
    // Will call for a past or future date and time
    $('#iss-location-search').submit(event => {
        event.preventDefault();
        logCurrentTime();
        const searchDate = $('#date').val();
        const searchTime = $('#time').val();
        const unixTimestamp = convertDateTime(searchDate, searchTime);
        getPosition(unixTimestamp);
    })
}

$(watchForm);