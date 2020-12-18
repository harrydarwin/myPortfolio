const myApp = {}


myApp.noneActive = () => {
    $('.dot').removeClass('active');
}

myApp.shortenText = () => {
    if ($(window).width() <= 940) {
        $('.summary').empty();

        const summaryList = `
        <details>
            <summary>Click for details</summary>
            <ul>
                <li>Web Development Bootcamp - Juno College</li>
                <li>Web Developement & Javascript 101 - Juno College</li>
                <li>SQL Bootcamp - Udemy</li>
                <li>Agile Methodologies/Project Delivery Course - Udemy</li>
                <li>Scrum Master Course & Certificate - Scrum.org</li>
                <li>Lean Six Sigma Green Belt (process improvement) - McGill University</li>
            </ul>
        </details>
        `
        $('.summary').append(summaryList);
    }
}


myApp.imageShift = () => {
    const imageOne = `./assets/me1.jpeg`;
    const imageTwo = `./assets/me2.jpeg`;
    const imageThree = `./assets/me3.jpeg`;
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

myApp.calcSectionBottom = (id) => {
    const top = document.getElementById(id).offsetTop;
    const height = document.getElementById(id).offsetHeight;
    return top + height;
}

myApp.scrollBar = () => {
    window.addEventListener('scroll', function() {
        const homeBot = myApp.calcSectionBottom('home');
        const aboutBot = myApp.calcSectionBottom('about');
        const projectsBot = myApp.calcSectionBottom('projects');
        const skillsBot = myApp.calcSectionBottom('skills');

        if (window.scrollY >= 0) {
            myApp.noneActive();
            $('a[data-page=home]').addClass('active');
        }
        if (window.scrollY >= homeBot - 100) {
            myApp.noneActive();
            $('a[data-page=about]').addClass('active');
        }
        if (window.scrollY >= aboutBot - 100) {
            myApp.noneActive();
            $('a[data-page=projects]').addClass('active');
        }
        if (window.scrollY >= projectsBot - 100) {
            myApp.noneActive();
            $('a[data-page=skills]').addClass('active');
        }
        if (window.scrollY >= skillsBot - 100) {
            myApp.noneActive();
            $('a[data-page=contact]').addClass('active');
        }
        
    })
}
myApp.isDarkMode = false;

myApp.darkMode = () => {
    myApp.isDarkMode = !myApp.isDarkMode;
    console.log(myApp.isDarkMode);

    $('body').toggleClass('darkMode');
    $('div.line').toggleClass('darkLine');
    $('input').toggleClass('emailLight');
    $('textarea').toggleClass('emailLight');
    $('.meeting').toggleClass('lightButton');


    
    if (myApp.isDarkMode === true) {
        $(".scrum").attr("src", "./assets/scrumLight.png");
        $(".sigma").attr("src", "./assets/sixSigmaLight.png");
        $(".hipsterApp").attr("src", "./assets/hipAppDark.jpg");
        $(".collegeNav").attr("src", "./assets/collegeNavigatorDark.jpg");
        $(".beero").attr("src", "./assets/beerOmaticDark.jpg");
    } else {
        $(".scrum").attr("src", "./assets/scrum.png");
        $(".sigma").attr("src", "./assets/sixSigma.png");
        $(".hipsterApp").attr("src", "./assets/hipApp.jpg");
        $(".collegeNav").attr("src", "./assets/collegeNavigator.jpg");
        $(".beero").attr("src", "./assets/beerOmatic.jpg");
    }


    if ($(window).width() <= 940) {
        $('.topNav').toggleClass('darkBackground');
    }
}


myApp.init = () => {
    // scroll down fade up plugin
    AOS.init({
        easing: 'ease-in-quad',
    });

    myApp.scrollBar();

    myApp.shortenText();

    myApp.imageShift();
    

    $('.lightSwitch').on('click', function() {
        myApp.darkMode(); 
    })

 
}


  $(document).ready(function() {
    myApp.init();
  });