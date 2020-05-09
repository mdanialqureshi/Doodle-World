const back_btn = document.querySelector('#back-btn')

function setUp() {
    back_btn.addEventListener('click', () => {
        goBack();
    });
};

setUp();

function goBack() {

    redirectUrl = window.location.href.toString();
    axios.get('/api/userid')
        .then(response => {
            redirectUrl = redirectUrl.split(`${response.data.id}`)[0] + "home/"
            axios.get('/api/userid')
                .then(res => {
                    redirectUrl = redirectUrl + res.data.id;
                    let redirect = document.createElement('a');
                    redirect.setAttribute('href', redirectUrl);
                    redirect.click();
                })
                .catch(err => "Error" + err)
        })
        .catch(err => "Error" + err)
}