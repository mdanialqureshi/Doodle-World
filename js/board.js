const game_div = document.querySelector('.game');
const tiles = 16; //num of tiles
const rows = tiles / 4;
const cols = tiles / 4;



(function setup() {

    setUpBoard();
    setUpTiles();
    setUpTileSketches();

}());

function setUpBoard() {
    let redirect;
    let game_tile;
    for (let i = 0; i < tiles; i++) {
        game_tile = document.createElement('div');
        game_tile.setAttribute('id', `tile-${i}`)
        redirect = document.createElement('a');
        redirect.setAttribute('href', './game.html')
        redirect.appendChild(game_tile)
        game_div.appendChild(redirect)
    }
}

function setUpTiles() {

    for (let i = 0; i < tiles; i++) {
        document.getElementById(`tile-${i}`).addEventListener('click', (e) => {
            // console.log(i);
            //save to the session storage for access in save of drawing
            sessionStorage.setItem('tilenum', i)
            // send to data base about while tile we are in
            axios.post('/ingame/' + i)
                .then(response => console.log(response.data))
                .catch((error) => console.log(error))
        })
    }

}


// print all the drawing in database onto the board
function setUpTileSketches() {

    for (let i = 0; i < tiles; i++) {
        axios.get(`/images/exist/tile-${i}.png`)
            .then(response => {
                if (response.data.exist) {
                    let img = document.createElement('img')
                    axios.get(`/images/tile-${i}.png`)
                        .then(response => {
                            img.src = `images/tile-${i}.png`
                        })
                        .catch(err => 'Error has occured:' + err)
                    let tile = document.querySelector(`#tile-${i}`);
                    tile.classList.add('after-img-div')
                    tile.appendChild(img);
                } else {
                    // console.log("no" + i)
                }
            })
            .catch(err => "Error:" + err)
    }
}
