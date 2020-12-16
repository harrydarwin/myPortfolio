const myApp = {}


myApp.noneActive = () => {
    $('.dot').removeClass('active');
}

myApp.imageShift = () => {
    const imageOne = `./assets/me1.jpeg`;
    const imageTwo = `./assets/me2.jpeg`;
    const imageThree = `./assets/me3.png`;
    const images = [imageOne, imageTwo, imageThree];
    const display = $('.headShot');
    let i = 0;
    display.on('click', function() {
        if (i === images.length - 1) {
            i = 0
        }
        else {
            i = i + 1;
        }
        display.attr("src", images[i]);
    })
}

myApp.scrollBar = () => {
    window.addEventListener('scroll', function() {
        const about = document.getElementById('about').offsetTop;
        const projects = document.getElementById('projects').offsetTop;
        const skills = document.getElementById('skills').offsetTop;
        const contact = document.getElementById('contact').offsetTop;
        if (window.scrollY >= 0) {
            myApp.noneActive();
            $('a[data-page=home]').addClass('active');
        }
        if (window.scrollY >= about) {
            myApp.noneActive();
            $('a[data-page=about]').addClass('active');
        }
        if (window.scrollY >= projects) {
            myApp.noneActive();
            $('a[data-page=projects]').addClass('active');
        }
        if (window.scrollY >= skills) {
            myApp.noneActive();
            $('a[data-page=skills]').addClass('active');
        }
        if (window.scrollY >= contact) {
            myApp.noneActive();
            $('a[data-page=contact]').addClass('active');
        }
        
    })
}


myApp.init = () => {
    // scroll down fade up plugin
    AOS.init({
        easing: 'ease-in-quad',
    });

    myApp.scrollBar();
    myApp.imageShift();
    $('.lightSwitch').on('click', function() {
        $('body').toggleClass('darkMode');
        $('div.line').toggleClass('darkLine');
        $(".scrum").attr("src", "./assets/scrumLight.png");
        $(".sigma").attr("src", "./assets/sixSigmaLight.png");
        $('input').toggleClass('emailLight');
        $('textarea').toggleClass('emailLight');
        $('.meeting').toggleClass('lightButton');
    })

 
}


  $(document).ready(function() {
    myApp.init();
  });