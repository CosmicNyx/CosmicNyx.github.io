// Unicode symbols for squared and cubed exponents
const squared = "\u00B2"; // Unicode for ² (squared)
const cubed = "\u00B3"; // Unicode for ³ (cubed)

// Variables for tracking mouse position and other parameters
let prevMouseX, prevMouseY; // Store previous mouse positions for interaction
let angle = 0; // Current rotation angle
let vel = 0; // Velocity for rotation
let axis = [0, 0, 0]; // Axis for rotation
let particles = []; // Array to store particle objects
let attractor; // Current attractor object
let omega = 0; // Angular velocity for rotation

// Coordinate delta for particle movement adjustments
var coordinateDelta = {
  x: 0, // X-axis adjustment
  y: 0, // Y-axis adjustment
  z: 0, // Z-axis adjustment
  increment: 0.000001, // Small value by which coordinates are adjusted
};

// ==================================================
// SETUP AND INITIALIZATION
// ==================================================

// Setup function for initializing canvas and DOM elements
function initialSetUp() {
  // Get elements from DOM
  let hld = document.getElementById("holder"); // Canvas holder
  let title = document.getElementById("attractor-name"); // Attractor name display
  let dx = document.getElementById("dx"); // dx/dt equation display
  let dy = document.getElementById("dy"); // dy/dt equation display
  let dz = document.getElementById("dz"); // dz/dt equation display
  let r = document.querySelector(":root"); // Root element for CSS variables

  // Create canvas and set color mode
  let cnv = createCanvas(hld.offsetWidth, hld.offsetHeight, WEBGL); // 3D canvas
  cnv.parent("holder"); // Attach canvas to the holder div
  colorMode(HSL); // Use HSL color mode for easier color manipulation

  // Set up attractor options in the sidebar
  const attractorNamesArray = Object.keys(attractors); // Get all attractor names
  const mainInfoContainer = document.querySelector(".navbar-nav"); // Navbar container

  // Populate the sidebar with attractor options
  for (let i = 0; i < attractorNamesArray.length; i++) {
    const li = document.createElement("li"); // Create list item
    li.setAttribute("class", "nav-item");
    li.setAttribute("id", attractorNamesArray[i]);

    const a = document.createElement("a"); // Create link
    a.setAttribute("href", "#");
    a.setAttribute("class", "nav-link");
    a.addEventListener("mouseenter", () => {
      // Change color on hover
      colorHover(
        attractors[attractorNamesArray[i]].highHue,
        attractors[attractorNamesArray[i]].lowHue
      );
    });

    const span = document.createElement("span"); // Create span for text
    span.setAttribute("class", "link-text");
    span.textContent = attractors[attractorNamesArray[i]].name;

    li.append(a); // Append link to list item
    a.append(span); // Append span to link
    li.addEventListener("click", () => {
      // Change attractor on click
      changeAttractor(li.id);
    });
    mainInfoContainer.append(li); // Append list item to navbar
  }

  // Set initial attractor
  attractor = attractors[attractorNamesArray[0]]; // Default to first attractor
  title.textContent = attractor["name"]; // Set title card name

  // Display attractor equations
  dx.textContent += attractor.dxdt;
  dy.textContent += attractor.dydt;
  dz.textContent += attractor.dzdt;

  // Calculate complementary hue for background
  let newHighHue = complementaryHue(attractor.highHue);
  let newLowHue = complementaryHue(attractor.lowHue);

  // Set new hues in CSS variables
  r.style.setProperty("--hiHue", `hsl(${newHighHue}, 100%,50%)`);
  r.style.setProperty("--lowHue", `hsl(${newLowHue}, 100%,50%)`);

  // Render attractor parameters
  renderParams(attractor);

  // Create initial particles
  for (let i = 0; i < 13; i++) {
    let p = new Particle(
      attractor.particleColor(), // Particle color
      attractor.scl, // Scaling factor
      attractor.initialCoordinates, // Initial position
      attractor.pathLength, // Maximum path length
      attractor.offSet // Offset for rendering
    );
    particles.push(p); // Add particle to array
  }

  omega = attractor.motion.vel; // Set initial angular velocity
}

// ==================================================
// UTILITY FUNCTIONS
// ==================================================

// Function to capture screenshot of the canvas
function captureScreenshot() {
  let canvas = document.querySelector("canvas"); // Get canvas element
  let link = document.createElement("a"); // Create download link
  link.href = canvas.toDataURL("image/png"); // Convert canvas to image URL
  link.download = "screenshot.png"; // Set download filename
  link.click(); // Trigger download
}

// Event listener for keyboard input
document.addEventListener("keydown", function (event) {
  // Spacebar: Toggle loop on/off
  if (event.keyCode === 32) {
    if (isLooping()) {
      noLoop(); // Pause animation
    } else {
      loop(); // Resume animation
    }
  }

  // X: Toggle omega (speed) to 0 or default velocity
  if (event.keyCode === 88) {
    omega = omega !== 0 ? 0 : attractor.motion.vel;
  }

  // Enter: Change attractor randomly
  if (event.keyCode === 13) {
    changeAttractorRandomly();
  }

  // Backspace: Remove all particles
  if (event.keyCode === 8) {
    particles.length = 0; // Clear particles array
  }

  // Alt: Add a new particle
  if (event.keyCode === 18) {
    addNewParticle();
  }

  // S: Capture screenshot
  if (event.keyCode === 83) {
    captureScreenshot();
  }
});

// Update coordinate delta for small changes over time
function updateCoordinateDelta() {
  coordinateDelta.x += coordinateDelta.increment;
  coordinateDelta.y += coordinateDelta.increment;
  coordinateDelta.z += coordinateDelta.increment;
}

// Initial setup for canvas and attractor
function setup() {
  initialSetUp();
}

// Function to change the attractor randomly from the available list
function changeAttractorRandomly() {
  const attractorNamesArray = Object.keys(attractors);
  let randomIndex = Math.floor(Math.random() * attractorNamesArray.length);
  let randomAttractorName = attractorNamesArray[randomIndex];
  changeAttractor(randomAttractorName);
}

// Function to add a new particle to the system
function addNewParticle() {
  let newOffSet = {};
  for (const [key, value] of Object.entries(attractor.offSet)) {
    newOffSet[key] = value;
  }

  const newParticle = new Particle(
    attractor.particleColor(),
    attractor.scl,
    attractor.initialCoordinates,
    attractor.pathLength,
    newOffSet
  );
  particles.push(newParticle);
}

// Function to remove the first particle from the system
function removeParticle() {
  particles.shift();
}

// Reset drawing and re-render parameters
function resetDrawing() {
  renderParams(attractor);
}

// Function to calculate complementary hue for background color
function complementaryHue(h) {
  let newHue = h + 180;
  if (newHue > 360) {
    newHue -= 360;
  }
  return newHue;
}

// Resize canvas when window is resized
function windowResized() {
  let hld = document.getElementById("holder");
  resizeCanvas(hld.offsetWidth, hld.offsetHeight);
}

// Function to render the attractor's parameters in the DOM
function renderParams(attractor) {
  let params = document.querySelector(".para-list");

  // Clear existing parameters
  while (params.hasChildNodes()) {
    params.removeChild(params.firstChild);
  }

  const parameters = attractor.parameters;
  const newParams = [];

  // Loop through each parameter, create DOM elements for it
  for (const [key, value] of Object.entries(parameters)) {
    const singleParam = value;
    const pairContainer = document.createElement("div");
    const div = document.createElement("div");
    let slider = "";
    let extra = document.createElement("div");

    attractor[key] = parseFloat(value);

    if (parseFloat(value)) {
      div.textContent = `${key} = ${value}`;
      pairContainer.append(div);
      slider = document.createElement("input");
      slider.type = "range";
      slider.min = singleParam < 0 ? 2 * singleParam : 0;
      slider.max = singleParam < 0 ? 0 : 2 * singleParam;
      slider.step = Math.abs(singleParam * 0.05);
      slider.value = singleParam;
      slider.addEventListener("input", (e) => {
        div.textContent = `${key} = ${e.target.value}`;
        attractor[key] = parseFloat(e.target.value);
      });
      pairContainer.append(slider);
      newParams.push(pairContainer);
      params.append(pairContainer);
    } else {
      extra.textContent = `${key} = ${value}`;
      extra.classList.add("param-value");
      newParams.push(extra);
      params.append(extra);
    }

    div.classList.add("param-value");
    pairContainer.classList.add("param-pair");
  }
}

// Function to change the current attractor
function changeAttractor(name) {
  att = name;
  const incomingAttractor = attractors[att];

  // If trying to click on the current attractor, do nothing
  if (attractor.name == incomingAttractor.name) {
    return;
  }

  // Get DOM elements
  let r = document.querySelector(":root");
  let title = document.getElementById("attractor-name");
  let dx = document.getElementById("dx");
  let dy = document.getElementById("dy");
  let dz = document.getElementById("dz");
  let params = document.querySelector(".para-list");

  // Calculate new complementary hues for background color
  let newHighHue = complementaryHue(incomingAttractor.highHue);
  let newLowHue = complementaryHue(incomingAttractor.lowHue);

  // Set new hues in CSS variables
  r.style.setProperty("--hiHue", `hsl(${newHighHue}, 100%,50%)`);
  r.style.setProperty("--lowHue", `hsl(${newLowHue}, 100%,50%)`);

  // Clear old parameters
  while (params.hasChildNodes()) {
    params.removeChild(params.firstChild);
  }

  // Add new parameters for the new attractor
  renderParams(incomingAttractor);

  // Set new name and equations
  title.textContent = incomingAttractor.name;
  dx.textContent = incomingAttractor.dxdt;
  dy.textContent = incomingAttractor.dydt;
  dz.textContent = incomingAttractor.dzdt;

  // ==================================================
  // PARTICLE MANAGEMENT
  // ==================================================

  // Update particles with new attractor's properties
  for (let p of particles) {
    let newParticleCoordinate = incomingAttractor.initialCoordinates();
    p.initialCoordinates = incomingAttractor.initialCoordinates;
    p.path = [];
    p.offSet = incomingAttractor.offSet;
    p.scl = incomingAttractor.scl;
    p.pathLength = incomingAttractor.pathLength;
    p.color = incomingAttractor.particleColor();
    p.x = newParticleCoordinate.x;
    p.y = newParticleCoordinate.y;
    p.z = newParticleCoordinate.z;
  }

  attractor = incomingAttractor;
}

// ==================================================
// DRAW AND RENDER
// ==================================================

// Main draw function to render particles and handle animation
function draw() {
  background(214, 19, 7); // Set background color
  orbitControl(); // Allow user to control camera view
  frameRate(30); // Set frame rate

  if (angle > TWO_PI || angle < -TWO_PI) {
    // Keep angle within a full rotation
    angle = 0;
  }

  // Apply rotation to attractor
  rotateX(attractor.tilt.x);
  rotateY(attractor.tilt.y);
  rotateZ(attractor.tilt.z);
  rotate(attractor.tilt.otherTilt, attractor.tilt.otherAxis);
  rotate((angle += omega), attractor.motion.axis);

  // Update and display particles
  for (let p of particles) {
    let dx = attractor.dx(p.x, p.y, p.z);
    let dy = attractor.dy(p.x, p.y, p.z);
    let dz = attractor.dz(p.x, p.y, p.z);

    let newX = p.x + dx;
    let newY = p.y + dy;
    let newZ = p.z + dz;

    p.show(newX, newY, newZ); // Display updated particle position
  }
}
