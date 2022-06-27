/**
 * Small animation function to create basic animations with setInterval
 */

// If the browser is ready start the function
window.onload = function () {
    //Select the container in which the animation will be played
    let node_copy = document.getElementById('asciiAni');

    //animation framses   
    asciiFrames = [
        '	(￣ ￣|||)',
        '	(￣ ￣|||)',
        '	(￣ ￣;;;)',
        '	(￣ ￣;;;)',
        '	(￣ ￣...)',
        '	(￣ ￣...)',
        '	(￣ ￣...)',
        '	(￣ ￣...)',
    ]







    // asciiFrames = [
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°□°)ヘ ┬─┬ \xa0',
    //     '(ヘ°□°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°□°)ヘ ┬─┬ \xa0',
    //     '(ヘ°□°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ°-°)ヘ ┬─┬ \xa0',
    //     '(ヘ‵□′)ヘ ┬─┬ \xa0',
    //     '(ヘ‵□′)ヘ ┬─┬ \xa0',
    //     '(╯‵□′）╯\xa0︵ ┻━┻',
    //     '╯‵□′）╯\xa0－－┻━┻',
    //     '‵□′）╯－－－┻━┻',
    //     '-°）╯－－－－┻━┻',
    //     '°）╯－－－－┻━┻',
    //     '）╯－－－－┻━┻',
    //     '╯－－－－┻━┻',
    //     '－－－－┻━┻',
    //     '－－－┻━┻ \xa0 \xa0˦',
    //     '－－┻━┻ \xa0 \xa0˦\xa0',
    //     '\xa0\xa0\xa0－┻━┻ \xa0\xa0 ˦ \xa0',
    //     '\xa0\xa0\xa0\xa0－┻━┻ \xa0 ˦ \xa0',
    //     '\xa0\xa0\xa0\xa0\xa0\xa0 ┻━┻ ˦ \xa0',
    //     '\xa0\xa0\xa0\xa0\xa0 ┻ ━┻ ˦ \xa0',
    //     '\xa0\xa0\xa0\xa0\xa0 ┻ ━┻ ˦ \xa0',
    //     '\xa0\xa0\xa0\xa0\xa0 ┻ ━┻ ˦ \xa0', //Dublicate frames to have a small pause 
    //     '‎）\xa0\xa0\xa0\xa0 ┻ ━┻ ˦ \xa0',
    //     'ಥ）\xa0\xa0\xa0 ┻ ━┻ ˦',
    //     '-ಥ）\xa0\xa0 ┻ ━┻ ˦',
    //     '‎ಥ-ಥ）\xa0 ┻ ━┻ ˦ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '‎(ಥ-ಥ） ┻ ━┻ ',
    //     '(ヘ°-°) ┻ ━┻ ',
    //     '(ヘ°-°) ┻ ━┻ ',
    //     '(ヘ°-°) ┻ ━┻ ',
    //     '(ヘ°-°) ┻ ━┻ ',
    // ]



    var animateASCII = {
        init: function (frames, target) {
            //Set the start frame to 0
            let i = 0;
            //Puts the start frame insight the node_copy container   
            node_copy.innerText = frames[0];
            //Starts the intervall to render the animnation     
            setInterval(() => {
                //Puts the new frame in the node_copy container  
                node_copy.innerText = frames[i];
                /*Goes to the next array element (frame), and set it to 
                  zero if we reached the last frame to restart the animation*/
                if (i < frames.length - 1) {
                    i++;
                } else {
                    i = 0;
                }
                //Here you can adjust the animation speed
            }, 150);
        }
    };

    //Starts the ASCII function
    animateASCII.init(asciiFrames, node_copy);
} 