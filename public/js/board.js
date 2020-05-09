const game_div = document.querySelector('.game');
const tiles = 16; //num of tiles
const rows = tiles / 4;
const cols = tiles / 4;
const clear_all_btn = document.querySelector('#clear-all');
const log_out_btn = document.querySelector('#logout')

function isMobile() {
    if (!mobileAlertOnce && typeof window.orientation !== 'undefined') {
        alert("Doodle world is not yet fully optimized for mobile (but it does work). For a optimal doodle experience check us out on a desktop!")
    }
}

(async function setup() {

    setUpBoard()
    setUpTiles();
    setUpTileSketches();
    setUpBtns();
    // isMobile();
}());

async function setUpBoard() {
    let redirect;
    let game_tile;
    for (let i = 0; i < tiles; i++) {
        game_tile = document.createElement('div');
        game_tile.setAttribute('id', `tile-${i}`)
        redirect = document.createElement('a');
        redirect.setAttribute('id', `ref-tile-${i}`)
        redirect.appendChild(game_tile)
        game_div.appendChild(redirect)

    }
}

function setUpTiles() {

    for (let i = 0; i < tiles; i++) {
        document.getElementById(`tile-${i}`).addEventListener('click', (e) => {
            //save to the session storage for access in save of drawing
            sessionStorage.setItem('tilenum', i)
        })
    }

}

// print all the drawing in database onto the board
async function setUpTileSketches() {

    // must get this reponse before we continue as other code is dependent on it so this blocks it before continuing
    try {
        let response1 = await axios.get('/api/userid')
        // let response2 = await axios.get(`/${response1.data.id}/files`)
        for (let i = 0; i < tiles; i++) {
            axios.get(`/${response1.data.id}/images/exist/tile-${i}.png`)
                .then(response => {
                    if (response.data.exist) {
                        let img = document.createElement('img')
                        axios.get(`/${response1.data.id}/images/tile-${i}.png`)
                            .then(response => {
                                img.src = `images/tile-${i}.png`
                            })
                            .catch(err => 'Error has occured:' + err)
                        let tile = document.querySelector(`#tile-${i}`);
                        tile.classList.add('after-img-div')
                        tile.appendChild(img);
                        //remove the ref to the game
                        // this makes sure that the board cannot be edited when there is already a drawing in place
                        document.querySelector(`#ref-tile-${i}`).setAttribute('href', `/${response1.data.id}/images/view/tile-${i}.png`)
                    } else {
                        document.querySelector(`#ref-tile-${i}`).setAttribute('href', `/game/${response1.data.id}`)
                    }
                })
                .catch(err => "Error:" + err)
        }
    } catch (err) {
        window.location.href = window.location.href.toString() + '/404'
        console.log("An error has occured: " + err)
    }
}

function setUpBtns() {


    set_clear_all();
    set_logout();

}

function set_clear_all() {
    clear_all_btn.addEventListener('click', () => {
        var pass = prompt("Please enter your account password to clear the board.")
        axios.post('/users/clear-board', { password: pass })
            .then(response => {
                if (response.data === "Database cleared!") {
                    window.location.reload()
                } else {
                    alert("Wrong password! Unable to clear the board.")
                }
            })
            .catch(err => "Error: " + err)
    })
}

function set_logout() {

    log_out_btn.addEventListener('click', () => {
        let redirectUrl = window.location.href.toString();
        redirectUrl = redirectUrl.split("home")[0] + "users/logout"
        let redirect = document.createElement('a');
        redirect.setAttribute('href', redirectUrl);
        redirect.click();
    })

}