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

let map, mapEvent;

if (navigator.geolocation) {
  // Fetching user position
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // Fetching approximate latitude and longitude
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      // Displaying leaflet map on user's coordinates
      map = L.map("map").setView(coords, 12);
      L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", function (e) {
        // Setting the map event
        mapEvent = e;

        // Display the workout form
        form.classList.remove("hidden");

        // Automatically set the focus to the first input box
        inputDistance.focus();
      });
    },
    // If the user location could not be fetched
    function () {
      alert("Unable to retrieve your location.");
    }
  );
}

form.addEventListener("submit", function (e) {
  e.preventDefault();

  // Fetching the position where the user clicked
  const { lat, lng } = mapEvent.latlng;
  const pinCoord = [lat, lng];

  // Adding the popup marker to the place where the user clicked
  L.marker(pinCoord)
    .addTo(map)
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
});

// Changing form inputs on workout option change
inputType.addEventListener("change", function () {
  inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
});
