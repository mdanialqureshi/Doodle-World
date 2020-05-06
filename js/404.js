
(function setup() {
    set_logout();
}());

function set_logout() {

    var getUrl = window.location;
    var baseUrl = getUrl.protocol + "//" + getUrl.host + "/"
    document.querySelector('#logout').addEventListener('click', () => {
        let redirectUrl = baseUrl.toString()
        redirectUrl = redirectUrl + 'users/logout'
        let redirect = document.createElement('a');
        redirect.setAttribute('href', redirectUrl);
        redirect.click();
    })
}
