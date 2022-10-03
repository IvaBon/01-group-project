//Global Variables

var citySearches = JSON.parse(localStorage.getItem("cityNamesArray"));

var cardDeck;
var card;
var carImg;
var cardBody;
var cardTitle;
var cardItems;
var cityName;
var cityPop;
var chartDiv;
var chartContainer;
// Functions to navigate through API and get the proper data

function getCity(city) {
  fetch('https://api.teleport.org/api/cities/?search=' + city)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {

    var geo = data._embedded["city:search-results"][0]._links["city:item"].href;
    getAPI(geo);
  });
}

function getAPI(city) {
  fetch(city)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    cityName = data.name;
    var urbanArea = data._links["city:urban_area"].href;
    getUA(urbanArea);
  });
}

function getUA(UA) {
  fetch(UA)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    var scores = data._links["ua:scores"].href;
    var details = data._links["ua:details"].href;
    // var salaries = data._links["ua:salaries"].href;
    var cityName = data.name;
    getUAdetails(details, cityName);
    getUAscores(scores, cityName);
    // getUAsalaries(salaries);
  });
}

function getUAscores(scores, cityName) {
  fetch(scores)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    console.log(data);
    createGraph(data, cityName);
  });
}

function getUAdetails(details, UAname) {
  fetch(details)
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    var colInfo = data.categories.find(x => x.id == "COST-OF-LIVING").data;
    var rentInfo = data.categories.find(x => x.id == "HOUSING").data;
    var climateInfo = data.categories.find(x => x.id == "CLIMATE")?.data;
    var popSize = data.categories.find(x => x.id == "CITY-SIZE").data[0].float_value;
    var UA = UAname;
    createTopCard(UA);
    createSecondCard(colInfo, rentInfo, climateInfo, popSize);
  });

}

// function getUAsalaries(salaries) {
//   fetch(salaries)
//   .then(function (response) {
//     return response.json();
//   })
//   .then(function (data) {
//   });
// }

// Functions to dynamically create the cards and append the cards to the desired info
function createTopCard(UA){
  cardDeck=$('.city-card-group');

  card=$("<div class='col-12 card border-info'>");
  carImg=$('<img class=card-img-top>');
  cardBody=$("<div class='card-body text-info'>");
  cardTitle=$("<h3 class='card-title text-info'>");

  cardTitle.text(UA)
  cardDeck.append(card);
  card.append(carImg,cardBody);
  cardBody.append(cardTitle);
}

function createSecondCard(colInfo, rentInfo, climateInfo, popInfo){
  cardDeck=$('.ua-card-group');
  
  card=$("<div class='col-12 card'>");
  cardBody=$('<div class=card-body>');
  cardTitle=$('<h5 class=card-title>');
  cardDeck.append(card);
  card.append(cardBody);

  cardTitle.text("Urban Area Population");
  cardBody.append(cardTitle);
  cardItems=$('<p>').text(popInfo + " million");
  cardBody.append(cardItems);
  
  cardTitle=$('<h5 class=card-title>');
  cardTitle.text("Cost of Living");
  
  cardBody.append(cardTitle);

  if (colInfo == null) {
    cardItems=$('<p>');
    cardItems.text("No Data Available");
    cardBody.append(cardItems);
  } else {
    for (var i=1; i<colInfo.length; i++) {
      var cost = colInfo[i].currency_dollar_value;
      var label = colInfo[i].label;
      cardItems=$('<p>');
      cardItems.text(label + ": $" + cost);
      cardBody.append(cardItems)
    }
    for (var i=0; i<rentInfo.length-1; i++) {
      var cost = rentInfo[i].currency_dollar_value;
      var label = rentInfo[i].label;
      cardItems=$('<p>');
      cardItems.text(label + ": $" + cost + "/monthly");
      cardBody.append(cardItems)
    }
  }

  cardTitle=$('<h5 class=card-title>');
  cardTitle.text("Climate");
  cardBody.append(cardTitle);

  if (climateInfo == null) {
    cardItems=$('<p>');
    cardItems.text("No Data Available");
    cardBody.append(cardItems);
  } else {
    for (var i=0; i<climateInfo.length; i++) {
      var value = climateInfo[i].float_value;
      var label = climateInfo[i].label;
      if (value == null) {
        value = climateInfo[i].percent_value;
      }
      if (value == null) {
        value = climateInfo[i].string_value;
      }
      cardItems=$('<p>');
      cardItems.text(label + ": " + value);
      cardBody.append(cardItems);
    }
  }
};

// Functions to create a graph with desired info
function createGraph (scores, cityName) {
  var charts = $('.charts')
  chartDiv = $('<div class=chartContainer>')
  console.log(cityName)
  
  var chart = c3.generate({
    data: {
      x : 'x',
      columns: [
        ['x', cityName],
        [scores.categories[0].name, scores.categories[0].score_out_of_10],
        [scores.categories[1].name, scores.categories[1].score_out_of_10],
        [scores.categories[2].name, scores.categories[2].score_out_of_10],
      ],
      groups: [
        [scores.categories[0].name, ]
      ],
      type: 'bar'
    },
    axis: {
      x: {
        type: 'category' // this needed to load string x value
      }
    }
    
  });
  
  console.log(chart)
  charts.append(chartDiv)
  chartDiv.append(chart)
}
// Function to get API information on load of second page

for (var i = 0; i < citySearches.length; i++) {
  getCity(citySearches[i]);
}

