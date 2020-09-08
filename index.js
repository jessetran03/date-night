'use strict';

var dinnerPlan = {
    id: 17354150,
    name: 'Sushi House'
}

var dessertPlan = {
    id: 'id',
    name: 'ShareTea'
}

const apiKey = 'fe850c92430159e0da149069f487adc8'; 
const searchURL = 'https://developers.zomato.com/api/v2.1/search';
const locationURL = 'https://developers.zomato.com/api/v2.1/locations'

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
        dinnerPlan.name = $(event.currentTarget).siblings('h3').text();
        renderDatePlan();
    });
    $('.js-results').on('click', '.js-select-dessert', event => {
        dessertPlan.name = $(event.currentTarget).siblings('h3').text();
        renderDatePlan();
    });
}

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
            return queryItems.join('&');
}

function displayResults(responseJson) {
    console.log(responseJson);
    $('.results h3').empty().append(`Displaying dinner results for ${responseJson.restaurants[0].restaurant.location.city}`);
    $('.js-results').empty();
    for (let i = 0; i < responseJson.restaurants.length; i++){
        $('.results ul').append(
            `<li><div id="${responseJson.restaurants[i].restaurant.id}">
                <h3>${responseJson.restaurants[i].restaurant.name}</h3>
                <p>${responseJson.restaurants[i].restaurant.cuisines}</p>
                <p>Average user rating: ${responseJson.restaurants[i].restaurant.user_rating.aggregate_rating}</p>
                <p>${responseJson.restaurants[i].restaurant.location.locality}</p>
                <p>${responseJson.restaurants[i].restaurant.location.address}</p>
                <button class="js-select-dinner">Select</button>
            </div></li>`
        )};
    $('.results').removeClass('hidden');
};

function displayDessertResults(responseJson) {
    console.log(responseJson);
    $('.results h3').empty().append(`Displaying dessert results for ${responseJson.restaurants[0].restaurant.location.city}`);
    $('.js-results').empty();
    for (let i = 0; i < responseJson.restaurants.length; i++){
        $('.results ul').append(
            `<li><div id="${responseJson.restaurants[i].restaurant.id}">
                <h3>${responseJson.restaurants[i].restaurant.name}</h3>
                <p>${responseJson.restaurants[i].restaurant.cuisines}</p>
                <p>Average user rating: ${responseJson.restaurants[i].restaurant.user_rating.aggregate_rating}</p>
                <p>${responseJson.restaurants[i].restaurant.location.locality}</p>
                <p>${responseJson.restaurants[i].restaurant.location.address}</p>
                <button class="js-select-dessert">Select</button>
            </div></li>`
        )};
    $('.results').removeClass('hidden');
};

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
    .then(responseJson => getEntityCode(responseJson, searchTerm))
    .catch(err => {
        $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function getEntityCode(responseJson, searchTerm) {
    console.log(responseJson);
    const entityCode = responseJson.location_suggestions[0].entity_id;
    const entityType = responseJson.location_suggestions[0].entity_type;
    getRestaurants(entityCode, entityType, searchTerm);
}

function getRestaurants(entityCode, entityType, searchTerm) {
    const params = {
        entity_id: entityCode,
        entity_type: entityType,
        cuisines: searchTerm,
        count: 50,
        sort: 'rating'
    };
    const queryString = formatQueryParams(params)
    const url = searchURL + '?' + queryString;

    console.log(url);

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
            if (searchTerm === 5) {
                displayDessertResults(responseJson);
            }
            else {
                displayResults(responseJson);
            }
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