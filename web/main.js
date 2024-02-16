document.addEventListener('DOMContentLoaded', () => {
    // Terminal WinBox
    const terminalWinBox = new WinBox("Terminal", {
        html: '<input type="text" id="terminalInput" placeholder="Enter command..." style="width: 100%;"> for lack of time here are the following inputs. file1, file2, site',
        width: '400px',
        height: '300px',
        x: "center",
        y: "center",
        class: "terminal", 
        border: false,
        controls: false, 
    });

    document.getElementById('terminalInput').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            processCommand(this.value);
            this.value = ''; // Clear input field
        }
    });



    function displayWinBoxesSequentially(winBoxes, index = 0) {
        if (index < winBoxes.length) {
            const { title, text, width, height, cssClass, xVar, yVar, delay } = winBoxes[index];

            setTimeout(() => {
                new WinBox({
                    title: title,
                    html: `<p>${text}</p>`,
                    width: width,
                    height: height,
                    class: cssClass, 
                    x: xVar,
                    y: yVar,
                });
                displayWinBoxesSequentially(winBoxes, index + 1); 
            }, delay);
        }
    }

    // Process terminal inputs to choose the path
    function processCommand(command) {
        var selectedPath;
        switch (command.trim().toLowerCase()) {
            case 'file1':
                selectedPath = winBoxPaths.path1;
                break;
            case 'file2':
                selectedPath = winBoxPaths.path2;
                break;
            case 'site':
                new WinBox("acesandaros.org", {
                    class: 'terminal',
                    url: "https://acesandaros.org/learn/the-asexual-umbrella"
                });
                break;
            default:
                console.log('Command not recognized.');
                return;
        }
        displayWinBoxesSequentially(selectedPath);
    }

    // Setup to listen for Enter key in the terminal input
    document.getElementById('commandInput').addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            processCommand(this.value);
            this.value = ''; // Clear input field
        }
    });
});