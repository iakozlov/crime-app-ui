ymaps.ready(init);
function init() {
    initApp();
    var jwtToken = "";
    var centerCordinates = {lat: 37.75740784154647, lng: -122.44584196135858};

    let message = document.getElementById("message");
    message.style.visibility = 'hidden';

    // init map
    var map = new ymaps.Map("map", {
    center: [centerCordinates.lat, centerCordinates.lng],
    zoom: 12
    });
    var myPlacemark = new ymaps.Placemark([centerCordinates.lat, centerCordinates.lng]);
    map.geoObjects.add(myPlacemark);

    var btn = document.getElementById("submit_button");
    btn.innerHTML = "TRAVEL HERE";
    map.events.add("click", function (e) {
        var myAlert = document.getElementById('myAlert');
        var coords = e.get('coords');
        var lat = coords[0];
        var lng = coords[1];
        myAlert.style.visibility = "hidden";
        if (lat > 37.819975492297004|| lat < 37.7078790224135 ||
            lng <  -122.513642064265 || lng > -122.365240723693) {

            var myAlert = document.getElementById('myAlert');
            myAlert.innerText = "Sorry, we don't have information about this area.";
            myAlert.style.visibility = "visible";
        } else {
            myPlacemark.geometry.setCoordinates(coords)
            console.log(ymaps.geocode(myPlacemark.geometry.getCoordinates()));
            centerCordinates.lat = lat;
            centerCordinates.lng = lng;
            btn.style.visibility = 'visible';
        }
    });

    const url = "http://127.0.0.1:8000/crime/analysis";
    let inputForm = document.getElementById("inputForm");
    var svg;
    var submitButton = document.getElementById("submit_button");
    //POST Request to get crime analysis
    inputForm.addEventListener("submit", (e) => {
        e.preventDefault()
        var date = document.getElementById("date").value
        var time = document.getElementById("appt").value+":00";
        var address = ymaps.geocode(myPlacemark.geometry.getCoordinates()).geoObjects
        if(address == undefined){
            address = "Some address in SF"
        }
        else{
            address = address[0]
        }
        var analysisRequest = new Object();
        analysisRequest.address = address;
        analysisRequest.date = date + " "+ time;
        analysisRequest.lat = centerCordinates.lng.toString();
        analysisRequest.lng = centerCordinates.lat.toString();
        fetch(url, {
            method: "POST",
            body: JSON.stringify(analysisRequest),
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken,
                'Refer': 'http://127.0.0.1:8000/crime/analysis',
            }
        }).then(
            response => response.text()
        ).then(
            (data) => {
                console.log(data);
                var result = JSON.parse(data)
                var array = result.analysis.crimes
                console.log(array[0].probability)
                buildPieChart(
                    array[0].probability,
                    array[1].probability,
                    array[2].probability,
                    svg,
                    array[0].name,
                    array[1].name,
                    array[2].name);
                submitButton.disabled = false;
            }

        ).catch(
            error => console.error(error)
        )

    });

    let historyForm = document.getElementById("getTripsForm");
    let tripsMessage = document.getElementById("tripsMessage");
    //POST Request to get history of requests
    historyForm.addEventListener("submit", (e) => {
        e.preventDefault()
        fetch("http://127.0.0.1:8000/crime/history", {
            method: "POST",
            headers:{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + jwtToken,
                'Refer': 'http://127.0.0.1:8000/crime/history',
            }
        })
        .then(
            response => response.text())
        .then(
            (data) => {
                console.log(data);
                makeDataReadable(data);
            }
        ).catch(
        error => console.error(error)
    )

    });

    var registerButton = document.getElementById("sign_up button");
    var loginButton = document.getElementById("sign_in button");
    var usernameField = document.getElementById("username_input")
    const signInUrl = "http://127.0.0.1:8000/users/login";
    const signUpUrl = "http://127.0.0.1:8000/users/registry";
    var passwordField = document.getElementById("password_input")
    registerButton.addEventListener("click", (e) =>{
        e.preventDefault()
        var registerRequest = new Object()
        registerRequest.login = usernameField.value
        registerRequest.password = passwordField.value
        //POST request to register
        fetch(signUpUrl, {
            method: "POST",
            body: JSON.stringify(registerRequest),
            headers:{
                'Content-Type': 'application/json',
            }
        })
        .then(response =>{
            if(response.status == 201){
                alert("Success")
            }
            if(response.status == 400){
                alert("User already exists")
            }
            return response.text()
        })
        .catch(error =>{ 
            console.log(error)})
    }
    );

    loginButton.addEventListener("click", (e) =>{
        e.preventDefault()
        var registerRequest = new Object()
        registerRequest.login = usernameField.value
        registerRequest.password = passwordField.value
        //POST request to log in
        fetch(signInUrl, {
            method: "POST",
            body: JSON.stringify(registerRequest),
            headers:{
                'Content-Type': 'application/json',
            }
        })
        .then(response => response.text())
        .then( (data) => {
            jwtToken = JSON.parse(data).token;
            console.log(jwtToken);
            alert("You are logged in successfully");
        }
        )
        .catch(error =>{ 
            alert(error)
            console.log(error)})
    }
    )
}

//function for building pie chart with crime analysis
function buildPieChart(first_crime, second_crime, third_crime, svg, name1, name2, name3) {
    var width = 450
    height = 450
    margin = 40

// The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
    let radius = Math.min(width, height) / 2 - margin;

// append the svg object to the div called 'my_dataviz'
    d3.select("svg").remove();
    var svg = d3.select("#my_dataviz")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

// Create dummy data
    var data = {};
    data[name1] = first_crime;
    data[name2] = second_crime;
    data[name3] = third_crime;

// set the color scale
    var color = d3.scaleOrdinal()
        .domain(data)
        .range(d3.schemeSet2);

// Compute the position of each group on the pie:
    var pie = d3.pie()
        .value(function (d) {
            return d.value;
        })
    var data_ready = pie(d3.entries(data))
// Now I know that group A goes from 0 degrees to x degrees and so on.

// shape helper to build arcs:
    var arcGenerator = d3.arc()
        .innerRadius(0)
        .outerRadius(radius)

// Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', arcGenerator)
        .attr('fill', function (d) {
            return (color(d.data.key))
        })
        .attr("stroke", "black")
        .style("stroke-width", "2px")
        .style("opacity", 0.7)

// Now add the annotation. Use the centroid method to get the best coordinates
    svg
        .selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function (d) {
            return d.data.key+ " "+(Math.round(d.data.value*100))+"%";
        })
        .attr("transform", function (d) {
            return "translate(" + arcGenerator.centroid(d) + ")";
        })
        .style("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .style("font-size", 14)
}

// function for drawing user history
function makeDataReadable(data){
    result = JSON.parse(data);
    history = result.history;
    console.log(result.history.history[0]);
    var historyArray = result.history.history
    if(historyArray.length == 0){
        return "You don't have any trips yet";
    }
    document.getElementById("list_group").innerHTML = "";
    for(var i = 0; i < historyArray.length; i++){
        var node = document.createElement("LI");
        var crimes = "";
        for (var j = 0; j < historyArray[i].CrimeAnalysis.crimes.length; j++){
            crimes = crimes + historyArray[i].CrimeAnalysis.crimes[j].name + " :" + historyArray[i].CrimeAnalysis.crimes[j].probability + "; "
        }
        var text = "Address: "+ historyArray[i].Address + "; Analysis: " + crimes + "Date: " + historyArray[i].RequestDate
        console.log(text)
        node.className = "list-group-item";// Create a <li> node
        var textnode = document.createTextNode((i+1).toString()+")"+text);         // Create a text node
        node.appendChild(textnode);
        document.getElementById("list_group").appendChild(node);
    }
}

function initApp(){
    //init modal windows settings
    var modal = document.getElementsByClassName('modal');
    var span = document.getElementsByClassName('close');
    var infoMenu = document.getElementById("info_menu");
    var crimeMenu = document.getElementById("crime_menu");
    infoMenu.onclick = function (){
        modal[0].style.display = "block";
        crimeMenu.disabled = true;
    }
    crimeMenu.onclick = function (){
        modal[1].style.display = "block";
        infoMenu.disabled = true;
    }
    span[0].onclick = function (){
        modal[0].style.display = "none";
        crimeMenu.disabled = false;
    }
    span[1].onclick = function (){
        modal[1].style.display = "none";
        infoMenu.disabled = false;
    }

 
}