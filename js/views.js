const back_btn = document.querySelector('#back-btn')

console.log(window.location.href)

    function setUp() {
        back_btn.addEventListener('click', () => {  
            goBack();
        });
    };

    setUp();

    var ret = "data-123".replace(/data-/g,'');

    http://localhost:4000/images/view/tile-0.png


    function goBack(){

        let redirectUrl = window.location.href.toString();
        redirectUrl = redirectUrl.replace('images/view/','')
        redirectUrl = redirectUrl.replace(/tile-\d+/,'')
        // redirectUrl = redirectUrl.replace(/[0-9]/g, "")
        //rid of .png
        redirectUrl = redirectUrl.substring(0,redirectUrl.length-4)
        redirectUrl = redirectUrl +'index.html'
        let redirect = document.createElement('a');
        redirect.setAttribute('href', redirectUrl);
        redirect.click();
    }