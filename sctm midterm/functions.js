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
    noRepeats =[];
}


function check() {

    if (same >= 1 && same < 9) {
        console.log("You wrote the correct words " + same + " time(s).... You need to guess the 10 or more correct words")
        //writng the words that were corect.. might now show for last run
        console.log(noRepeats)
        console.log(sameWord)
    }else if(same >= 10){
        console.log("You wrote the correct words " + same + " time(s)")
        console.log("Here is your prize")
        //change link PRIZE LINK  -------------------------
        window.open("https://t3.ftcdn.net/jpg/03/14/56/66/360_F_314566645_UNHlYyGK2EVdGQ8MoNw95vvH44yknrc7.jpg", "_self");
    }else {
        console.log("You did not get any words right")
    }
    
}


//cheakcing if there are any repeats
function repeat() {
    // console.log(newArr);
    const num = newArr.length;
    const mostFrequent = (newArr = [], num = 1) => {
        const map = {};
        let keys = [];
        for (let i = 0; i < newArr.length; i++) {
            if (map[newArr[i]]) {
                map[newArr[i]]++;
            } else {
                map[newArr[i]] = 1;
            }
        }
        for (let i in map) {
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