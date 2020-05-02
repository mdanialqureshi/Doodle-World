//canvas
const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');
let scale = 5; //pixles per box
const width = canvas.width
const height = canvas.height
const cols = width / scale;
const rows = height / scale;
let flag = false;
let default_color = 'black'
let paint_color = 'blue';
const clear_btn = document.querySelector('#clear');
const save_btn = document.querySelector('#save');
const exit_btn = document.querySelector('#exit');
const paint_menu = document.querySelector('.paint-menu')
const paint_menu_options = document.querySelector('.paint-menu-options')
const eraser_img = document.querySelector('#eraser');
const color_picker = document.getElementById('color-picker')
const brush_img = document.querySelector('#brush')
let menuOpen = false;

(function setup() {

    setUpCanvas();
    setUpButtons();
    setUpPaintMenu();

}());

function setUpPaintMenu() {
    paint_menu.addEventListener('click', () => {
        if (!menuOpen) {
            paint_menu.classList.add('open');
            menuOpen = true;
            paint_menu_options.classList.toggle('paint-menu-options-open')
        } else {
            paint_menu.classList.remove('open');
            paint_menu_options.classList.toggle('paint-menu-options-open')
            menuOpen = false;
        }
    })

    eraser_img.addEventListener('click', () => {
        enable_eraser();
    })

    brush_img.addEventListener('click', () => {
        enable_brush();
    })

    setUpColorPicker();
}

var pickr;

function setUpColorPicker() {

    pickr = Pickr.create({
        el: '.color-picker',
        theme: 'classic', // or 'monolith', or 'nano'

        // swatches: [
        //     'rgba(244, 67, 54, 1)',
        //     'rgba(233, 30, 99, 0.95)',
        //     'rgba(156, 39, 176, 0.9)',
        //     'rgba(103, 58, 183, 0.85)',
        //     'rgba(63, 81, 181, 0.8)',
        //     'rgba(33, 150, 243, 0.75)',
        //     'rgba(3, 169, 244, 0.7)',
        //     'rgba(0, 188, 212, 0.7)',
        //     'rgba(0, 150, 136, 0.75)',
        //     'rgba(76, 175, 80, 0.8)',
        //     'rgba(139, 195, 74, 0.85)',
        //     'rgba(205, 220, 57, 0.9)',
        //     'rgba(255, 235, 59, 0.95)',
        //     'rgba(255, 193, 7, 1)'
        // ],
        components: {

            // Main components
            preview: true,
            opacity: true,
            hue: true,

            // Input / output Options
            interaction: {
                hex: true,
                rgba: true,
                input: true,
            }
        }
    });
    pickr.on('init', instance => {
        pickr.setColor(default_color)
    }).on('change', (color, instance) => {
        pickr.applyColor(color)
        paint_color = color.toRGBA().toString();
        scale = 5;
    });
}

function setUpCanvas() {
    canvas.addEventListener("mousemove", function (e) {
        mouseStatus('move', e)
    }, false);
    canvas.addEventListener("mousedown", function (e) {
        mouseStatus('down', e)
    }, false);
    canvas.addEventListener("mouseup", function (e) {
        mouseStatus('up', e)
    }, false);
    canvas.addEventListener("mouseout", function (e) {
        mouseStatus('out', e)
    }, false);
}

function setUpButtons() {
    clear_btn.addEventListener('click', () => {
        clear();
    })

    save_btn.addEventListener('click', () => {
        save();
    })

    exit_btn.addEventListener('click', () => {
        exit();
    })
}

function exit() {

    let redirect = document.createElement('a');
    redirect.setAttribute('href', 'index.html');
    redirect.click();
}

function clear() {
    let sure = confirm("Are you sure you want to clear canvas?")
    if (sure) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        paint_color = default_color;
        scale = 5;
        pickr.setColor(default_color)
    }
}

function save() {

    if (confirm('Are you sure you want to save your drawing? You only get to save once, and you will no longer be able to edit your masterpiece.')) {
        // Save it!
        let currentTile = sessionStorage.getItem('tilenum')
        axios({
            method: 'get',
            url: `/images/exist/tile-${currentTile}.png`,
        })
            .then(response => {
                // if there is not an entry in the db for this tile then it can be saved to the db.
                if (!response.data.exist) {
                    canvas.toBlob(function (blob) {
                        const formData = new FormData();
                        formData.append('userDrawing', blob, `tile-${currentTile}.png`);
                        // Post via axios or other transport method
                        axios.post('/done-drawing/' + currentTile, formData)
                            .then((res) => console.log("Success! Image has been saved"))
                            .catch((err) => console.log('err' + err))
                    });
                    //user has saved so clear the canvas for safe measure and exit to the homepage
                    // clear();
                }
                // exit regardless of if there is alrdy an entry in the db or not
                // wait a bit before exiting so pic has tome to get to db and render on index.html page
                setTimeout(() => {
                    exit()
                }, 800)
            })
            .catch(err => "Error" + err)
    } else {
        // Do nothing!
    }
}

function draw(x, y) {
    ctx.fillStyle = paint_color;
    ctx.fillRect(x, y, scale, scale);
}

function enable_brush() {
    paint_color = 'black';
    scale = 5;
}

function enable_eraser() {
    paint_color = "white";
    scale = 20;
}

