

const input = prompt("enetr 1");

if (input == 1){
    // window.open("https://www.google.com", "_blank");
    box();
}


function box() {
    new WinBox("Custom Root", {
        root: document.querySelector("main")
    });
}