const squared = "\u00B2";
const cubed = "\u00B3";
let prevMouseX, prevMouseY;

let angle = 0;
let vel = 0;
let axis = [0, 0, 0];

let particles = [];
let attractor;
let omega = 0;

var coordinateDelta = {
    x: 0,
    y: 0,
    z: 0,
    increment: 0.000001  // The small value by which coordinates are adjusted
};

function captureScreenshot() {
    let canvas = document.querySelector('canvas');
    let link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'screenshot.png';
    link.click();
}



document.addEventListener('keydown', function (event) {
    // Check if the pressed key is the spacebar (keyCode 32)
    if (event.keyCode === 32) {
        if (isLooping()) {
            noLoop();
        } else {
            loop();
        }
    }
    if (event.keyCode === 90) {
        showDetails()
        
    }
    if (event.keyCode === 88) {
        if (omega != 0) {
            omega = 0;
        } else {
            omega = attractor.motion.vel;
    
        }
    }
    if (event.keyCode === 13) {
        changeAttractorRandomly() 
    }
    if (event.keyCode === 8) {
        
        particles.length = 0;
    }
    if (event.keyCode === 18) {
        addNewParticle();
    }
    if (event.keyCode === 83) {
        captureScreenshot();
    }

});

function updateCoordinateDelta() {
    coordinateDelta.x += coordinateDelta.increment;
    coordinateDelta.y += coordinateDelta.increment;
    coordinateDelta.z += coordinateDelta.increment;
}




function setup() {
    
    initialSetUp();
    
}

function changeAttractorRandomly() {
    const attractorNamesArray = Object.keys(attractors);
    let randomIndex = Math.floor(Math.random() * attractorNamesArray.length);
    let randomAttractorName = attractorNamesArray[randomIndex];
    changeAttractor(randomAttractorName);
}

function initialSetUp() {
    let hld = document.getElementById("holder");
    let pause = document.querySelector("#pause-play");
    let title = document.getElementById("attractor-name");
    let toggleSpin = document.getElementById('spin');
    let toggleDetails = document.getElementById('display-details')
    let dx = document.getElementById("dx");
    let dy = document.getElementById("dy");
    let dz = document.getElementById("dz");
    let r = document.querySelector(":root");
    let addParticleButton = document.querySelector("#add-button");
    let removeParticleButton = document.querySelector('#remove-button');

    let cnv = createCanvas(hld.offsetWidth, hld.offsetHeight, WEBGL);

  

    toggleDetails.addEventListener('click',()=>{
        showDetails()
    })
    pause.addEventListener("click", () => {
        halt();
    });
    addParticleButton.addEventListener("click", () => {
        addNewParticle();
    });
    removeParticleButton.addEventListener('click', ()=>{
        removeParticle()
    })
    toggleSpin.addEventListener("click", () => {
        snapShot();
    });
    cnv.parent("holder");
    colorMode(HSL);

    const attractorNamesArray = Object.keys(attractors);
    const mainInfoContainer = document.querySelector(".navbar-nav");

    for (let i = 0; i < attractorNamesArray.length; i++) {
        // this is for the sidebar
        const li = document.createElement("li");
        li.setAttribute("class", "nav-item");
        li.setAttribute("id", attractorNamesArray[i]);

        const a = document.createElement("a");
        a.setAttribute("href", "#");
        a.setAttribute("class", "nav-link");
        a.addEventListener("mouseenter", () => {
            colorHover(
                attractors[attractorNamesArray[i]].highHue,
                attractors[attractorNamesArray[i]].lowHue
            );
        });
        const span = document.createElement("span");
        span.setAttribute("class", "link-text");
        span.textContent = attractors[attractorNamesArray[i]].name;

        li.append(a);
        a.append(span);
        li.addEventListener("click", () => {
            changeAttractor(li.id);
        });
        mainInfoContainer.append(li);
    }

    //initial attractor
    // attractor = lorenz
    attractor = attractors[attractorNamesArray[0]];
    title.textContent = attractor["name"]; //setting title card name
    //setting equations on card
    dx.textContent += attractor.dxdt;
    dy.textContent += attractor.dydt;
    dz.textContent += attractor.dzdt;
    //calculating opposite hue
    let newHighHue = complementaryHue(attractor.highHue);
    let newLowHue = complementaryHue(attractor.lowHue);
    //setting new hues
    r.style.setProperty("--hiHue", `hsl(${newHighHue}, 100%,50%)`);
    r.style.setProperty("--lowHue", `hsl(${newLowHue}, 100%,50%)`);

    renderParams(attractor);

    //creating particles
    for (let i = 0; i < 13; i++) {
        let p = new Particle(
            attractor.particleColor(),
            attractor.scl,
            attractor.initialCoordinates,
            attractor.pathLength,
            attractor.offSet
        );
        particles.push(p);
    }

    omega = attractor.motion.vel;
}

function showDetails(){
    let card = document.querySelector('.card')
    let showBtn = document.querySelector('#show-hide')
    card.classList.toggle('hidden')

    if(showBtn.textContent == 'Hide'){
        showBtn.textContent = 'Show'
    }else{
        showBtn.textContent = 'Hide'
    }

}
function addNewParticle() {
    //let newColor = attractor.particleColor;
    let newOffSet = {};
    for (const [key, value] of Object.entries(attractor.offSet)) {
        newOffSet[key] = value 
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
function removeParticle(){
    particles.shift()
}
function toggleSpin() {
    let spinBtn = document.querySelector('#spin-text')
    let spinIcon = document.querySelector('#spinner')
    spinIcon.classList.toggle('spinner')
    if (omega != 0) {
        omega = 0;
        spinBtn.textContent = 'Spin'
    } else {
        omega = attractor.motion.vel;
        spinBtn.textContent = 'No Spin'

    }
}
function resetDrawing() {
    renderParams(attractor);
}
function colorHover(high, low) {
    let r = document.querySelector(":root");
    r.style.setProperty("--cardHiHue", `hsl(${high}, 100%,50%)`);
    r.style.setProperty("--cardLowHue", `hsl(${low}, 100%,50%)`);
}
function snapShot() {
    toggleSpin();
}

function halt() {
    let pauseBtn = document.querySelector('#pause-text')
    let pauseIcon = document.querySelector('#pause-icon')
    let playIcon = document.querySelector('#play-icon')
    pauseIcon.classList.toggle('hidden')
    playIcon.classList.toggle('hidden')
    //pause the whole drawing
    if (isLooping()) {
        
        pauseBtn.textContent = 'Play'
        noLoop();
    } else {
        loop();
        pauseBtn.textContent = 'Pause'

    }
}
function complementaryHue(h) {
    let newHue = h + 180;
    if (newHue > 360) {
        newHue -= 360;
    }
    return newHue;
}
function windowResized() {
    let hld = document.getElementById("holder");
    resizeCanvas(hld.offsetWidth, hld.offsetHeight);
}
function renderParams(attractor) {
    let params = document.querySelector(".para-list");
    while (params.hasChildNodes()) {
        params.removeChild(params.firstChild);
    }
    const parameters = attractor.parameters;
    const newParams = [];
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
function changeAttractor(name) {
    att = name;
    const incomingAttractor = attractors[att];
    if (attractor.name == incomingAttractor.name) {
        //if trying to click on current attractor just return and do nothing
        return;
    }
    //getting elements from dom
    let r = document.querySelector(":root");
    let title = document.getElementById("attractor-name");
    let dx = document.getElementById("dx");
    let dy = document.getElementById("dy");
    let dz = document.getElementById("dz");
    let params = document.querySelector(".para-list");
    //calculating new hues
    let newHighHue = complementaryHue(incomingAttractor.highHue);
    let newLowHue = complementaryHue(incomingAttractor.lowHue);
    //setting hues
    r.style.setProperty("--hiHue", `hsl(${newHighHue}, 100%,50%)`);
    r.style.setProperty("--lowHue", `hsl(${newLowHue}, 100%,50%)`);
    //removing current params
    while (params.hasChildNodes()) {
        params.removeChild(params.firstChild);
    }
    //adding new params
    renderParams(incomingAttractor);

    //setting new names and equations

    title.textContent = incomingAttractor.name;
    dx.textContent = incomingAttractor.dxdt;
    dy.textContent = incomingAttractor.dydt;
    dz.textContent = incomingAttractor.dzdt;
    
    for (let p of particles) {
        //changing the properties of particles
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
function draw() {
    // background("black");
    background(214,19,7)
    orbitControl();
    frameRate(30);

    //let mouseVelocity = createVector(mouseX - prevMouseX, mouseY - prevMouseY);

    // for (let p of particles) {
    //     let dx = attractor.dx(p.x, p.y, p.z);
    //     let dy = attractor.dy(p.x, p.y, p.z);
    //     let dz = attractor.dz(p.x, p.y, p.z);

    //     let newX = p.x + dx;
    //     let newY = p.y + dy;
    //     let newZ = p.z + dz;
    //     p.show(newX, newY, newZ);
    //     p.reactToMouse(); // React to mouse movement
    // }

    orbitControl();
    if (angle > TWO_PI || angle < -TWO_PI) {
        //keeping angle within a cycle
        angle = 0;
    }
    rotateX(attractor.tilt.x);
    rotateY(attractor.tilt.y);
    rotateZ(attractor.tilt.z);
    rotate(attractor.tilt.otherTilt, attractor.tilt.otherAxis);
    rotate((angle += omega), attractor.motion.axis);

    for (let p of particles) {
        let dx = attractor.dx(p.x, p.y, p.z);
        let dy = attractor.dy(p.x, p.y, p.z);
        let dz = attractor.dz(p.x, p.y, p.z);

        let newX = p.x + dx;
        let newY = p.y + dy;
        let newZ = p.z + dz;
        p.show(newX, newY, newZ);
    }
    
}
