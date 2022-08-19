// const about = document.querySelector('#about')
// const aboutContent = document.querySelector('#about-content')
// const contactContent = document.querySelector('#contact-content')

// window.addEventListener("keyup", enterKey);

//thing before the . is the name of the li id in the HTML 

hi.addEventListener('click', () => {
  new WinBox({
    title: 'win1',
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


hihi.addEventListener('click', () => {
  new WinBox({
    title: 'win2',
    // modal: true,
    width: '400px',
    height: '400px',
    top: 150,
    right: 50,
    bottom: 50,
    left: 250,
    mount: document.querySelector('#win2'),


    onfocus: function () {
      this.setBackground('#00aa00')
    },
    onblur: function () {
      this.setBackground('#777')
    },
  })
})



// -------------------

const template = document.createElement("div");
    template.innerHTML = `
    <div class=wb-header>
        <div class=wb-icon>
            <span class=wb-custom></span>
            <span class=wb-close></span>
        </div>
        <div class=wb-drag>
            <div class=wb-title></div>
        </div>
    </div>
    <div class=wb-body></div>`;

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
    

    new WinBox("Custom Template", { template });
    console.log("no");
  }



  //window wherver u want it...im so happy rn

  if (event.keyCode == 67) {
    new WinBox({
      title: "Custom Position / Size",
      x: "center",
      y: 67,
      width: 400,
      height: 400,
      //and it cant resize... bruh im so happy
      class: [ "no-resize"]
    });
    console.log("no");
  }




  //-------------coords----//

  if (event.keyCode == 13) {
    new WinBox({
      // configuration:
      index: 1,
      id: "my-window",
      root: document.body,
      class: ["no-full", "no-max", "my-theme"],

      // appearance:
      title: "All Options",
      background: "#fff",
      border: 4,
      header: 45,
      icon: false,

      // initial state:
      modal: false,
      max: false,
      min: false,
      hidden: false,

      // dimension:
      width: 400,
      height: 225,
      minheight: 55,
      minwidth: 100,
      maxheight: 300,
      maxwidth: 500,
      autosize: true,

      // position:
      x: "center",
      y: "center",


      // contents (choose from):
      url: false,
      mount: false,
      html: "width: 250, height: 200",

      // callbacks:
      oncreate: function (options) {
        options.icon = "demo/wikipedia.svg"
      },
      onshow: function () {
        console.log("Show:", this.id);
      },
      onhide: function () {
        console.log("Hide:", this.id);
      },
      onfocus: function () {
        this.setBackground("#fff");
      },
      onblur: function () {
        this.setBackground("#999");
      },
      onresize: function (w, h) {
        this.body.textContent =
          `width: ${w}, height: ${h}`;
      },
      onmove: function (x, y) {
        this.body.textContent =
          `x: ${x}, y: ${y}`;
      },
      onclose: function (force) {
        return !confirm("Close window?");
      },
      onfullscreen: function () {
        console.log("Fullscreen:", this.id);
      },
      onmaximize: function () {
        console.log("Maximize:", this.id);
      },
      onminimize: function () {
        console.log("Minimize:", this.id);
      },
      onrestore: function () {
        console.log("Restore:", this.id);
      }
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

