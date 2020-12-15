const myApp = {}

myApp.init = () => {
    // scroll down fade up plugin
    AOS.init({
        easing: 'ease-in-quad',
    });

    $('.lightSwitch').on('click', function() {
        console.log("we clicked");
        $('body').toggleClass('darkMode');
        $('div.line').toggleClass('darkLine');
        $(".scrum").attr("src", "./assets/scrumLight.png");
        $(".sigma").attr("src", "./assets/sixSigmaLight.png");

    })
}




  $(document).ready(function() {
    myApp.init();
  });