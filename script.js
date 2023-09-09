"use strict";

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

  _createDescription() {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
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

    // Create the workout description
    this._createDescription();
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

    // Create the workout description
    this._createDescription();
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
  #mapZoom = 13;

  constructor() {
    // Setting up Leaflet API
    this._getPosition();

    // Fetch saved workouts
    this._fetchWorkouts();

    // User submits a new workout
    form.addEventListener("submit", this._newWorkout.bind(this));

    // Changing form inputs on workout option change
    inputType.addEventListener("change", this._toggleElevationField);

    // Pan to each workout pin event handler
    containerWorkouts.addEventListener("click", this._panToPin.bind(this));
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
    this.#map = L.map("map").setView(coords, this.#mapZoom);
    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Display workout form
    this.#map.on("click", this._showForm.bind(this));

    // Display the previously saved workouts on the map
    this.#workouts.forEach(workout => {
      this._workoutPin(workout);
    });
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

  _hideForm() {
    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputElevation.value =
      inputCadence.value =
        "";

    form.style.display = "none";
    form.classList.add("hidden");

    setTimeout(() => (form.style.display = "grid"), 1000);
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
    this._workoutPin(workout);

    // Display the list of workouts
    this._displayWorkout(workout);

    // Hide the new workout form
    this._hideForm();

    // Save workouts to local storage
    this._saveWorkouts();
  }

  _workoutPin(workout) {
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
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  _panToPin(e) {
    const workoutElement = e.target.closest(".workout");

    // Do nothing if a workout was not clicked
    if (!workoutElement) return;

    // Find the corresponding workout
    const workout = this.#workouts.find(
      work => work.id === workoutElement.dataset.id
    );

    // Setting the viewport to the selected workout pin
    this.#map.setView(workout.coords, this.#mapZoom, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  // Display the workouts
  _displayWorkout(workout) {
    // Common HTML part
    let HTML = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">24</span>
      <span class="workout__unit">min</span>
    </div>
    `;

    // HTML for running workout
    if (workout.type === "running")
      HTML += `
      <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">km/min</span>
      </div>
      <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
        </div>
        </li>
    `;

    // HTML for cycling workout
    if (workout.type === "cycling")
      HTML += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/hr</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
    `;

    // Add the HTML after the form element
    form.insertAdjacentHTML("afterend", HTML);
  }

  // Fetch workouts form local storage
  _fetchWorkouts() {
    // Fetch the workouts from local storage
    const workoutsData = JSON.parse(localStorage.getItem("workouts"));

    // If no workouts, do nothing
    if (!workoutsData) return;

    // Set the previous workouts to the workouts array
    this.#workouts = workoutsData;

    // Display the workouts on the side menu
    this.#workouts.forEach(workout => {
      this._displayWorkout(workout);
    });
  }

  // Save the workouts to local storage
  _saveWorkouts() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }
}

// Initializing the app class
const app = new App();
