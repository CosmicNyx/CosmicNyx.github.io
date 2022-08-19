// const about = document.querySelector('#about')
// const aboutContent = document.querySelector('#about-content')
// const contactContent = document.querySelector('#contact-content')

window.addEventListener("keyup", enterKey);

//thing before the . is the name of the li id in the HTML 

hi.addEventListener('click', () => {
  const aboutBox = new WinBox({
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


function enterKey(e) {
  if (e.keyCode == 13){
    new WinBox("Basic Window");
  console.log("hi");
  }
}


