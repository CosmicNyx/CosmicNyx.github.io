//array vars
var inputs = [];
var newArr = [];
var t = 0;
var same = 0
var sameWord = [];
var noRepeats = [];



function alphaOnly() {
    var TextBox_val = document.getElementById("InputBox").value;

    if ((event.keyCode >= 65 && event.keyCode <= 90) || event.keyCode == 8) {
        console.log("letter")
        // IsEnter();

    } else if (event.keyCode == 13 || event.keyCode == 32) {
        main();
        document.getElementById("InputBox").value = "";
    } else {
        console.log("no")
        clear()
        // document.getElementById("InputBox").value = "";
    }
};


//For when user puts in a number
function clear() {
    document.getElementById("InputBox").value = "";
    document.getElementById("InputBox").disabled = true;
    document.getElementById("InputBox").disabled = false;
}




//after user presses enter
function main() {

    ///////////////////////////////////

    //setting up input and output data
    var TextBox_val = document.getElementById("InputBox").value; // Get all the data from the input box.
    var ResponseText_val = document.getElementById("ResponseText"); // Get all the data from the response text.
    var FormatInput = TextBox_val.toLowerCase().trim();///

    if ((FormatInput.includes("roll"))) {
        inputs.push(TextBox_val);
        t = inputs.length - 2;
        clean();
        //roeason it snot working cuase it needs trim.. make into a func???
        if (inputs[t] == ("rick")) {
            window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley", "_self");
        } else {
            console.log("not rick")
            console.log(inputs[t])
        }
    }

    //clears the input array
    if ((FormatInput.includes("clear"))) {
        clear
    }

    /**
     * write some more fun words for links i dunno 
     * go to random websites
    */

    //if stament that tells if user is done and wants results
    if ((FormatInput.includes("done"))) {
        // console.log("done");
        removeBlanks()
        sort();
        // console.log(words);
    } else {

        inputs.push(TextBox_val);

        // console.log("inputs " + inputs)
        clean();
    }

}


//sorting into stats func
function sort() {

    repeat();
    // // //--------COMAPRING WORDS----------
    // console.log(words[z])
    // Loop for array1
    for (let i = 0; i < noRepeats.length; i++) {

        // Loop for array2
        for (let j = 0; j < words.length; j++) {
            // Compare the element of each and
            // every element from both of the
            // arrays
            if (noRepeats[i] === words[j]) {
                // add one if common word is found
                same++;
                //push same words to a new array
                sameWord.push(words[j]);
            }
        }
    }

    check()
    clearArrays()
}

