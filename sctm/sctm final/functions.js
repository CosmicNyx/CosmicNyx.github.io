//for cleaning up spaces and such 
function clean() {
    ///TRIM WITH NO SPACES IN FROMt
    for (let i = 0; i < inputs.length; i++) {
        inputs[i] = inputs[i].trim();
    }
    // console.log("clean " + inputs);
}


function removeBlanks() {
    for (let i = 0; i < inputs.length; i++) {
        if (inputs[i]) {
            newArr.push(inputs[i]);
        }
    }
    // console.log("no spaces " +newArr)
}

//for clearing arrays 
function clearArrays() {
    inputs = [];
    newArr = [];
    // sameWord = [];
    same = 0;
    noRepeats = [];
}


//checking and showing
function check() {

    if (totalWords >= 50){
        alert("Oh wow youve written 50 words")
        alert("damn")
    }else if(totalWords >= 150){
        alert("get a life")
        alert("damn")
        window.close();
    }

    if (start == 1 && localStorage.getItem("Start")!= "true") {
        alert("Was that fun? Well now how about you rant again and we'll see how many words you an write down")
        alert("If you write a few specific words in your rants, you might win a treat")
        alert("We'll let you know how many words you got so you can catch on")
        localStorage.setItem("Start", "true");
    }else if (start == 1 && localStorage.getItem("Start")== "true"){
        alert("I see you've been here before")
        alert("You know what to do")
    }
    
    if(start == 5){
        alert("ok im tired")
        alert("goodbye")
        window.close();
    }
    else if (same >= 1 && same < 9) {
        alert("You wrote the correct words " + same + " time(s).... You need to guess the 10 or more correct words")
        // console.log(noRepeats)
        // console.log(sameWord)
    } else if (same >= 10) {
        alert("You wrote the correct words " + same + " time(s)")
        alert("Here is your prize")
        //change link PRIZE LINK  -------------------------
        window.open("https://www.youtube.com/watch?v=attUrDwfdr8&ab_channel=Gamerboy", "_self");
    } else {
        alert("You did not write down any of the correct words")
    }

}


function repeat(){
    for (let i = 0; i < newArr.length; i++) {
        if (noRepeats.indexOf(newArr[i]) === -1){
            noRepeats.push(newArr[i])
        }
    }
    console.log(newArr)
    console.log(noRepeats)
    storage();
}


//LOCAL STORAGE
//keeps track of how many words youve written in total
function storage(){
    // console.log(localStorage.getItem("Words"));
    // console.log("---------");
    // console.log(Number(localStorage.getItem("Words")));
    // console.log(noRepeats.length);
    totalWords = Number(localStorage.getItem("Words")) + noRepeats.length;
    console.log(totalWords);
    //let x = Number(localStorage.getItem("Words")) + noRepeats.length;
    localStorage.setItem("Words", totalWords);

    // let x = localStorage.getItem("Words") + noRepeats.length;

    // localStorage.setItem("Words", noRepeats.length);
    // console.log("local storage actual: "+ localStorage.getItem("Words"))
    // console.log("local storage: "+x)
}