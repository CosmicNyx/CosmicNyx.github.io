const lorenz = {
    name: "Lorenz",
    dxdt: "dx/dt = σ(y-x)",
    dydt: "dy/dt = x(ρ-z)-y",
    dzdt: "dz/dt = xy-βz",
    σ: 10,
    ρ: 28,
    β: 2.66,
    dt: 0.01,
    pathLength: 75,
    scl: 8,
    highHue: 270,
    lowHue: 150,
    parameters: {
        σ: "10",
        ρ: "28",
        β: "2.66",
    },
    offSet: {
        x: 0,
        y: 0,
        z: -27 *8,
    },
    motion: {
        vel: -0.01,
        axis: [0, 1, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y) {
        return this.σ * (y - x) * this.dt;
    },
    dy: function (x, y, z) {
        return (-1 * x * z + this.ρ * x - y) * this.dt;
    },
    dz: function (x, y, z) {
        return (x * y - this.β * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 1) + coordinateDelta.x, 6);
        let y = round(random(-1, 1) + coordinateDelta.y, 6);
        let z = round(random(-1, 1) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
        },
};
const fourwing = {
    name: "Fourwing",
    dxdt: "dx/dt = αx + yz",
    dydt: "dy/dt = βx + δy - xz",
    dzdt: "dz/dt = -z - xy",
    α: 0.2,
    β: 0.01,
    δ: -0.4,
    dt: 0.1,
    pathLength: 110,
    scl: 100,
    highHue: 57,
    lowHue: 0,
    parameters: {
        α: "0.2",
        β: "0.01",
        δ: "-0.4",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: 0.01,
        axis: [1, 0, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: Math.PI / 2,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (this.α * x + y * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (this.β * x + this.δ * y - x * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (-z - x * y) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 1)+ coordinateDelta.x,2);
        let y = round(random(-1, 1)+ coordinateDelta.y,2);
        let z = round(random(-1, 1)+ coordinateDelta.z,2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const halvorsen = {
    name: "Halvorsen",
    dxdt: "dx/dt = -αx - 4y - 4z -y" + "\u00B2",
    dydt: "dy/dt = -αy - 4z - 4x -z" + "\u00B2",
    dzdt: "dz/dt = -αz - 4x - 4y -x" + "\u00B2",
    α: 1.89,
    dt: 0.01,
    pathLength: 100,
    scl: 25,
    highHue: 205,
    lowHue: 160,
    parameters: {
        α: "1.89",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [1, 1, 1],
    },
    tilt: {
        x: 0,
        y: (Math.PI * 3) / 4,
        z: 0,
        otherTilt: Math.PI / 4,
        otherAxis: [1, 0, -1],
    },
    dx: function (x, y, z) {
        return (-1 * this.α * x - 4 * y - 4 * z - y ** 2) * this.dt;
    },
    dy: function (x, y, z) {
        return (-1 * this.α * y - 4 * z - 4 * x - z ** 2) * this.dt;
    },
    dz: function (x, y, z) {
        return (-1 * this.α * z - 4 * x - 4 * y - x ** 2) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 1)+ coordinateDelta.x,2);
        let y = round(random(-1, 1)+ coordinateDelta.y,2);
        let z = round(random(-1, 1)+ coordinateDelta.z,2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const rabinovichFabrikant = {
    name: "Rabinovich-Fabrikant",
    dxdt: "dx/dt = y(z - 1 + x" + "\u00B2" + ") + γx",
    dydt: "dy/dt = x(3z + 1 - x" + "\u00B2" + ") + γy",
    dzdt: "dz/dt = -2z( α + xy)",
    α: 0.14,
    γ: 0.1,
    dt: 0.015,
    pathLength: 120,
    scl: 100,
    highHue: 205,
    lowHue: 170,
    parameters: {
        α: "0.14",
        γ: "0.1",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (y * (z - 1 + x ** 2) + this.γ * x) * this.dt;
    },
    dy: function (x, y, z) {
        return (x * (3 * z + 1 - x ** 2) + this.γ * y) * this.dt;
    },
    dz: function (x, y, z) {
        return -2 * z * (this.α + x * y) * this.dt;
    },
    particleColor: function () {
        return color(random(170, 205), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-2, .2)+ coordinateDelta.x,2);
        let y = round(random(-.2,.2)+ coordinateDelta.y,2);
        let z = round(random(-.2, .2)+ coordinateDelta.z,2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const sprott = {
    name: "Sprott",
    dxdt: "dx/dt = y + αxy + xz",
    dydt: "dy/dt = 1 - βx" + squared + "+yz",
    dzdt: "dz/dt = x-x" + squared + "-y" + squared,
    α: 2.07,
    β: 1.79,
    dt: 0.05,
    pathLength: 135,
    scl: 100,
    highHue: 80,
    lowHue: 0,
    parameters: {
        α: "2.07",
        β: "1.79",
    },
    offSet: {
        x: -0.76 * 100,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [1, 0, 0],
    },
    dx: function (x, y, z) {
        return (y + this.α * x * y + x * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (1 - this.β * (x * x) + y * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (x - x * x - y * y) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 1)+ coordinateDelta.x,2);
        let y = round(random(-1, 1)+ coordinateDelta.x,2);
        let z = round(random(-1, 1)+ coordinateDelta.x,2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const dadras = {
    name: "Dadras",
    dxdt: "dx/dt = y - ρx + σyz",
    dydt: "dy/dt = τy - xz + z",
    dzdt: "dz/dt = ζxy - εz",
    ρ: 3,
    σ: 2.7,
    τ: 1.7,
    ζ: 2,
    ε: 9,
    dt: 0.01,
    pathLength: 120,
    scl: 20,
    highHue: 75,
    lowHue: 0,
    parameters: {
        ρ: "3",
        σ: "2.7",
        τ: "1.7",
        ζ: "2",
        ε: "9",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [1, 1, 1],
    },
    tilt: {
        x: 0,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (y - this.ρ * x + this.σ * y * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (this.τ * y - x * z + z) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.ζ * x * y - this.ε * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 1)+ coordinateDelta.x,2);
        let y = round(random(-1, 1)+ coordinateDelta.x,2);
        let z = round(random(-1, 1)+ coordinateDelta.x,2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const aizawa = {
    name: "Aizawa",
    dxdt: "dx/dt = (z-β)x - δy",
    dydt: "dy/dt = δx + (z-β)y",
    dzdt:
        "dz/dt = γ + αz - z" +
        cubed +
        "/3 -(x" +
        squared +
        "-y" +
        squared +
        ")(1+εz)+ζzx" +
        cubed,
    //note: consider making the starting values in the z axis only positives
    α: 0.95,
    β: 0.7,
    γ: 0.6,
    δ: 3.5,
    ε: 0.25,
    ζ: 0.1,
    dt: 0.015,
    pathLength: 110,
    scl: 100,
    highHue: 90,
    lowHue: 0,
    parameters: {
        α: "0.95",
        β: "0.7",
        γ: "0.6",
        δ: "3.5",
        ε: "0.25",
        ζ: "0.1",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return ((z - this.β) * x - this.δ * y) * this.dt;
    },
    dy: function (x, y, z) {
        return (this.δ * x + y * (z - this.β)) * this.dt;
    },
    dz: function (x, y, z) {
        return (
            (this.γ +
                this.α * z -
                (z * z * z) / 3 -
                (x * x + y * y) * (1 + this.ε * z) +
                this.ζ * z * x * x * x) *
            this.dt
        );
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 0)+ coordinateDelta.x,2);
        let y = round(random(0, 0)+ coordinateDelta.y,2);
        let z =0;
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const chen = {
    name: "Chen",
    dxdt: "dx/dt = αx-yz",
    dydt: "dy/dt = βy+xz",
    dzdt: "dz/dt = δz+xy/3",
    α: 1.25,
    β: -6,
    δ: -0.38,
    dt: 0.008,
    pathLength: 120,
    scl: 20,
    highHue: 330,
    lowHue: 180,
    parameters: {
        α: "1.625",
        β: "-4.2",
        δ: "-0.58",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: 0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (this.α * x - y * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (this.β * y + x * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.δ * z + (x * y) / 3) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const thomas = {
    name: "Thomas",
    dxdt: "dx/dt = sin(y) - βx",
    dydt: "dy/dt = sin(x) - βy",
    dzdt: "dz/dt = sin(z) - βz",
    β: 0.208,
    parameters: {
        β: "0.208",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [1, 1, 1],
    },
    tilt: {
        x: 0,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dt: 0.15,
    pathLength: 100,
    scl: 90,
    highHue: 50,
    lowHue: 0,
    dx: function (x, y, z) {
        return (sin(y) - this.β * x) * this.dt;
    },
    dy: function (x, y, z) {
        return (sin(z) - this.β * y) * this.dt;
    },
    dz: function (x, y, z) {
        return (sin(x) - this.β * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const rossler = {
    name: "Rossler",
    dxdt: "dx/dt = -(y+z)",
    dydt: "dy/dt = x+αy",
    dzdt: "dz/dt = β+z(x-ς)",
    α: 0.2,
    β: 0.2,
    ς: 5.7,
    parameters: {
        α: "0.2",
        β: "0.2",
        ς: "5.7",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: 0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dt: 0.04,
    pathLength: 100,
    scl: 15,
    highHue: 200,
    lowHue: 75,
    dx: function (x, y, z) {
        return (-y - z) * this.dt;
    },
    dy: function (x, y, z) {
        return (x + this.α * y) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.β + z * (x - this.ς)) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const threeScroll2 = {
    
    name: "3-Scroll Unified System 2",
    dxdt: "dx/dt = α(y - x) + δxz",
    dydt: "dy/dt = ςx - xz + ζy",
    dzdt: "dz/dt = βz + xy - εx" + squared,
    α: 32.48,
    ς: 45.84,
    β: 1.18,
    δ: 0.13,
    ε: 0.57,
    ζ: 14.7,
    dt: 0.0002,
    pathLength: 120,
    scl: 1,
    highHue: 300,
    lowHue: 240,
    parameters: {
        α: "32.48",
        ς: "45.84",
        β: "1.18",
        δ: "0.13",
        ε: "0.57",
        ζ: "14.7",
    },
    offSet: {
        x: 0,
        y: 0,
        z: -40,
    },
    motion: {
        vel: 0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (this.α * (y - x) + this.δ * x * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (this.ς * x - x * z + this.ζ * y) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.β * z + x * y - this.ε * x * x) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-50, 50), 2);
        let y = round(random(-50, 50), 2);
        let z = round(random(-50, 200), 2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const threeScroll1 = {
    name: "3-Scroll Unified System 1",
    dxdt: "dx/dt = α(y -x) + δxz",
    dydt: "dy/dt = ςx - xz + ζy",
    dzdt: "dz/dt = βz + xy - εx" + squared,
    α: 40,
    β: 0.833,
    δ: 0.5,
    ε: 0.65,
    ζ: 20,
    dt: 0.0015,
    pathLength: 120,
    scl: 3,
    highHue: 360,
    lowHue: 250,
    parameters: {
        α: "40",
        β: "0.833",
        δ: "0.5",
        ε: "0.65",
        ζ: "20",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (this.α * (y - x) + this.δ * x * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (this.ζ * y - x * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.β * z + x * y - this.ε * x * x) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-7, 7), 2);
        let y = round(random(-7, 7), 2);
        let z = round(random(30, 50), 2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const lorenz83 = {
    name: "Lorenz 83",
    dxdt: "dx/dt = -αx - y" + squared + " - z" + squared + " + αε",
    dydt: "dy/dt = -y + xy - βxz + ξ",
    dzdt: "dz/dt = -z + βxy + xz",
    α: 0.95,
    β: 7.91,
    ε: 4.83,
    ξ: 4.66,
    dt: 0.01,
    pathLength: 80,
    scl: 50,
    highHue: 60,
    lowHue: 30,
    parameters: {
        α: "0.95",
        β: "7.91",
        ε: "4.83",
        ξ: "4.66",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [1, 0, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: -Math.PI / 2,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (-1 * this.α * x - y ** 2 - z ** 2 + this.α * this.ε) * this.dt;
    },
    dy: function (x, y, z) {
        return (-1 * y + x * y - this.β * x * z + this.ξ) * this.dt;
    },
    dz: function (x, y, z) {
        return (-1 * z + this.β * x * y + x * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 49);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const newtonLeipnik = {
    name: "Newton Leipnik",
    dxdt: "dx/dt = -αx + y+ 10yz",
    dydt: "dy/dt = -x - αy + 5xz",
    dzdt: "dz/dt = βz - 5xy",
    α: 0.4,
    β: 0.175,
    dt: 0.04,
    pathLength: 100,
    scl: 400,
    highHue: 60,
    lowHue: 30,
    parameters: {
        α: "0.4",
        β: "0.175",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: 0,
        y: -Math.PI / 2,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return (-this.α * x + y + 10 * y * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (-x - this.α * y + 5 * x * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.β * z - 5 * x * y) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 49);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const noseHoover = {
    name: "Nose-Hoover",
    dxdt: "dx/dt = y",
    dydt: "dy/dt = -x + yz",
    dzdt: "dz/dt = α - y" + squared,
    α: 1.5,
    scl: 50,
    dt: 0.02,
    pathLength: 150,
    highHue: 240,
    lowHue: 120,
    parameters: {
        α: "1.5",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, -1],
    },
    tilt: {
        x: -Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return y * this.dt;
    },
    dy: function (x, y, z) {
        return (-x + y * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.α - y * y) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const bouali = {
    name: "Bouali",
    dxdt: "dx/dt = x(4-y) + αz",
    dydt: "dy/dt = -y(1-x" + squared + ")",
    dzdt: "dz/dt = -x(1.5-ςz) - 0.05z",
    α: 0.3,
    ς: 1.0,
    dt: 0.02,
    pathLength: 90,
    scl: 35,
    highHue: 60,
    lowHue: 0,
    parameters: {
        α: "0.3",
        ς: "1.0",
    },
    offSet: {
        x: 0,
        y: -5 * 35,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: -Math.PI / 2,
        y: 0,
        z: Math.PI,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
   
    dx: function (x, y, z) {
        return (x * (4 - y) + this.α * z) * this.dt;
    },
    dy: function (x, y, z) {
        return -y * (1 - x * x) * this.dt;
    },
    dz: function (x, y, z) {
        return (-x * (1.5 - this.ς * z) - 0.05 * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-2, 2), 2);
        let y = round(random(0, 2), 2);
        let z = round(random(-2, 2), 2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const coullet = {
    name: "Coullet",
    dxdt: "dx/dt = y",
    dydt: "dy/dt = z",
    dzdt: "dz/dt = αx + βy + ςz + δx" + cubed,
    α: 0.8,
    β: -1.1,
    ς: -0.45,
    δ: -1,
    dt: 0.03,
    pathLength: 150,
    scl: 100,
    highHue: 57,
    lowHue: 0,
    parameters: {
        α: "0.8",
        β: "-1.1",
        ς: "-0.45",
        δ: "-1",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [1, 0, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: -Math.PI / 2,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return y * this.dt;
    },
    dy: function (x, y, z) {
        return z * this.dt;
    },
    dz: function (x, y, z) {
        return (
            (this.α * x + this.β * y + this.ς * z + this.δ * x * x * x) *
            this.dt
        );
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const finance = {
    name: "Finance",
    dxdt: "dx/dt = z + xy + x(1/β - α)",
    dydt: "dy/dt = -βy - x" + squared,
    dzdt: "dz/dt = -x - ςz",
    α: 0.001,
    β: 0.2,
    ς: 1.1,
    dt: 0.05,
    pathLength: 100,
    scl: 60,
    highHue: 359,
    lowHue: 220,
    parameters: {
        α: "0.001",
        β: "0.2",
        ς: "1.1",
    },
    offSet: {
        x: 0,
        y: 4 * 60,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 1, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return ((1 / this.β - this.α) * x + z + x * y) * this.dt;
    },
    dy: function (x, y, z) {
        return (-this.β * y - x * x) * this.dt;
    },
    dz: function (x, y, z) {
        return (-x - this.ς * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        // let z = 0
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const arneodo = {
    name: "Arneodo",
    dxdt: "dx/dt = y",
    dydt: "dy/dt = z",
    dzdt: "dz/dt = -αx - βy - z +δx" + cubed,
    α: -5.5,
    β: 3.5,
    δ: -1,
    dt: 0.01,
    pathLength: 175,
    scl: 30,
    highHue: 205,
    lowHue: 160,
    parameters: {
        α: "-5.5",
        β: "3.5",
        δ: "-1",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return y * this.dt;
    },
    dy: function (x, y, z) {
        return z * this.dt;
    },
    dz: function (x, y, z) {
        return (-this.α * x - this.β * y - z + this.δ * x * x * x) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const rayleighBenard = {
    name: "Rayleigh-Benard",
    dxdt: "dx/dt = -αx + αy",
    dydt: "dy/dt = τx - y - xz",
    dzdt: "dz/dt = xy - βz",
    α: 9.0,
    β: 12,
    τ: 0.5,
    scl: 20,
    dt: 0.02,
    pathLength: 80,
    highHue: 240,
    lowHue: 180,
    parameters: {
        α: "9.0",
        β: "12",
        τ: "0.5",
    },
    offSet: {
        x: 0,
        y: 0,
        z: -10 * 20,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: -Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return (-this.α * x + this.α * y) * this.dt;
    },
    dy: function (x, y, z) {
        return (this.β * x - y - x * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (x * y - this.τ * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const genesioTesi = {
    name: "Genesio Tesi",
    dxdt: "dx/dt = y",
    dydt: "dy/dt = z",
    dzdt: "dz/dt = -x - βy -αz +x" + squared,
    α: -1.1,
    β: -0.44,
    scl: 200,
    dt: 0.018,
    pathLength: 100,
    highHue: 180,
    lowHue: 120,
    parameters: {
        α: "-1.1",
        β: "-0.44",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [1, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: -Math.PI / 4,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return y * this.dt;
    },
    dy: function (x, y, z) {
        return z * this.dt;
    },
    dz: function (x, y, z) {
        return (-x + this.α * y + this.β * z + x * x) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const burkeShaw = {
    name: "Burke-Shaw",
    dxdt: "dx/dt = -η(x+y)",
    dydt: "dy/dt = -y-ηxz",
    dzdt: "dz/dt = ηxy + μ",
    η: 10, 
    μ: 4.272, 
    dt: 0.01,
    pathLength: 100,
    scl: 50,
    highHue: 220,
    lowHue: 160,
    parameters: {
        η: "10", 
        μ: "4.272", 
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, -1],
    },
    tilt: {
        x: -Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return -this.η * (x + y) * this.dt;
    },
    dy: function (x, y, z) {
        return (-y - this.η * x * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.η * x * y + this.μ) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const chua1 = {
    name: "Chua 1",
    dxdt: "dx/dt = α(y - x)",
    dydt: "dy/dt = -εx -xz + λy",
    dzdt: "dz/dt = xy - μz",
    α: 40,
    ε: 12,
    λ: 28,
    μ: 3,
    dt: 0.005,
    pathLength: 80,
    scl: 8,
    highHue: 360,
    lowHue: 300,
    parameters: {
        α: "40",
        ε: "12",
        λ: "28",
        μ: "3",
    },
    offSet: {
        x: 0,
        y: 0,
        z: -15 * 8,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: -Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return this.α * (y - x) * this.dt;
    },
    dy: function (x, y, z) {
        return (-this.ε * x - x * z + this.λ * y) * this.dt;
    },
    dz: function (x, y, z) {
        return (x * y - this.μ * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const hadley = {
    name: "Hadley",
    dxdt: "dx/dt = -y" + squared + " - z" + squared + " - αx + αζ",
    dydt: "dy/dt = -xy - βxz -y + δ",
    dzdt: "dz/dt = βxy + xz - z",
    α: 0.2,
    β: 4,
    ζ: 8,
    δ: 1,
    parameters: {
        α: "0.2",
        β: "4",
        ζ: "8",
        δ: "1",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [1, 0, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: Math.PI / 2,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dt: 0.02,
    pathLength: 100,
    scl: 100,
    highHue: 320,
    lowHue: 240,
    dx: function (x, y, z) {
        return (-(y * y) - z * z - this.α * x + this.α * this.ζ) * this.dt;
    },
    dy: function (x, y, z) {
        return (x * y - this.β * z * x - y + this.δ) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.β * x * y + x * z - z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const lorenzMod1 = {
    name: "Lorenz Mod 1",
    dxdt: "dx/dt = -αx + y" + squared + " - z" + squared + " + αζ",
    dydt: "dy/dt = x(y - βz) + δ",
    dzdt: "dz/dt = z + x(βy + z)",
    α: 0.1,
    β: 4,
    ζ: 14,
    δ: 0.08,
    dt: 0.005,
    scl: 10,
    pathLength: 80,
    highHue: 220,
    lowHue: 150,
    parameters: {
        α: "0.1",
        β: "4",
        ζ: "14",
        δ: "0.08",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [1, 0, 0],
    },
    tilt: {
        x: 0,
        y: Math.PI / 2,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return (-this.α * x + y * y - z * z + this.α * this.ζ) * this.dt;
    },
    dy: function (x, y, z) {
        return (x * (y - this.β * z) + this.δ) * this.dt;
    },
    dz: function (x, y, z) {
        return (z + x * (this.β * y + z)) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const lorenzMod2 = {
    name: "Lorenz Mod 2",
    dxdt: "dx/dt = -αx + y" + squared + " - z" + squared + " + αζ",
    dydt: "dy/dt = α(y - βz) + δ",
    dzdt: "dz/dt = -z + x(βy + z)",
    α: 0.9,
    β: 5,
    ζ: 9.9,
    δ: 1,
    dt: 0.004,
    scl: 10,
    highHue: 280,
    lowHue: 150,
    pathLength: 80,
    parameters: {
        α: "0.9",
        β: "5",
        ζ: "9.9",
        δ: "1",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: -0.01,
        axis: [0, 1, 0],
    },
    tilt: {
        x: -Math.PI / 4,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return (-this.α * x + y * y - z * z + this.α * this.ζ) * this.dt;
    },
    dy: function (x, y, z) {
        return (x * (y - this.β * z) + this.δ) * this.dt;
    },
    dz: function (x, y, z) {
        return (-z + x * (this.β * y + z)) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const anishchenkoAstakhov = {
    name: "Anishchenko Astakhov",
    dxdt: "dx/dt = μx + y - xz",
    dydt: "dy/dt = -x",
    dzdt: "dz/dt = -ηz + ηI(x)x" + squared,
    μ: 1.2,
    η: 0.5,
    scl: 40,
    dt: 0.03,
    pathLength: 200,
    lowHue: 170,
    highHue: 205,
    parameters: {
        μ: "1.2",
        η: "0.5",
        "I(x)": "{1 ,x > 0; 0, x <= 0 }",
    },
    offSet: {
        x: 0,
        y: -2 * 40,
        z: -1 * 40,
    },
    motion: {
        vel: -0.01,
        axis: [0, 1, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [1, 0, 0],
    },
    
    dx: function (x, y, z) {
        return (this.μ * x + y - x * z) * this.dt;
    },
    dy: function (x, y, z) {
        return -x * this.dt;
    },
    dz: function (x, y, z) {
        let newX;
        if (x > 0) {
            newX = 1;
        } else {
            newX = 0;
        }
        return (-this.η * z + this.η * newX * x * x) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const rucklidge = {
    name: "Rucklidge",
    dxdt: "dx/dt = -κx + αy - yz",
    dydt: "dy/dt = x",
    dzdt: "dz/dt = -z + y" + squared,
    κ: 2,
    α: 6.7,
    scl: 20,
    dt: 0.03,
    pathLength: 100,
    highHue: 257,
    lowHue: 200,
    parameters: {
        κ: "2",
        α: "6.7",
    },
    offSet: {
        x: 0,
        y: 0,
        z: -7 * 20,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (-this.κ * x + this.α * y - y * z) * this.dt;
    },
    dy: function (x, y, z) {
        return x * this.dt;
    },
    dz: function (x, y, z) {
        return (-z + y * y) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const qiChen = {
    name: "Qi-Chen",
    dxdt: "dx/dt = α(y - x) + yz",
    dydt: "dy/dt = ςx + y - xz",
    dzdt: "dz/dt = xy - βz",
    α: 38,
    β: 2.66,
    ς: 80,
    scl: 3,
    dt: 0.001,
    pathLength: 100,
    highHue: 270,
    lowHue: 200,
    parameters: {
        α: "38",
        β: "2.66",
        ς: "80",
    },
    offSet: {
        x: 0,
        y: 0,
        z: -100 * 3,
    },
    motion: {
        vel: 0.01,
        axis: [0, 0, 1],
    },
    tilt: {
        x: -Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (this.α * (y - x) + y * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (this.ς * x + y - x * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (x * y - this.β * z) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const sakarya = {
    name: "Sakarya",
    dxdt: "dx/dt = -x + y +yz",
    dydt: "dy/dt = -x - y + αxz",
    dzdt: "dz/dt = z -βxy",
    α: 0.4,
    β: 0.3,
    parameters: {
        α: "0.4",
        β: "0.3",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: 0.01,
        axis: [-1, 0, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: Math.PI / 2,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    scl: 10,
    dt: 0.005,
    pathLength: 100,
    highHue: 360,
    lowHue: 270,
    dx: function (x, y, z) {
        return (-x + y + y * z) * this.dt;
    },
    dy: function (x, y, z) {
        return (-x - y + this.α * x * z) * this.dt;
    },
    dz: function (x, y, z) {
        return (z - this.β * x * y) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 1) + coordinateDelta.x, 6);
        let y = round(random(-1,1) + coordinateDelta.y, 6);
        let z = round(random(-1, 1) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const luChen = {
    name: "Lu-Chen",
    dxdt: "dx/dt = -βx + zy",
    dydt: "dy/dt = -αy + zx",
    dzdt: "dz/dt = δz - yx + ς",
    α: 10,
    β: 4,
    ς: 18.1,
    δ: 2.85,
    scl: 7,
    dt: 0.0035,
    pathLength: 100,
    highHue: 205,
    lowHue: 160,
    parameters: {
        α: "10",
        β: "4",
        ς: "18.1",
        δ: "2.85",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: 0.01,
        axis: [0, 0, -1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    dx: function (x, y, z) {
        return (-this.β * x + z * y) * this.dt;
    },
    dy: function (x, y, z) {
        return (-this.α * y + z * x) * this.dt;
    },
    dz: function (x, y, z) {
        return (this.δ * z - y * x + this.ς) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const chua2 = {
    name: "Chua 2",
    dxdt: "dx/dt = α(y - x - δ(|x + 1|-|x - 1|))",
    dydt: "dy/dt = β(x - y + z)",
    dzdt: "dz/dt = -ςy",
    α: 15.6,
    β: 1,
    ς: 25.58,
    δ: -1,
    dt: 0.01,
    scl: 55,
    pathLength: 100,
    highHue: 57,
    lowHue: 0,
    parameters: {
        α: "15.6",
        β: "1",
        ς: "25.58",
        δ: "-1",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: 0.01,
        axis: [0, 0, -1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return (
            this.α *
            (y - x - this.δ * (Math.abs(x + 1) - Math.abs(x - 1))) *
            this.dt
        );
    },
    dy: function (x, y, z) {
        return this.β * (x - y + z) * this.dt;
    },
    dz: function (x, y, z) {
        return -this.ς * y * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-.5, .5) + coordinateDelta.x, 6);
        let y = round(random(-.5, .5) + coordinateDelta.y, 6);
        let z = round(random(-.5, .5) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const shimizuMorioka = {
    name: "Shimizo-Morioka",
    dxdt: "dx/dt =  y",
    dydt: "dy/dt = (1 - z)x - αy",
    dzdt: "dz/dt = -βz + x" + squared,
    α: 0.75,
    β: 0.45,
    parameters: {
        α: "0.75",
        β: "0.45",
    },
    offSet: {
        x: 0,
        y: 0,
        z: -1 * 150,
    },
    motion: {
        vel: -0.01,
        axis: [0, 0, -1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 0, 1],
    },
    dt: 0.1,
    scl: 150,
    pathLength: 150,
    highHue: 57,
    lowHue: 0,
    dx: function (x, y, z) {
        return y * this.dt;
    },
    dy: function (x, y, z) {
        return ((1 - z) * x - this.α * y) * this.dt;
    },
    dz: function (x, y, z) {
        return (x * x - z * this.β) * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 1) + coordinateDelta.x, 6);
        let y = round(random(-1, 1) + coordinateDelta.y, 6);
        let z = round(random(-1, 1) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const liuChen = {
    name: "Chua 2",
    dxdt: "dx/dt = α(y - x - δ(|x + 1|-|x - 1|))",
    dydt: "dy/dt = β(x - y + z)",
    dzdt: "dz/dt = -ςy",
    α: 15.6,
    β: 1,
    ς: 25.58,
    δ: -1,
    dt: 0.01,
    scl: 55,
    pathLength: 100,
    highHue: 57,
    lowHue: 0,
    parameters: {
        α: "15.6",
        β: "1",
        ς: "25.58",
        δ: "-1",
    },
    offSet: {
        x: 0,
        y: 0,
        z: 0,
    },
    motion: {
        vel: 0.01,
        axis: [0, 0, -1],
    },
    tilt: {
        x: Math.PI / 2,
        y: 0,
        z: 0,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return (
            this.α *
            (y - x - this.δ * (Math.abs(x + 1) - Math.abs(x - 1))) *
            this.dt
        );
    },
    dy: function (x, y, z) {
        return this.β * (x - y + z) * this.dt;
    },
    dz: function (x, y, z) {
        return -this.ς * y * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-1, 1) + coordinateDelta.x, 6);
        let y = round(random(-1, 1) + coordinateDelta.y, 6);
        let z = round(random(-1, 1) + coordinateDelta.z, 6);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};
const bouali2 = {
    name: "Bouali 2",
    dxdt: "dx/dt = αx(1 - y) - βz",
    dydt: "dy/dt = -γy(1 - x" + squared + ")",
    dzdt: "dz/dt = μx",
    α: 3,
    β: 2.2,
    γ: 1,
    μ: 0.001,
    dt: 0.02,
    scl: 100,
    pathLength: 100,
    highHue: 150,
    lowHue: 40,
    parameters: {
        α: "3",
        β: "2.2",
        γ: "1",
        μ: "0.001",
    },
    offSet: {
        x: 0,
        y: -1 * 100,
        z: 0,
    },
    motion: {
        vel: 0.01,
        axis: [0, 1, 0],
    },
    tilt: {
        x: 0,
        y: 0,
        z: Math.PI,
        otherTilt: 0,
        otherAxis: [0, 1, 0],
    },
    
    dx: function (x, y, z) {
        return (this.α * x * (1 - y) - this.β * z) * this.dt;
    },
    dy: function (x, y, z) {
        return -this.γ * y * (1 - x * x) * this.dt;
    },
    dz: function (x, y, z) {
        return this.μ * x * this.dt;
    },
    particleColor: function () {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function () {
        let position = {};
        let x = round(random(-2, 2), 2);
        let y = round(random(0, 2), 2);
        let z = round(random(-2, 2), 2);
        position["x"] = x;
        position["y"] = y;
        position["z"] = z;
        return position;
    },
};

const threeDAttractor = {
    name: "3D Attractor",
    dxdt: "dx/dt = a1 + a2*X + a3*X² + a4*X*Y + a5*X*Z + a6*Y + a7*Y² + a8*Y*Z + a9*Z + a10*Z²",
    dydt: "dy/dt = b1 + b2*X + b3*X² + b4*X*Y + b5*X*Z + b6*Y + b7*Y² + b8*Y*Z + b9*Z + b10*Z²",
    dzdt: "dz/dt = c1 + c2*X + c3*X² + c4*X*Y + c5*X*Z + c6*Y + c7*Y² + c8*Y*Z + c9*Z + c10*Z²",
    parameters: {
        a1: "0.1", a2: "0.1", a3: "0.1", a4: "0.1", a5: "0.1", a6: "0.1", a7: "0.1", a8: "0.1", a9: "0.1", a10: "0.1",
        b1: "0.1", b2: "0.1", b3: "0.1", b4: "0.1", b5: "0.1", b6: "0.1", b7: "0.1", b8: "0.1", b9: "0.1", b10: "0.1",
        c1: "0.1", c2: "0.1", c3: "0.1", c4: "0.1", c5: "0.1", c6: "0.1", c7: "0.1", c8: "0.1", c9: "0.1", c10: "0.1"
    },
    dt: 0.01,
    pathLength: 100,
    scl: 10,
    highHue: 360,
    lowHue: 0,
    updateParameters: function(newParams) {
        for (const key in newParams) {
            if (this.parameters.hasOwnProperty(key)) {
                this.parameters[key] = newParams[key];
            }
        }
    },
    dx: function(x, y, z) {
        const p = this.parameters;
        return (parseFloat(p.a1) + parseFloat(p.a2) * x + parseFloat(p.a3) * x * x + parseFloat(p.a4) * x * y +
                parseFloat(p.a5) * x * z + parseFloat(p.a6) * y + parseFloat(p.a7) * y * y + parseFloat(p.a8) * y * z +
                parseFloat(p.a9) * z + parseFloat(p.a10) * z * z) * this.dt;
    },
    dy: function(x, y, z) {
        const p = this.parameters;
        return (parseFloat(p.b1) + parseFloat(p.b2) * x + parseFloat(p.b3) * x * x + parseFloat(p.b4) * x * y +
                parseFloat(p.b5) * x * z + parseFloat(p.b6) * y + parseFloat(p.b7) * y * y + parseFloat(p.b8) * y * z +
                parseFloat(p.b9) * z + parseFloat(p.b10) * z * z) * this.dt;
    },
    dz: function(x, y, z) {
        const p = this.parameters;
        return (parseFloat(p.c1) + parseFloat(p.c2) * x + parseFloat(p.c3) * x * x + parseFloat(p.c4) * x * y +
                parseFloat(p.c5) * x * z + parseFloat(p.c6) * y + parseFloat(p.c7) * y * y + parseFloat(p.c8) * y * z +
                parseFloat(p.c9) * z + parseFloat(p.c10) * z * z) * this.dt;
    },
    particleColor: function() {
        return color(random(this.lowHue, this.highHue), 100, 50);
    },
    initialCoordinates: function() {
        return {
            x: random(-10, 10),
            y: random(-10, 10),
            z: random(-10, 10)
        };
    }
};


let attractors = {
    lorenz: lorenz,
    //threeDAttractor:threeDAttractor,
    shimizuMorioka: shimizuMorioka,
    bouali2: bouali2,
    rayleighBenard: rayleighBenard,
    anishchenkoAstakhov: anishchenkoAstakhov,
    qiChen: qiChen,
    sprott: sprott,
    chua1: chua1,
    finance: finance,
    bouali: bouali,
    hadley: hadley,
    // chua2: chua2,
    // aizawa: aizawa,
    luChen: luChen,

    thomas: thomas,
    halvorsen: halvorsen,

    rucklidge: rucklidge,

    // lorenzMod2: lorenzMod2,
    // lorenzMod1: lorenzMod1,

    sakarya: sakarya,
    // threeScroll1: threeScroll1,
    genesioTesi: genesioTesi,

    arneodo: arneodo,
    burkeShaw: burkeShaw,
    newtonLeipnik: newtonLeipnik,
    coullet: coullet,
    fourwing: fourwing,
    rabinovichFabrikant: rabinovichFabrikant,
    dadras: dadras,
    chen: chen,
    rossler: rossler,
    // threeScroll2: threeScroll2,
    // lorenz83: lorenz83,

    noseHoover: noseHoover,
};