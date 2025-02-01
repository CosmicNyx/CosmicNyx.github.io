# A love message

## Table of Contents

- [Concept](#concept)
- [Idea](#idea)
- [Files Overview](#files-overview)
- [Key Functionalities](#key-functionalities)
- [Usage](#usage)
- [Complex Terminal Idea](#complex-terminal-idea)
- [How I Did It](#how-i-did-it)


## Concept
This concept explores visual and interactive storytelling through the aesthetics of a retro style. The interactive part comes from unexpected moments when reading the diary and the characters' feelings: unexpected popups, Java animations, and exploring files and entries.

## Idea
I chose to work on a web-based project because I like building them. In my haste to think of something, I began coding some features as I considered the narrative. The designathon offered me the opportunity to unwind, code something random, and create the basis for next projects.

The project's purpose was to design a desktop interface with interactive windows. Cleaning up the code took some time, and I still have files from previous attempts. My primary goal was to make the code as efficient as feasible. I've always liked this look and have worked on similar projects before.

## Files Overview

- `index.html`: The main HTML document that sets up the web page structure, including references to CSS stylesheets for styling and JavaScript files for functionality.

- `styles.css`: Contains the styling rules for the web application, focusing on a minimalist and tech-oriented aesthetic, with specific styles for the body, container, and terminal elements.

- `bkgr.js`: Implements functionality related to mouse movement detection, enhancing the interactive aspect of the application by responding to user actions.

- `main.js`: Sets up a terminal interface using the WinBox library, allowing users to enter commands and interact with the application.

- `winboxContent.js`: Defines content that can be dynamically displayed within WinBox instances, adding an interactive storytelling or informational component to the application.

## Key Functionalities

- **Initialization**: Listens for the `DOMContentLoaded` event to ensure the HTML is fully loaded before executing the script.
- **WinBox Terminal Creation**: Utilizes the `WinBox` constructor to create a new window that acts as a terminal. This window is customizable and includes an input field for command entry.
- **Command Input Handling**: Integrates an input field within the terminal for user commands, which can be extended to support various commands and interactions within the application.
- **Styling and Positioning**: Applies specific CSS styles to the WinBox terminal for consistency with the application's aesthetic and user interface design.

## Usage

Users interact with the `main.js` functionality primarily through the terminal interface it creates. Upon entering commands into the terminal's input field, `main.js` can process these inputs to perform actions, such as opening new WinBox instances with content, changing application states, or triggering animations.


## Complex terminal idea

I wanted to make a terminal that worked as a terminal would, or exploring a terminal of sorts.
I wrote this on the side but just as somethign to ref off of in the actual prjects js file. I decded not to due to time constraints and also for the sake of my sanity.

```javascript
document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const inputField = document.getElementById('terminalInput');

    // Virtual file system
    let currentDirectory = '/';
    const fileSystem = {
        '/': {
            type: 'dir',
            content: ['folder1', 'folder2', 'file1.txt', 'file2.txt']
        },
        '/folder1': {
            type: 'dir',
            content: ['subfolder1', 'subfolder2', 'file3.txt']
        },
        '/folder2': {
            type: 'dir',
            content: []
        },
        '/folder1/subfolder1': {
            type: 'dir',
            content: ['file4.txt']
        },
        '/folder1/subfolder2': {
            type: 'dir',
            content: []
        },
        '/folder1/subfolder1/file4.txt': {
            type: 'file',
            content: 'This is the content of file4.txt.'
        },
        '/file1.txt': {
            type: 'file',
            content: 'This is the content of file1.txt.'
        },
        '/file2.txt': {
            type: 'file',
            content: 'This is the content of file2.txt.'
        },
        '/folder1/file3.txt': {
            type: 'file',
            content: 'This is the content of file3.txt.'
        }
    };

    inputField.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            executeCommand(this.value.trim());
            this.value = ''; // Clear input field
        }
    });

    // Execute command function
    function executeCommand(command) {
        appendToTerminal('$ ' + command);

        const parts = command.split(' ');
        const cmd = parts[0];
        const args = parts.slice(1);

        switch(cmd) {
            case 'ls':
                listDirectory();
                break;
            case 'cd':
                changeDirectory(args[0]);
                break;
            case 'cat':
                readFile(args[0]);
                break;
            case 'mkdir':
                createDirectory(args[0]);
                break;
            case 'touch':
                createFile(args[0]);
                break;
            default:
                appendToTerminal('Command not found: ' + cmd);
        }
    }

    // List files in current directory
    function listDirectory() {
        const content = fileSystem[currentDirectory].content;
        appendToTerminal(content.join(' '));
    }

    // Change current directory
    function changeDirectory(path) {
        const newPath = resolvePath(path);
        if (newPath in fileSystem && fileSystem[newPath].type === 'dir') {
            currentDirectory = newPath;
            appendToTerminal('Changed directory to ' + currentDirectory);
        } else {
            appendToTerminal('Directory not found: ' + newPath);
        }
    }

    // Read file content
    function readFile(filename) {
        const filePath = resolvePath(filename);
        if (filePath in fileSystem && fileSystem[filePath].type === 'file') {
            appendToTerminal(fileSystem[filePath].content);
        } else {
            appendToTerminal('File not found: ' + filePath);
        }
    }

    // Create new directory
    function createDirectory(dirname) {
        const newPath = resolvePath(dirname);
        if (!(newPath in fileSystem)) {
            fileSystem[newPath] = { type: 'dir', content: [] };
            appendToTerminal('Created directory: ' + newPath);
        } else {
            appendToTerminal('Directory already exists: ' + newPath);
        }
    }

    // Create new file
    function createFile(filename) {
        const filePath = resolvePath(filename);
        if (!(filePath in fileSystem)) {
            fileSystem[filePath] = { type: 'file', content: '' };
            appendToTerminal('Created file: ' + filePath);
        } else {
            appendToTerminal('File already exists: ' + filePath);
        }
    }

    // Resolve path relative to current directory
    function resolvePath(path) {
        if (path.startsWith('/')) {
            return path;
        } else {
            return currentDirectory + '/' + path;
        }
    }

    // Function to append text to terminal
    function appendToTerminal(text) {
        terminal.innerHTML += '<div>' + text + '</div>';
        terminal.scrollTop = terminal.scrollHeight; // Scroll to bottom
    }
});
```

## How I did it
With pizza and cola. 
