// Particle class to represent individual particles in the simulation
class Particle {
    constructor(clr, scl, initialCoordinates, pathLength, offSet) {
        // Initialize particle properties
        this.startPoint = initialCoordinates(); // Starting position of the particle
        this.x = this.startPoint.x; // Current x position
        this.y = this.startPoint.y; // Current y position
        this.z = this.startPoint.z; // Current z position
        this.scl = scl; // Scaling factor for rendering
        this.color = clr; // Color of the particle
        this.path = []; // Array to store the particle's path (trail)
        this.initialCoordinates = initialCoordinates; // Function to reset particle position
        this.pathLength = pathLength; // Maximum length of the particle's trail
        this.offSet = offSet; // Offset for rendering the particle
    }


    // Function to update and display the particle
    show(x, y, z) {
        // Update particle position
        this.x = x;
        this.y = y;
        this.z = z;

        // Check if the particle is out of bounds
        if (
            this.z * this.scl > innerWidth / 2 ||
            this.z * this.scl < -innerWidth / 2 ||
            this.x * this.scl > innerWidth / 2 ||
            this.x * this.scl < -innerWidth / 2 ||
            this.y * this.scl > innerWidth / 2 ||
            this.y * this.scl < -innerWidth / 2
        ) {
            // Reset particle position and clear its trail
            this.path = [];
            let newCoordinate = this.initialCoordinates();
            this.x = newCoordinate.x;
            this.y = newCoordinate.y;
            this.z = newCoordinate.z;
        }

        // Add the current position to the particle's path
        this.path.push(createVector(this.x, this.y, this.z));

        // Limit the path length to avoid excessive memory usage
        if (this.path.length > this.pathLength) {
            this.path.shift(); // Remove the oldest point from the path
        }

        // Render the particle and its trail
        this.renderParticle();
        this.renderTrail();
    }

    // Function to render the particle itself
    renderParticle() {
        // Bloom effect: Particle size changes based on z-coordinate distance
        let bloomWeight = map(abs(this.z), 0, 100, 8, 2); // Map z-distance to stroke weight
        noFill(); // No fill for the particle
        stroke(this.color); // Set particle color
        strokeWeight(bloomWeight); // Set particle size based on bloom effect
        // Draw the particle at its current position (with offset and scaling)
        point(
            this.offSet.x + this.x * this.scl,
            this.offSet.y + this.y * this.scl,
            this.offSet.z + this.z * this.scl
        );
    }

    // Function to render the particle's trail
    renderTrail() {
        noFill(); // No fill for the trail
        beginShape(); // Start drawing the trail
        for (let i = 1; i < this.path.length; i++) {
            stroke(this.color); // Set trail color
            strokeWeight(1); // Set trail thickness (optional: use map for dynamic weight)
            // Draw a line segment between consecutive points in the path
            vertex(
                this.offSet.x + this.path[i].x * this.scl,
                this.offSet.y + this.path[i].y * this.scl,
                this.offSet.z + this.path[i].z * this.scl
            );
        }
        endShape(); // End drawing the trail
    }
}