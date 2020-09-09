'use strict';

var dinnerPlan = {
    id: 17354150,
    name: 'Sushi House'
}

var dessertPlan = {
    id: 'id',
    name: 'ShareTea'
}

var locationCoordinates = {
    latitude: 0,
    longitude: 0
}

const apiKey = 'fe850c92430159e0da149069f487adc8'; 
const apiKeyWeather = 'dcc1918d9ee5440ba661067d4f1eea46'
const searchURL = 'https://developers.zomato.com/api/v2.1/search';
const locationURL = 'https://developers.zomato.com/api/v2.1/locations'
const weatherURL = 'https://api.weatherbit.io/v2.0/forecast/hourly'

function renderDatePlan() {
    $('.js-plan').html(
        `<li item-id="${dinnerPlan.id}">
            <span>Dinner: ${dinnerPlan.name}</span>
        </li>
        <li item-id="${dessertPlan.id}">
            <span>Dessert: ${dessertPlan.name}</span>
        </li>`
    );
}

function handleItemSelect() {
    $('.js-results').on('click', '.js-select-dinner', event => {
        dinnerPlan.name = $(event.currentTarget).siblings('h4').text();
        renderDatePlan();
    });
    $('.js-results').on('click', '.js-select-dessert', event => {
        dessertPlan.name = $(event.currentTarget).siblings('h4').text();
        renderDatePlan();
    });
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            return queryItems.join('&');
}

function displayResultsLocation(responseJson, searchTerm) {
    let locationTitle = responseJson.location_suggestions[0].title;
    let planItem = '';
    if (searchTerm === 5) {
        planItem = 'dessert';
    }
    else {
        planItem = 'dinner';
    }
    $('.results h3').empty().append(`Displaying ${planItem} results for ${locationTitle}`);
    $('.js-results').empty();
}

function displayResults(responseJson, planItem) {
    console.log(responseJson);
    $('.js-results').empty();
    for (let i = 0; i < responseJson.restaurants.length; i++){
        $('.js-results').append(
            `<li><div id="${responseJson.restaurants[i].restaurant.id}">
                <h4>${responseJson.restaurants[i].restaurant.name}</h4>
                <p>${responseJson.restaurants[i].restaurant.cuisines}</p>
                <p>Rating: ${responseJson.restaurants[i].restaurant.user_rating.aggregate_rating}
                (${responseJson.restaurants[i].restaurant.user_rating.votes} reviews)</p>
                <p>${responseJson.restaurants[i].restaurant.location.locality}</p>
                <p>${responseJson.restaurants[i].restaurant.location.address}</p>
                <p>Hours:${responseJson.restaurants[i].restaurant.timings}</p>
                <button class="js-select-${planItem}">Select for ${planItem}</button>
            </div></li>`
        )};
    $('.results').removeClass('hidden');
};

function displayWeather(responseJson) {
    console.log(responseJson);
    $('.js-weather').empty();
    for (let i = 0; i < 12; i = i + 2) {
        $('.js-weather').append(
            `<li>Time: ${responseJson.data[i].timestamp_local}: ${responseJson.data[i].temp}°F</li>`
        );
    }
    $('#js-weather').removeClass('hidden');
}

function getCity(searchCity, searchTerm) {
    const params = {
        query: searchCity
    }
    const queryString = formatQueryParams(params)
    const url = locationURL + '?' + queryString;

    const options = {
        headers: new Headers({
          "user-key": apiKey})
    };
      
    fetch(url, options)
    .then(response => {
        if (response.ok) {
            return response.json();
        }
        throw new Error(response.statusText);
    })
    .then(responseJson => getLocationCode(responseJson, searchTerm))
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function getLocationCode(responseJson, searchTerm) {
    console.log(responseJson);
    displayResultsLocation(responseJson, searchTerm);
    locationCoordinates.latitude = responseJson.location_suggestions[0].latitude;
    locationCoordinates.longitude = responseJson.location_suggestions[0].longitude;
    const entityCode = responseJson.location_suggestions[0].entity_id;
    const entityType = responseJson.location_suggestions[0].entity_type;
    getWeather();
    getRestaurants(entityCode, entityType, searchTerm);
}

function getRestaurants(entityCode, entityType, searchTerm) {
    const params = {
        entity_id: entityCode,
        entity_type: entityType,
        cuisines: searchTerm,
        count: 25,
        sort: 'rating'
    };
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;

    let planItem = '';
    if (searchTerm === 5) {
        planItem = 'dessert';
    }
    else {
        planItem = 'dinner';
    }

    const options = {
        headers: new Headers({
          "user-key": apiKey})
      };

    fetch(url, options)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            displayResults(responseJson, planItem);
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function getWeather() {
    const params = {
        lat: locationCoordinates.latitude,
        lon: locationCoordinates.longitude,
        units: 'I',
        key: apiKeyWeather
    };
    const queryString = formatQueryParams(params)
    const url = weatherURL + '?' + queryString;

    console.log(url);

    fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error(response.statusText);
        })
        .then(responseJson => {
            displayWeather(responseJson);
        })
        .catch(err => {
            $('#js-error-message').text(`Something went wrong: ${err.message}`);
        });
}

function watchFormDessert() {
    $('#js-find-dessert').submit(event => {
        event.preventDefault();
        const searchCity = $('#js-city').val();
        getCity(searchCity, 5);
    });
}

function watchForm() {
    $('#js-find-dinner').submit(event => {
        event.preventDefault();
        const searchTerm = $('#js-cuisine').val();
        const searchCity = $('#js-city').val();
        getCity(searchCity, searchTerm);
    });
}

function handleApp() {
    watchForm();
    watchFormDessert();
    renderDatePlan();
    handleItemSelect();
}

$(handleApp);