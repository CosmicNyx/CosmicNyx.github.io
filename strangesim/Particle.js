class Particle {
    constructor(clr, scl, initialCoordinates, pathLength, offSet) {
        this.startPoint = initialCoordinates();
        this.x = this.startPoint.x;
        this.y = this.startPoint.y;
        this.z = this.startPoint.z;
        this.scl = scl;
        this.color = clr;
        this.path = [];
        this.initialCoordinates = initialCoordinates;
        this.pathLength = pathLength;
        this.offSet = offSet;
    }

    reactToMouse() {
        let mousePos = createVector(mouseX - width / 2, mouseY - height / 2, 0); // Adjust for WEBGL
        let particlePos = createVector(this.x, this.y, this.z);
        let d = p5.Vector.dist(mousePos, particlePos);

        if (d < 50) { // Threshold distance to react
            let force = p5.Vector.sub(particlePos, mousePos);
            force.setMag(0.5); // Adjust the strength of the reaction
            force.mult(0.1); // Damping to control speed
            this.x += force.x;
            this.y += force.y;
            this.z += force.z;
        }
    }

    show(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        if (
            this.z * this.scl > innerWidth / 2 ||
            this.z * this.scl < -innerWidth / 2 ||
            this.x * this.scl > innerWidth / 2 ||
            this.x * this.scl < -innerWidth / 2 ||
            this.y * this.scl > innerWidth / 2 ||
            this.y * this.scl < -innerWidth / 2
        ) {
            this.path = [];
            let newCoordinate = this.initialCoordinates();
            this.x = newCoordinate.x;
            this.y = newCoordinate.y;
            this.z = newCoordinate.z;
        }
        this.path.push(createVector(this.x, this.y, this.z));
        if (this.path.length > this.pathLength) {
            this.path.shift();
        }

        this.renderParticle();
        this.renderTrail();
    }

    renderParticle() {
        // Bloom effect based on z coordinate distance
        let bloomWeight = map(abs(this.z), 0, 100, 8, 2); // Adjust the range based on your scene scale
        noFill();
        stroke(this.color);
        strokeWeight(bloomWeight);
        point(
            this.offSet.x + this.x * this.scl,
            this.offSet.y + this.y * this.scl,
            this.offSet.z + this.z * this.scl
        );
    }

    renderTrail() {
        // Render the trail of particles
        noFill();
        beginShape();
        for (let i = 1; i < this.path.length; i++) {
            stroke(this.color);
            strokeWeight(1); // Optional: use map function for dynamic weight
            vertex(
                this.offSet.x + this.path[i].x * this.scl,
                this.offSet.y + this.path[i].y * this.scl,
                this.offSet.z + this.path[i].z * this.scl
            );
        }
        endShape();
    }
}


function toggleNav() {
    const navbar = document.querySelector('.navbar');
    const holder = document.querySelector('#holder');
    const toggleButton = document.querySelector('.nav-toggle');

    navbar.classList.toggle('hidden-nav');
    holder.classList.toggle('hidden-holder');
    toggleButton.classList.toggle('hidden-toggle');

    // Adjust the left position of holder and button text based on navbar state
    if (navbar.classList.contains('hidden-nav')) {
        holder.style.left = "0";
        toggleButton.style.left = "0";
        toggleButton.innerHTML = "&gt;"; // Set text to '>'
    } else {
        holder.style.left = "16rem";
        toggleButton.style.left = "16rem";
        toggleButton.innerHTML = "&lt;"; // Set text to '<'
    }
}

