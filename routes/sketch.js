const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
require('dotenv').config();
var fs = require('fs');
const User = require('../models/users.model')


module.exports = function (router, upload, gfs) {
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

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/users/login');
  }

  //to test if backend api is working
  router.route('/ok').get(ensureAuthenticated, (req, res) => {
    res.send(Date().toString().substring(0, 16));
  })

  router.get('/home/:id', ensureAuthenticated, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
      if (err) {
        res.render('404')
      } else {
        if (!foundUser || foundUser.length === 0) {
          res.render('404')
        } else {
          res.render('index')
        }
      }
    })
  })


  router.get('/game/:id', ensureAuthenticated, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
      if (err) {
        res.render('404')
      } else {
        if (!foundUser || foundUser.length === 0) {
          res.render('404')
        } else {
          res.render('game')
        }
      }
    })
  })


  // @route POST /upload
  // @desc  Uploads image file to DB
  router.post('/done-drawing/:tile', ensureAuthenticated, upload.single('userDrawing'), (req, res) => {

    res.send(req.file)
  })

  // @route POST /upload
  // @desc  Uploads ejs board file to DB
  // router.post('/send-board', ensureAuthenticated, uploadboard.single('index'), (req, res) => {

  //   // console.log(req.file)
  //   // console.log(req.params.tile)
  //   res.send(req.file)
  // })

  // @route GET /files
  // @desc Display all files in JSON
  // backend api to see files in database
  router.get('/:id/files', ensureAuthenticated, (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
      if (err) {
        res.render('404')
      } else {
        if (!foundUser || foundUser.length === 0) {
          res.render('404')
        } else {
          gfs.files.find().toArray((err, files) => {
            // Check if files
            if (!files || files.length === 0) {
              return res.status(404).json({
                exist: false
              });
            }

            // Files exist
            files.forEach(file => {
              file.exist = true
              file.filenum = file.filename.match(/(\d+)/)[0]
            })
            return res.json(files);
          });
        }
      }
    })
  })


  // @route GET /file:filename
  // @desc Display a file by its file name
  // backend api to see a file with a file name in database
  router.get('/:id/files/:filename', ensureAuthenticated, (req, res) => {
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
  router.get('/:id/images/:filename', ensureAuthenticated, (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file exsits
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: `No file with name ${req.params.filename} exists.`
        });
      } else {
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
      }
    })
  })

  //checks if there is a drawing in the tile
  router.get('/:id/images/exist/:filename', ensureAuthenticated, (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      // Check if file exsits
      if (!file || file.length === 0) {
        return res.json({ exist: false })
      } else {
        //check if image 
        if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
          return res.json({ exist: true })
        }
      }
    })
  })

  router.get('/:id/images/view/:filename', ensureAuthenticated, (req, res) => {
    let imgUrl = `/${req.params.id}/images/${req.params.filename}`
    res.render('drawings.ejs', {
      url: imgUrl,
      tileNum: parseInt(req.params.filename.split('-')[1]) + 1
    })
  })

  router.get('/api/userid', function (req, res) {
    //user is not logged in
    if (req.user === undefined) {
      res.json({});
    } else {
      res.json({
        id: req.user.id
      });
    }
  });

}