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

if (navigator.geolocation) {
  // Fetching user position
  navigator.geolocation.getCurrentPosition(
    function (position) {
      // Fetching approximate latitude and longitude
      const { latitude, longitude } = position.coords;
      const coords = [latitude, longitude];

      //   const googleMaps = `https://www.google.pt/maps/@${latitude},${longitude}`;
      //   console.log(googleMaps);

      // Displaying leaflet map on user's coordinates
      const map = L.map("map").setView(coords, 12);
      L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      map.on("click", function (mapEvent) {
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
      });
    },
    // If the user location could not be fetched
    function () {
      alert("Unable to retrieve your location.");
    }
  );
}
