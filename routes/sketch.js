module.exports = function (app, router, upload, gfs) {
  // let Sketch = require('./models/sketch.model')
  // var upload = multer({ storage: storage });
  // router.post('/ingame/:tile', (req, res) => {
  //     const tilenum = Number(req.params.tile)
  //     let tile_entry = new Sketch({
  //         tilenum: tilenum
  //     })
  //     tile_entry.save()
  //         .then((data) => res.json(`tile num ${req.params.tile} sent!`))
  //         .catch((err) => res.status(400).json("Error: " + err))
  // })

  //to test if backend api is working
  router.route('/ok').get((req, res) => {
    res.send(Date().toString().substring(0, 16));
  })


  // @route POST /upload
  // @desc  Uploads file to DB
  router.post('/done-drawing/:tile', upload.single('userDrawing'), (req, res) => {

    // console.log(req.file)
    // console.log(req.params.tile)
    res.send(req.file)
  })

  // @route GET /files
  // @desc Display all files in JSON
  // backend api to see files in database
  router.get('/files', (req, res) => {
    gfs.files.find().toArray((err, files) => {
      // Check if files
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: 'No files exist'
        });
      }

      // Files exist
      return res.json(files);
    });
  })


  // @route GET /file:filename
  // @desc Display a file by its file name
  // backend api to see a file with a file name in database
  router.get('/files/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file exsits
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: `No file with name ${req.params.filename} exists.`
        });
      }
      // Files exist
      return res.json(file);
    })
  })

  // @route GET /image:filename
  // @desc Display an image from the database
  // backend api call to display an image
  router.get('/images/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file exsits
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: `No file with name ${req.params.filename} exists.`
        });
      }
      //check if image 
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        // Read output to browser
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    })
  })

  //checks if there is a drawing in the tile
  router.get('/images/exist/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file exsits
      if (!file || file.length === 0) {
        return res.json({ exist: false })
      }
      //check if image 
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        return res.json({ exist: true })
      }
    })
  })

  router.get('/images/view/:filename', (req, res) => {
      let imgUrl = `/images/${req.params.filename}`
      res.render('drawings.ejs', {
        url: imgUrl,
        tileNum: parseInt(req.params.filename.toString().charAt(5)) + 1
      })
  })

}