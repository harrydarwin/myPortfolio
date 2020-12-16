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

    $('.fadeIn img:gt(0)').hide();
    $(".fadeIn").hover(function () {
        timer = setInterval(function () {
            $('.fadeIn :first-child').hide()
            .next('img').fadeIn()
            .end().appendTo('.fadeIn');
        },
            2000);
    }, function () {
        clearInterval(timer);
    });
// if ($('.headShot').attr("src") === "./assets/me1.jpeg") {
//     setTimeout( function() {
//         $('.headShot').attr({ "src": "./assets/me2.jpeg", "alt": "Harry holding glasses" })
//       }, 3000);   
//     setTimeout(function () {
//         $('.headShot').attr({ "src": "./assets/me3.png", "alt": "Harry wearing glasses" })
//     }, 3000);
// }
    
    // $('.headShot').hover(function() {
    //     console.log('hovering');
    //     $(this).attr({ "src": "./assets/me2.jpeg", "alt": "Harry holding glasses" });
    //     setTimeout(function() {
    //         $(this).attr({"src": "./assets/me3.png", "alt": "Harry with glasses on"});
    //     }, 3000);

    // })

    
}


  $(document).ready(function() {
    myApp.init();
  });