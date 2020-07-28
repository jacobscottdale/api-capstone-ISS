const taApiKey = "57b3727e23msh192554544a0e32dp1cabd6jsnbf7625af0664";

const gDBCitiesApiKey = "57b3727e23msh192554544a0e32dp1cabd6jsnbf7625af0664";




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

function getNearestCity(lat, lon) {
    
}

function generateCoordinates(data) {
    const lat = data.latitude;
    const lon = data.longitude;
    console.log(`The ISS coordinates are ${lat}, ${lon}`);
    getNearestCity(lat, lon);
}

function getPosition(searchTimestamp) {
    console.log(`'getPosition' ran`);
    ISSURL = generateISSURL(searchTimestamp);
    console.log(ISSURL);
    fetch(ISSURL)
    .then(response => response.json())
    .then(responseJson => generateCoordinates(responseJson));
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