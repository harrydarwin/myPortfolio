const myApp = {}

//removes active class from all sideNav dots 
myApp.noneActive = () => {
    $('.dot').removeClass('active');
}

//Change courses & certs list into a summary element on page load with a width of 940 or lower to save space and keep layout optimal
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

//click about me image and iterate through 3 pictures in an array
myApp.imageShift = () => {
    const imageOne = `./assets/me1.jpeg`;
    const imageTwo = `./assets/me2.jpeg`;
    const imageThree = `./assets/me3.jpeg`;
    const images = [imageOne, imageTwo, imageThree];
    const display = $('.headShot');
    let i = 0;
    display.on('mouseover', function() {
        if (i === images.length - 1) {
            i = 0
        }
        else {
            i = i + 1;
        }
        display.attr("src", images[i]);
    })
}

//calculates the bottom point of the input element ID in this case for each section
myApp.calcSectionBottom = (id) => {
    const top = document.getElementById(id).offsetTop;
    const height = document.getElementById(id).offsetHeight;
    return top + height;
}

//use above function to calculate bottom of each section and have the side dotNav change the active class to the correct section with 100px of safety net to ensure proper changeover 
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

//setup boolean for darkmode 
myApp.isDarkMode = false;

//darkmode function to change body background to black and all text etc white 
myApp.darkMode = () => {
    //change boolean when function is run
    myApp.isDarkMode = !myApp.isDarkMode;
    //toggle darkmode class for dark backing and light elements
    $('body').toggleClass('darkMode');
    $('div.line').toggleClass('darkLine');
    $('input').toggleClass('emailLight');
    $('textarea').toggleClass('emailLight');
    $('.meeting').toggleClass('lightButton');


    //conditional on darkmode boolean to change the image elements to darkmode versions with dark background and light image and vise versa for light mode
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

    //when burger menu is present, change its background to fit darkmode also 
    if ($(window).width() <= 940) {
        $('.topNav').toggleClass('darkBackground');
    }
}


//initialize function containing everything I need to run functionality on the page
myApp.init = () => {
    // scroll down fade up plugin from https://michalsnik.github.io/aos/
    AOS.init({
        easing: 'ease-in-quad',
    });

    myApp.scrollBar();

    myApp.shortenText();

    myApp.imageShift();
    
    //on darkode button click, activate darkmode function
    $('.lightSwitch').on('click', function() {
        myApp.darkMode(); 
    })
}

//doc ready baby 
  $(document).ready(function() {
    myApp.init();
  });