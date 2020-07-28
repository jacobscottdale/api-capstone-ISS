const taApiKey = "57b3727e23msh192554544a0e32dp1cabd6jsnbf7625af0664";

const gDBCitiesApiKey = "57b3727e23msh192554544a0e32dp1cabd6jsnbf7625af0664";




function convertDateTime(date, time) {
    // Converts user-input date and time to unix timestamp for https://api.wheretheiss.at/v1/satellites/25544/positions endpoint 'timestamp' parameter
    // i.e. https://api.wheretheiss.at/v1/satellites/25544/positions?timestamps=1596133200&units=miles
    console.log(`'convertDateTime' ran, returned placeholder`);
    return 1596133200;
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

function getCoordinates(data) {
    const lat = data.latitude;
    const lon = data.longitude;
    console.log(`The ISS coordinates are ${lat}, ${lon}`);
}

function getPosition(searchTimestamp) {
    console.log(`'getPosition' ran`);
    ISSURL = generateISSURL(searchTimestamp);
    console.log(ISSURL);
    fetch(ISSURL)
    .then(response => response.json())
    .then(responseJson => getCoordinates(responseJson));
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
        const searchTimestamp = convertDateTime(searchDate, searchTime);
        getPosition(searchTimestamp);
    })
}

$(watchForm);