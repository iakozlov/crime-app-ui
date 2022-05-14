// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"main.js":[function(require,module,exports) {
function initMap() {
  initApp();
  var uluru = {
    lat: 37.75740784154647,
    lng: -122.44584196135858
  };
  var message = document.getElementById("message");
  message.style.visibility = 'hidden'; // The map, centered at Uluru

  var map = new google.maps.Map(document.getElementById("map"), {
    zoom: 4,
    center: uluru
  }); // The marker, positioned at Uluru

  var marker = new google.maps.Marker({
    position: uluru,
    map: map
  });
  var btn = document.getElementById("submit_button");
  btn.innerHTML = "TRAVEL HERE";
  map.addListener("click", function (e) {
    var myAlert = document.getElementById('myAlert');
    myAlert.style.visibility = "hidden";

    if (e.latLng.lat() > 37.819975492297004 || e.latLng.lat < 37.7078790224135 || e.latLng.lng() < -122.513642064265 || e.latLng.lng() > -122.365240723693) {
      var myAlert = document.getElementById('myAlert');
      myAlert.innerText = "Sorry, we don't have information about this area.";
      myAlert.style.visibility = "visible";
    } else {
      marker.setMap(null);
      marker = new google.maps.Marker({
        position: e.latLng,
        map: map
      });
      uluru.lat = e.latLng.lat();
      uluru.lng = e.latLng.lng();
      map.setZoom(12);
      map.panTo(e.latLng);
      btn.style.visibility = 'visible';
    }
  });
}

function buildPieChart(first_crime, second_crime, third_crime, svg, name1, name2, name3) {
  var width = 450;
  height = 450;
  margin = 40; // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.

  var radius = Math.min(width, height) / 2 - margin; // append the svg object to the div called 'my_dataviz'

  d3.select("svg").remove();
  var svg = d3.select("#my_dataviz").append("svg").attr("width", width).attr("height", height).append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"); // Create dummy data

  var data = {};
  data[name1] = first_crime;
  data[name2] = second_crime;
  data[name3] = third_crime; // set the color scale

  var color = d3.scaleOrdinal().domain(data).range(d3.schemeSet2); // Compute the position of each group on the pie:

  var pie = d3.pie().value(function (d) {
    return d.value;
  });
  var data_ready = pie(d3.entries(data)); // Now I know that group A goes from 0 degrees to x degrees and so on.
  // shape helper to build arcs:

  var arcGenerator = d3.arc().innerRadius(0).outerRadius(radius); // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.

  svg.selectAll('mySlices').data(data_ready).enter().append('path').attr('d', arcGenerator).attr('fill', function (d) {
    return color(d.data.key);
  }).attr("stroke", "black").style("stroke-width", "2px").style("opacity", 0.7); // Now add the annotation. Use the centroid method to get the best coordinates

  svg.selectAll('mySlices').data(data_ready).enter().append('text').text(function (d) {
    return d.data.key + " " + Math.round(d.data.value * 100) + "%";
  }).attr("transform", function (d) {
    return "translate(" + arcGenerator.centroid(d) + ")";
  }).style("text-anchor", "middle").attr("font-family", "sans-serif").style("font-size", 14);
}

function makeDataReadable(data) {
  data = JSON.stringify(data);

  if (data == "[]") {
    return "You don't have any trips yet";
  }

  data = data.replace(/['"]+/g, '');
  data = data.replace(/\\/g, '');
  var begin = data.lastIndexOf("[");
  var end = data.indexOf("]");
  var res_str = data.substr(begin + 1, end - begin - 1);
  var splited_data = res_str.split("; ");
  document.getElementById("list_group").innerHTML = "";

  for (var i = 0; i < splited_data.length; i++) {
    var node = document.createElement("LI");
    node.className = "list-group-item"; // Create a <li> node

    var textnode = document.createTextNode((i + 1).toString() + ")" + splited_data[i]); // Create a text node

    node.appendChild(textnode);
    document.getElementById("list_group").appendChild(node);
  }
}

function initApp() {
  //init modal windows settings
  var modal = document.getElementsByClassName('modal');
  var span = document.getElementsByClassName('close');
  var infoMenu = document.getElementById("info_menu");
  var crimeMenu = document.getElementById("crime_menu");

  infoMenu.onclick = function () {
    modal[0].style.display = "block";
    crimeMenu.disabled = true;
  };

  crimeMenu.onclick = function () {
    modal[1].style.display = "block";
    infoMenu.disabled = true;
  };

  span[0].onclick = function () {
    modal[0].style.display = "none";
    crimeMenu.disabled = false;
  };

  span[1].onclick = function () {
    modal[1].style.display = "none";
    infoMenu.disabled = false;
  };

  var geocoder = new google.maps.Geocoder();
  var uluru = {
    lat: 37.75740784154647,
    lng: -122.44584196135858
  };
  var url = "127.0.0.1:5555";
  var inputForm = document.getElementById("inputForm");
  var svg;
  var submitButton = document.getElementById("submit_button"); //POST Request to get crime analysis

  inputForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var time = document.getElementById("date").value;
    geocoder.geocode({
      location: uluru
    }, function (results, status) {
      if (status === "OK") {
        if (results[0]) {
          ;
          var geocodedAddressArr = results[0].formatted_address.split(", ");
          var geocodedAddress = geocodedAddressArr.join(" ");

          if (time != "") {
            var time_h = document.getElementById("appt").value;
            var a;
            var myAlert = document.getElementById('myAlert');
            myAlert.style.visibility = "hidden";
            var a = new Object();
            a.lat = uluru.lat.toString();
            a.lng = uluru.lng.toString();
            a.date = time;

            if (time_h != "") {
              a.time = time_h + ":00";
            } else {
              a.time = "12:00:00";
            }

            a.username = document.getElementById("usernameForTrips").value;
            a.address = geocodedAddress;
            submitButton.disabled = true;
            fetch(url, {
              method: "POST",
              body: JSON.stringify(a),
              headers: {
                'Content-Type': 'application/json'
              }
            }).then(function (response) {
              return response.text();
            }).then(function (data) {
              data = JSON.stringify(data);
              data = data.replace(/\\/g, '');
              data = data.replace('r', '');
              data = data.replace(/['"]+/g, '');
              buildPieChart(parseFloat(data.split(";")[0].split(":")[1]), parseFloat(data.split(";")[1].split(":")[1]), parseFloat(data.split(";")[2].split(":")[1]), svg, data.split(";")[0].split(":")[0], data.split(";")[1].split(":")[0], data.split(";")[2].split(":")[0]);
              submitButton.disabled = false;
            }).catch(function (error) {
              return console.error(error);
            });
          } else {
            var myAlert = document.getElementById('myAlert');
            myAlert.innerText = "You should enter date of travelling.";
            myAlert.style.visibility = "visible";
          }
        } else {
          alert("No results found");
        }
      } else {
        alert("Geocoder failed due to: " + status);
      }
    });
  });
  var historyForm = document.getElementById("getTripsForm");
  var tripsMessage = document.getElementById("tripsMessage"); //GET Request to get history of requests

  historyForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("username").value;
    var myAlert = document.getElementById('myAlert');
    myAlert.style.visibility = "hidden";

    if (name.trim() != "") {
      tripsMessage.setAttribute('value', name);
      var formData = new FormData(historyForm);
      fetch("http://127.0.0.1:5555/reg" + "?username=" + name).then(function (response) {
        return response.text();
      }).then(function (data) {
        makeDataReadable(data);
      }).catch(function (error) {
        return console.error(error);
      });
    } else {
      var myAlert = document.getElementById('myAlert');
      myAlert.innerText = "Name shouldn't be empty.";
      myAlert.style.visibility = "visible";
    }
  });
}
},{}],"../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "54494" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../usr/local/lib/node_modules/parcel-bundler/src/builtins/hmr-runtime.js","main.js"], null)
//# sourceMappingURL=/main.1f19ae8e.js.map