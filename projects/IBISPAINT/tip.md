<!-- Instructions Panel -->
    <div class="instructions-panel">
        <button class="instructions-toggle" onclick="toggleInstructions()">?</button>
        <div class="instructions-content">
            <h3>How to Use</h3>
            <ul>
                <li><strong>Sliders:</strong> Adjust variables to change particle behavior.</li>
                <li><strong>dx/dt:</strong> Affects the x-axis per time step.</li>
                <li><strong>dy/dt:</strong> Affects the y-axis per time step.</li>
                <li><strong>dz/dt:</strong> Affects the z-axis per time step.</li>
                <li><strong>Left Click:</strong> Rotate the simulation.</li>
                <li><strong>Right Click:</strong> Zoom in/out.</li>
                <li><strong>Spacebar:</strong> Pause/Resume the simulation.</li>
                <li><strong>Z:</strong> Show/hide details.</li>
                <li><strong>X:</strong> Toggle rotation speed.</li>
                <li><strong>S:</strong> Take a screenshot.</li>
                <li><strong>Enter:</strong> Switch to a random attractor.</li>
                <li><strong>Backspace:</strong> Clear all particles.</li>
                <li><strong>Alt:</strong> Add more particles.</li>
            </ul>
        </div>
    </div>

---------------------------

    // Toggle instructions panel
        function toggleInstructions() {
            const instructionsPanel = document.querySelector('.instructions-panel');
            instructionsPanel.classList.toggle('expanded');
        }