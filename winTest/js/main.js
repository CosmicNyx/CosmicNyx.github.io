// const about = document.querySelector('#about')
// const aboutContent = document.querySelector('#about-content')
// const contactContent = document.querySelector('#contact-content')

// window.addEventListener("keyup", enterKey);

//thing before the . is the name of the li id in the HTML 

hi.addEventListener('click', () => {
  new WinBox({
    title: 'About Me',
    // modal: true,
    width: '400px',
    height: '400px',
    top: 50,
    right: 50,
    bottom: 50,
    left: 50,
    mount: document.querySelector('#win1'),


    onfocus: function () {
      this.setBackground('#00aa00')
    },
    onblur: function () {
      this.setBackground('#777')
    },
  })
})


// -------------------


// ------ keeps track of keybourd clicking------

//oh this is perfect omg im such a genuis

window.addEventListener("keydown", (event) => {

  //
  if (event.keyCode == 90) {
    new WinBox("Basic Window");
    console.log("hi");
  }

  //
  if (event.keyCode == 88) {
    new WinBox("Custom Border", {
      border: "0.3em"
    });
    console.log("no");
  }



  //window wherver u want it...im so happy rn

  if (event.keyCode == 67) {
    new WinBox({
      title: "Custom Position / Size",
      x: "center",
      y: 67,
      width: "50%",
      height: "50%"
    });
    console.log("no");
  }

});

// ------------------






// function enterKey(e) {
//   if (e.keyCode == 13){
//     new WinBox("Basic Window");
//   console.log("hi");
//   }
// }

// function enterKey(e) {
//   if (e.keyCode == 88){
//     new WinBox("Custom Border", {
//       border: "0.3em"
//     });
//   console.log("hi");
//   }
// }

