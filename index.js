'use strict';

var dinnerPlan = {
    id: 17354150,
    name: 'Sushi House'
}

var dessertPlan = {
    id: 17355196,
    name: 'Spark Cafe'
}

var currentLocation = {
    title: '',
    latitude: 0,
    longitude: 0,
    entityCode: 0,
    entityType: ''
}

const apiKey = 'fe850c92430159e0da149069f487adc8'; 
const apiKeyWeather = 'dcc1918d9ee5440ba661067d4f1eea46'
const searchURL = 'https://developers.zomato.com/api/v2.1/search';
const locationURL = 'https://developers.zomato.com/api/v2.1/locations'
const weatherURL = 'https://api.weatherbit.io/v2.0/forecast/hourly'

/*-----------------------FORMAT-FUNCTIONS----------------------*/

function formatHours(rawHours) {
    let hours = rawHours.split(',');
    return hours;
}

function formatTime(rawTime) {
    let time = rawTime.substring(11, 13);
    time = parseInt(time);
    if (time === 0) {
        time = '12am';
    }
    else if (time === 12) {
        time = '12pm';
    }
    else if (time < 12) {
        time = time + 'am';
    }
    else {
        time = (time - 12) + 'pm';
    }
    return time;
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            return queryItems.join('&');
}

/*-----------------------------------RENDER-FUNCTIONS------------------------------*/

function renderDatePlan() {
    $('.js-plan').html(
        `<li item-id="${currentLocation.entityCode}">
            <h5>Location</h5>
            <p>${currentLocation.title}</span>
        </li>
        <li item-id="${dinnerPlan.id}">
            <h5>Dinner</h5>
            <p id="js-dinner">${dinnerPlan.name}</span>
        </li>
        <li item-id="${dessertPlan.id}">
            <h5>Dessert</h5>
            <p id="js-dessert">${dessertPlan.name}</span>
        </li>`
    );
    $('.group, .title').removeClass('hidden');
    $('.initial').remove();
}

function displayWeather(responseJson) {
    console.log(responseJson);
    $('.js-weather').empty();
    for (let i = 0; i < 12; i = i + 2) {
        const time = formatTime(responseJson.data[i].timestamp_local);
        $('.js-weather').append(
            `<li>${time}: ${responseJson.data[i].temp}°F</li>`
        );
    }
    $('#js-weather').removeClass('hidden');
}

function displayResultsHeader(searchTerm) {
    let planItem = '';
    if (searchTerm === 5) {
        planItem = 'dessert';
    }
    else {
        planItem = 'dinner';
    }
    $('.results h3').empty().append(`Displaying results for ${planItem} in ${currentLocation.title}`);
    $('.js-results').empty();
}

function displayResults(responseJson, planItem) {
    console.log(responseJson);
    $('.js-results').empty();
    for (let i = 0; i < responseJson.restaurants.length; i++){
        const hours = formatHours(responseJson.restaurants[i].restaurant.timings);
        const id = responseJson.restaurants[i].restaurant.id;
        $('.js-results').append(
            `<li>
                <div id="${id}" class="results-item">
                    <div class="restaurant-first">
                        <h4>${responseJson.restaurants[i].restaurant.name}</h4>
                        <p class="results-cuisine">${responseJson.restaurants[i].restaurant.cuisines}</p>
                        <p>Rating: ${responseJson.restaurants[i].restaurant.user_rating.aggregate_rating}
                        (${responseJson.restaurants[i].restaurant.user_rating.votes} reviews)</p>
                        <p>${responseJson.restaurants[i].restaurant.location.address}</p>
                    </div>
                    <p><u>Hours</u>:</p>`
        );
        for (let j = 0; j < hours.length; j++) {
            $(`#${id}`).append(    
                `<p>${hours[j]}</p>`
            );
        }
        $(`#${id}`).append(
                    `<button class="js-select-${planItem}">Select for ${planItem}</button>
                </div>
            </li>`
        );
    }
    $('.results').removeClass('hidden');
};

/*---------------------------------GET-FUNCTIONS-----------------------------*/

function getLocationCode(responseJson, searchTerm) {
    console.log(responseJson);
    currentLocation.latitude = responseJson.location_suggestions[0].latitude;
    currentLocation.longitude = responseJson.location_suggestions[0].longitude;
    currentLocation.entityCode = responseJson.location_suggestions[0].entity_id;
    currentLocation.entityType = responseJson.location_suggestions[0].entity_type;
    currentLocation.title = responseJson.location_suggestions[0].title;
    renderDatePlan();
    getWeather();
    getRestaurants(searchTerm);
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

function getWeather() {
    const params = {
        lat: currentLocation.latitude,
        lon: currentLocation.longitude,
        units: 'I',
        key: apiKeyWeather
    };
    const queryString = formatQueryParams(params)
    const url = weatherURL + '?' + queryString;

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

function getRestaurants(searchTerm) {
    displayResultsHeader(searchTerm);

    const params = {
        entity_id: currentLocation.entityCode,
        entity_type: currentLocation.entityType,
        cuisines: searchTerm,
        count: 25,
        sort: 'rating'
    };
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;
    const options = {
        headers: new Headers({
          "user-key": apiKey})
      };

    let planItem = '';
    if (searchTerm === 5) {
        planItem = 'dessert';
    }
    else {
        planItem = 'dinner';
    }

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

/*------------------------------EVENT-LISTENERS-----------------------------------*/

function handleItemSelect() {
    $('.js-results').on('click', '.js-select-dinner', event => {
        dinnerPlan.name = $(event.currentTarget).siblings('.restaurant-first').children('h4').text();
        renderDatePlan();
    });
    $('.js-results').on('click', '.js-select-dessert', event => {
        dessertPlan.name = $(event.currentTarget).siblings('.restaurant-first').children('h4').text();
        renderDatePlan();
    });
}

function watchInitialSearch() {
    $('#js-initial-search').submit(event => {
        event.preventDefault();
        const searchCity = $('#js-city').val();
        getCity(searchCity, 1);
    });
}

function watchChangeLocation() {
    $('#js-change-location').submit(event => {
        event.preventDefault();
        const searchCity = $('#js-city').val();
        getCity(searchCity, 5);
    });
}

function watchDinner() {
    $('.group-one').on('click', '.js-find-dinner', event => {
        event.preventDefault();
        const searchTerm = $('#js-cuisine').val();
        getRestaurants(searchTerm);
    });
}

function watchDessert() {
    $('.group-one').on('click', '.js-find-dessert', event => {
        event.preventDefault();
        getRestaurants(5);
    });
}

function handleApp() {
    watchInitialSearch();
    watchChangeLocation();
    watchDinner();
    watchDessert();
    handleItemSelect();
}

$(handleApp);