var before = document.getElementById("before");
var liner = document.getElementById("liner");
var command = document.getElementById("typer");
var textarea = document.getElementById("texter");
var terminal = document.getElementById("terminal");

var git = 0;
var pw = false;
let pwd = false;
var commands = [];


// ---------- START -------------- //

loopLines(load, "index", 200);
setTimeout(function () {
    clear();
    loopLines(banner, "", 80);
}, 4700)


// setTimeout(function () {
//     loopLines(banner, "", 80);
//     textarea.focus();
// });

// ------------------- //

window.addEventListener("keyup", enterKey);

console.log(
    "%cOH WOW YOU FOUND THE HIDDEN COMMAND",
    "color: #04ff00; font-weight: bold; font-size: 24px;"
);
console.log("%cCommand: '" + password + "'", "color: grey");

//init
textarea.value = "";
command.innerHTML = textarea.value;

function enterKey(e) {
    if (e.keyCode == 181) {
        document.location.reload(true);
    } else {
        if (e.keyCode == 13) {
            commands.push(command.innerHTML);
            git = commands.length;

            // ----------------------------------------VISITOR LINE BEFORE CHANGE-----------------------------//
            addLine("C:\\Users\\Guest\\.COSMICNYC.GITHUB.IO\\.Index> " + command.innerHTML, "no-animation", 0);
            commander(command.innerHTML.toLowerCase());
            command.innerHTML = "";
            textarea.value = "";
        }
        if (e.keyCode == 38 && git != 0) {
            git -= 1;
            textarea.value = commands[git];
            command.innerHTML = textarea.value;
        }
        if (e.keyCode == 40 && git != commands.length) {
            git += 1;
            if (commands[git] === undefined) {
                textarea.value = "";
            } else {
                textarea.value = commands[git];
            }
            command.innerHTML = textarea.value;
        }
    }
}


function commander(cmd) {
    switch (cmd.toLowerCase()) {
        case "help":
            loopLines(help, "color2 margin", 80);
            break;

        case "whois":
            loopLines(whois, "color2 margin", 80);
            console.log(typer)
            break;

        case "whoami":
            loopLines(whoami, "color2 margin", 80);
            break;

        //--- HIDDEN COMMAND---//
        case "mjjhdsfbsdbfmsgfhjeksbsdfkfgskjgkj":
            loopLines(secret, "color2 margin", 80);
            setTimeout(function () {
                window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
            }, 3000);
            break;

        case "secret":
            addLine('Bruh... Youre supposed to find the secret command. The command isnt "secret"', "error", 80);
            break;


        // --- ASSIGNMENTS---//
        case "projects":
            loopLines(projects, "color2 margin", 80);
            break;

        case "exercises":
            loopLines(exercises, "color2 margin", 80);
            break;

        case "readings":
            loopLines(readings, "color2 margin", 80);
            break;

        //----------//

        case "password":
            addLine("<span class=\"inherit\"> Lol! You're joking, right? You\'re gonna have to try harder than that!</span>", 100);
            break;

        case "history":
            addLine("<br>", "", 0);
            loopLines(commands, "color2", 80);
            addLine("<br>", "command", 80 * commands.length + 50);
            break;



        case "clear":
            clear();
            break;

        case "banner":
            loopLines(banner, "", 80);
            break;






        // READING CALLOUTS------//
        case "reading1":
            addLine('Opening reading 1 window...', "color2", 80);
            setTimeout(function () {
                reading1();
            }, 500);
            break;

        case "reading2":
            addLine('Opening reading 2 window...', "color2", 80);
            setTimeout(function () {
                reading2();
            }, 500);
            break

        case "reading3":
            addLine('Opening reading 3 window...', "color2", 80);
            setTimeout(function () {
                reading3();
            }, 500);
            break

        case "reading4":
            addLine('Opening reading 4 window...', "color2", 80);
            setTimeout(function () {
                reading4();
            }, 500);
            addLine('Opening reading 4 question 2 link...', "color2", 80);
            setTimeout(function () {
                newTab(qReading4);
            }, 500);
            break

        case "reading5":
            addLine('Opening reading 5 window...', "color2", 80);
            setTimeout(function () {
                reading4();
            }, 500);
           
            setTimeout(function () {
                newTab(qReading5);
            }, 500);
           
            break




        // --------------------MAKE ALL LINK CASES HERE--------------------------

        //  --- PROJECTS---//

        case "typeface":
            addLine("Opening CSS_Typeface...", "color2", 80);
            newTab(cssTypeface);
            break;

        case "web_poster":
            addLine("Opening Web_Typographic_Poster...", "color2", 0);
            newTab(webTypographicPoster);
            break;

        case "chatbox":
            addLine("Opening Interactive_Elements...", "color2", 0);
            newTab(interactiveElements);
            break;

        case "index":
            addLine("You're already here...", "error", 0);
            break;


        //--------- EXERCISES------//
        case "self_portrait":
            addLine("Opening Self_Portrait...", "color2", 0);
            newTab(exer1);
            break;

        case "css_flags":
            addLine("Opening CSS_Flags...", "color2", 0);
            newTab(exer2);
            break;

        case "fonts_ani":
            addLine("Opening Fonts_&_Animation...", "color2", 0);
            newTab(exer3);
            break;

        case "iframes":
            addLine("Opening iFrames...", "color2", 0);
            newTab(exer4);
            break;

        case "element_inspector":
            addLine("Opening Element_Inspector...", "color2", 0);
            newTab(exer5);
            break;

        case "ui":
            addLine("Opening UI_Style_Guide...", "color2", 0);
            newTab(exer6);
            break;


        // ---RANDOM RESOURCE LINK CASE-----//
        case "resources":
            addLine("Opening a random resource link...", "color2", 0);
            var random = Math.floor(Math.random() * 7);
            // console.log(random);
            if (random == 0) {
                newTab(link1);
            } else if (random == 1) {
                newTab(link2);
            } else if (random == 2) {
                newTab(link3);
            } else if (random == 3) {
                newTab(link4);
            } else if (random == 4) {
                newTab(link5);
            } else if (random == 5) {
                newTab(link6);
            } else if (random == 6) {
                newTab(link7);
            } else {
                newTab(link8);
            }
            break;


        // RANDOM INSPA LINK
        case "misc":
            addLine("Opening a random insparation link...", "color2", 0);
            var random = Math.floor(Math.random() * 2);
            // console.log(random);
            if (random == 0) {
                newTab(ilink1);
            } else if (random == 1) {
                newTab(ilink2);
            } else {
                newTab(ilink3);
            }
            break;






        case "ascii":

            var random = Math.floor(Math.random() * 5);
            // console.log(random);
            if (random == 0) {
                loopLines(ascii1, "command", 80);
            } else if (random == 1) {
                loopLines(ascii2, "command", 80);
            } else if (random == 2) {
                loopLines(ascii3, "command", 80);
            } else if (random == 3) {
                loopLines(ascii4, "command", 80);
            } else {
                loopLines(ascii5, "command", 80);
            }
            break;


        default:
            // loopLines(commands.splice(0), "color2", 80);
            addLine(commands.splice(commands.length - (commands.length + 1)) + "<span class=\"inherit\"> is not recognized as an internal or external command, operable program or batch file. For a list of commands, type <span class=\"command\">'help'</span>.</span>", "error", 100);
            break;
    }
}




// ---------------------------------------------------------//
// FUNCTIONS

// new tabs
function newTab(link) {
    setTimeout(function () {
        window.open(link, "_blank");
    }, 500);
}

// New lines
function addLine(text, style, time) {
    var t = "";
    for (let i = 0; i < text.length; i++) {
        if (text.charAt(i) == " " && text.charAt(i + 1) == " ") {
            t += "&nbsp;&nbsp;";
            i++;
        } else {
            t += text.charAt(i);
        }
    }
    setTimeout(function () {
        var next = document.createElement("p");
        next.innerHTML = t;
        next.className = style;

        before.parentNode.insertBefore(next, before);

        window.scrollTo(0, document.body.offsetHeight);
    }, time);
}

function loopLines(name, style, time) {
    name.forEach(function (item, index) {
        addLine(item, style, index * time);
    });
}


function clear() {
    setTimeout(function () {
        terminal.innerHTML = '<a id="before"></a>';
        before = document.getElementById("before");
    }, 1);
}



// ----------- READING WINBOX FUNCTIONS ----------------//

bkgrColor = "#81957C";

// WINBOX
function reading1() {
    const textbox = new WinBox({
        title: "Reading 1",
        width: "600px",
        background: bkgrColor,
        mount: document.querySelector('#reading1'),
    })
}


function reading2() {
    const textbox = new WinBox({
        title: "Reading 2",
        width: "600px",
        background: bkgrColor,
        mount: document.querySelector('#reading2'),
    })
}


function reading3() {
    const textbox = new WinBox({
        title: "Reading 3",
        width: "600px",
        background: bkgrColor,
        mount: document.querySelector('#reading3'),
    })
}


function reading4() {
    const textbox = new WinBox({
        title: "Reading 4",
        width: "600px",
        background: bkgrColor,
        mount: document.querySelector('#reading4'),
    })
}


function reading5() {
    const textbox = new WinBox({
        title: "Reading 5",
        width: "600px",
        background: bkgrColor,
        mount: document.querySelector('#reading5'),
    })
}