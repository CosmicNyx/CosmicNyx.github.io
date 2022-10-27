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
    sameWord = [];
    same = 0;
    noRepeats = [];
}


//checking and showing results
function check() {
    if (start == 1) {
        alert("Was that fun? Well now how about you rant again and see if you write down certain common words. If you do, you'll get a prize!")
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


//cheakcing if there are any repeats
function repeat() {
    // console.log(newArr);
    const num = newArr.length;
    const mostFrequent = (newArr = [], num = 1) => {
        const temp = {};
        let keys = [];
        for (let i = 0; i < newArr.length; i++) {
            if (temp[newArr[i]]) {
                temp[newArr[i]]++;
            } else {
                temp[newArr[i]] = 1;
            }
        }
        for (let i in temp) {
            keys.push(i);
            // console.log("i "+i)
            noRepeats.push(i)
        }
    };
    // console.log("below")
    mostFrequent(newArr, num);
    // console.log("sorted "+noRepeats)
    // newArr.push(mostFrequent(newArr, num));
    // console.log("after push "+newArr)
}