

function IsEnter() {
    // Get all the data from the input box.
    var TextBox_val = document.getElementById("InputBox").value;

    // If enter key is pressed then only respond.
    // if (event.keyCode == 13)
    //     inputField.value = " ";
    // main();

    // var key = event.keyCode;
    // console.log(key);



    if (event.keyCode == 13) {
        //getting random varaibles
        var rand1 = [Math.floor(Math.random() * 13)];

        if (rand1 >= 10) {
            setTimeout(alertAnnoying, 30);
        }

        //either the input goes through or the window closes
        if (rand1 != 2) {
            main();
        } else {
            window.close();
        }

        //wont clear text box if rand1 equals 0
        if (rand1 == 1) {
            //clears textbox
            document.getElementById("InputBox").value = "";
        }
    }

    if (event.keyCode == (65) || event.keyCode == (78)) {
        setTimeout(alertAnnoying, 30);
    }


    if (event.keyCode == 16) {
        generateRandomColour()
    }
}



//Extra functions
function alertAnnoying() {
    alert(annoying[Math.floor(Math.random() * annoying.length)]);
}

function generateRandomColour() {
    var myRandomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    document.body.style.backgroundColor = myRandomColor;
}


// -------------------------  TEXT BOT ACTIONS  ---------------------------//

function main() {

    //setting up input and output data
    var TextBox_val = document.getElementById("InputBox").value; // Get all the data from the input box.
    var ResponseText_val = document.getElementById("ResponseText"); // Get all the data from the response text.
    var FormatInput = TextBox_val.toLowerCase().trim();

    var rand2 = [Math.floor(Math.random() * 10)];

    if (rand2 == 1) {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley", "_blank");
    } else if (rand2 == 2) {
        window.open("https://www.google.com", "_blank");
    } else if (rand2 == 3) {
        location.reload();
    }


    // RESPONSES
    if (FormatInput.includes("help")) {

        ResponseText_val.innerHTML = help[Math.floor(Math.random() * help.length)];

    } else if (FormatInput == ("hi") || FormatInput.includes("hello") || FormatInput.includes("hey")) {
        ResponseText_val.innerHTML = greeting[Math.floor(Math.random() * greeting.length)];

    } else if (FormatInput.includes("how are you")) {
        ResponseText_val.innerHTML = howAreYou[Math.floor(Math.random() * howAreYou.length)];

    } else if (FormatInput.includes("annoying")) {

        ResponseText_val.innerHTML = annoying[Math.floor(Math.random() * annoying.length)];

    } else if (FormatInput.includes("do something")) {

        ResponseText_val.innerHTML = "no";
        window.close();

    }
    else if (FormatInput == ("")) {
        ResponseText_val.innerHTML = empty[Math.floor(Math.random() * empty.length)];;

    } else {
        ResponseText_val.innerHTML = alternative[Math.floor(Math.random() * alternative.length)];
    }



}
