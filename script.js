"use strict";

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");

class App {
  #map;
  #mapEvent;

  constructor() {
    // On page load, run the _getPosition() function
    this._getPosition();

    // User submits a new workout
    form.addEventListener("submit", this._newWorkout.bind(this));

    // Changing form inputs on workout option change
    inputType.addEventListener("change", this._toggleElevationField);
  }

  // Fetch user location
  _getPosition() {
    if (navigator.geolocation) {
      // Fetching user position
      navigator.geolocation.getCurrentPosition(
        // On Success
        this._loadMap.bind(this),

        // On Error
        function () {
          alert("Unable to retrieve your location.");
        }
      );
    }
  }

  // Display the map
  _loadMap(position) {
    // Fetching approximate latitude and longitude
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    // Displaying leaflet map on user's coordinates
    this.#map = L.map("map").setView(coords, 12);
    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Display workout form
    this.#map.on("click", this._showForm.bind(this));
  }

  // Display the workout form for the user to fill
  _showForm(e) {
    // Setting the map event
    this.#mapEvent = e;

    // Display the workout form
    form.classList.remove("hidden");

    // Automatically set the focus to the first input box
    inputDistance.focus();
  }

  // Change input field on option selection
  _toggleElevationField() {
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
  }

  // User submits a new workout
  _newWorkout(e) {
    e.preventDefault();

    // Fetching the position where the user clicked
    const { lat, lng } = this.#mapEvent.latlng;
    const pinCoord = [lat, lng];

    // Adding the popup marker to the place where the user clicked
    L.marker(pinCoord)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: "running-popup",
        })
      )
      .setPopupContent("Workout")
      .openPopup();

    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        "";
  }
}

// Initializing the app class
const app = new App();
