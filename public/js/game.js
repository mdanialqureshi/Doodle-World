//canvas
const canvas = document.querySelector('.canvas');
const ctx = canvas.getContext('2d');
let userLineWidth = 5; //width of drawing line
const width = canvas.width
const height = canvas.height
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
var $slider_label = $('.slider-container #slider-label')
const draw_slider_msg = "Paint Brush Size:";
const eraser_slider_msg = "Eraser Size:"
const log_out_btn = document.querySelector('#logout')

//hold old coordiates of mouse position
var xSrc, ySrc;

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
        theme: 'monolith', // or 'monolith', or 'nano'
        position: 'left',
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
        userLineWidth = $slider.val();
        $slider_label.html(draw_slider_msg)
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
    //touch screen support
    canvas.addEventListener('touchstart', sketchpad_touchStart, false);
    canvas.addEventListener('touchmove', sketchpad_touchMove, false);
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

    log_out_btn.addEventListener('click', () => {
        logout_game();
    })
}

function exit() {

    // let redirect = document.createElement('a');
    // redirect.setAttribute('href', 'index.html');
    // redirect.click();
    let redirectUrl = window.location.href.toString();
    redirectUrl = redirectUrl.split("game")[0] + "home/"
    axios.get('/api/userid')
        .then(res => {
            redirectUrl = redirectUrl + res.data.id;
            let redirect = document.createElement('a');
            redirect.setAttribute('href', redirectUrl);
            redirect.click();
        })
        .catch(err => "Error" + err)
}

function clear() {
    let sure = confirm("Are you sure you want to clear canvas?")
    if (sure) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        paint_color = default_color;
        userLineWidth = $slider.val();
        pickr.setColor(default_color)
    }
}

function save() {

    if (confirm('Are you sure you want to save your drawing? You only get to save once, and you will no longer be able to edit your masterpiece.')) {
        // Save it!
        let currentTile = sessionStorage.getItem('tilenum')
        axios.get('/api/userid')
            .then(res1 => {
                axios({
                    method: 'get',
                    url: `/${res1.data.id}/images/exist/tile-${currentTile}.png`,
                })
                    .then(response => {
                        // if there is not an entry in the db for this tile then it can be saved to the db.
                        if (!response.data.exist) {
                            canvas.toBlob(function (blob) {
                                const formData = new FormData();
                                formData.append('userDrawing', blob, `tile-${currentTile}.png`);
                                // Post via axios or other transport method
                                axios.post('/done-drawing/' + currentTile, formData)
                                    .then((res) => { })
                                    .catch((err) => console.log('err' + err))
                            });
                            //user has saved so clear the canvas for safe measure and exit to the homepage
                            // clear();
                        }
                        // exit regardless of if there is alrdy an entry in the db or not
                        // wait a bit before exiting so pic has tome to get to db and render on index.html page
                        setTimeout(() => {
                            exit()
                        }, 650)
                    })
                    .catch(err => "Error" + err)
            })
            .catch(err => "Error" + err)
    } else {
        // Do nothing!
    }
}

function draw(x, y, e) {

    ctx.beginPath();
    ctx.moveTo(xSrc, ySrc);
    ctx.lineCap = 'round';
    ctx.lineWidth = userLineWidth;
    ctx.lineTo(x, y);
    ctx.strokeStyle = paint_color;
    ctx.stroke();
    xSrc = x;
    ySrc = y;


    //     ctx.fillStyle = paint_color;
    //     ctx.fillRect(x, y, userLineWidth, userLineWidth);
}

function enable_brush() {
    paint_color = pickr._color.toRGBA();
    userLineWidth = $slider.val();
    $slider_label.html(draw_slider_msg)
}

function enable_eraser() {
    paint_color = "white";
    userLineWidth = $slider.val();
    $slider_label.html(eraser_slider_msg)
}


//touch support 
// Define some variables to keep track of the touch position
var touchX, touchY;

function sketchpad_touchStart() {
    getTouchPos();
    xSrc = touchX;
    ySrc = touchY;
    draw(touchX, touchY, 12);
    // Prevents an additional mousedown event being triggered
    event.preventDefault();
}

function sketchpad_touchMove(e) {
    // Update the touch co-ordinates
    getTouchPos(e);

    // During a touchmove event, unlike a mousemove event, we don't need to check if the touch is engaged, since there will always be contact with the screen by definition.
    draw(touchX, touchY, 12);

    // Prevent a scrolling action as a result of this touchmove triggering.
    event.preventDefault();
}

// Get the touch position relative to the top-left of the canvas
// When we get the raw values of pageX and pageY below, they take into account the scrolling on the page
// but not the position relative to our target div. We'll adjust them using "target.offsetLeft" and
// "target.offsetTop" to get the correct values in relation to the top left of the canvas.
function getTouchPos(e) {
    if (!e)
        var e = event;

    if (e.touches) {
        if (e.touches.length == 1) { // Only deal with one finger
            var touch = e.touches[0]; // Get the information for finger #1
            touchX = touch.pageX - touch.target.offsetLeft;
            touchY = touch.pageY - touch.target.offsetTop;
            //offet according to canvas
            var rect = canvas.getBoundingClientRect()
            touchX = (touchX - rect.left)
            touchY = (touchY - rect.top)
        }
    }
}

//jquery for slider for brush and eraser size
var $slider = $("#brush-size")
var $fill = $(".bar .fill");

function setBar() {
    $fill.css("width", (($slider.val() / 25) * 100 - 1.88) + "%")
    userLineWidth = $slider.val();
}
//initally fill the slider bar
setBar();
$slider.on("input", setBar);

function logout_game() {
    let redirectUrl = window.location.href.toString();
    redirectUrl = redirectUrl.split('game')[0] + 'users/logout'
    let redirect = document.createElement('a');
    redirect.setAttribute('href', redirectUrl);
    redirect.click();
}
