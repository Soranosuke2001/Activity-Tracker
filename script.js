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

// Parent Workout class
class Workout {
  id = (Date.now() + "").slice(-10);
  date = new Date();

  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

// Child Running class
class Running extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;

    // Calculate the pace of the workout
    this.calcPace();
  }

  // Calculate the pace of the workout
  calcPace() {
    // km/min
    this.pace = this.distance / this.duration;
    return this.pace;
  }
}

// Child Cycling class
class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;

    // Calculate the speed of the workout
    this.calcSpeed();
  }

  // Calculate the speed of the workout
  calcSpeed() {
    // km/hr
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}
class App {
  #map;
  #mapEvent;
  #workouts = [];

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

  // Check data validity
  _checkDataValidity(type, ...inputs) {
    if (type === "running") {
      const validValue = inputs.every(input => Number.isFinite(input));

      const positiveInt = inputs.every(input => input > 0);

      if (validValue && positiveInt) return true;
      else return false;
    }

    if (type === "cycling") {
      const validValue = inputs.every(input => Number.isFinite(input));
      inputs.pop();
      const positiveInt = inputs.every(input => input > 0);

      if (validValue && positiveInt) return true;
      else return false;
    }
  }

  // User submits a new workout
  _newWorkout(e) {
    e.preventDefault();

    let workout;

    // Fetching the position where the user clicked
    const { lat, lng } = this.#mapEvent.latlng;
    const pinCoord = [lat, lng];

    // Get form data
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;

    // Check the type of workout
    if (type === "running") {
      const cadence = +inputCadence.value;

      // Check data validity
      if (!this._checkDataValidity(type, distance, duration, cadence))
        return alert("Please enter a valid input: (distance/duration/cadence)");

      // Create a new running instance
      workout = new Running(pinCoord, distance, duration, cadence);
    }

    if (type === "cycling") {
      const elevation = +inputElevation.value;

      // Check data validity
      if (!this._checkDataValidity(type, distance, duration, elevation))
        return alert(
          "Please enter a valid input: (distance/duration/elevation)"
        );

      // Create a new cycling instance
      workout = new Cycling(pinCoord, distance, duration, elevation);
    }

    // Add the workout to the workout array
    this.#workouts.push(workout);

    // Display the workout pin on the map
    this.workoutPin(workout);

    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        "";
  }

  workoutPin(workout) {
    // Adding the popup marker to the place where the user clicked
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(workout.type)
      .openPopup();
  }
}

// Initializing the app class
const app = new App();
