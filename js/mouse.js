
function getMousePos(canvas, evt) {
    var rect = canvas.getBoundingClientRect(), // abs. size of element
        scaleX = canvas.width / rect.width,    // relationship bitmap vs. element for X
        scaleY = canvas.height / rect.height;  // relationship bitmap vs. element for Y

    return {
        x: (evt.clientX - rect.left) * scaleX,   // scale mouse coordinates after they have
        y: (evt.clientY - rect.top) * scaleY     // been adjusted to be relative to element
    }
}


//can only draw when mouse is pressed
function mouseStatus(res, e) {
    let mousePos = getMousePos(canvas,e)
    if (res == 'down') {
        flag = true;
        draw(mousePos.x,mousePos.y);
    }
    if (res == 'up' || res == "out") {
        flag = false;
    }
    if (res == 'move') {
        if (flag) {
            draw(mousePos.x,mousePos.y);
        }
    }
}