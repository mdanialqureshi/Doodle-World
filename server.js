const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage')
const Grid = require('gridfs-stream')
const methodOverride = require('method-override')
const crypto = require('crypto');
//so we have have environment variables in .env file
require('dotenv').config();

const port = process.env.PORT || 4000;
//middleware, send json data
app.use(cors());
//parse json in server so we dont need middleware like body-parser
app.use(express.json());

//set the view engine otherwise known as the template engine
// by deafult it will look in a view folder so need to create 
// that, This view engine is only for rendering already draw images
app.set('view engine', 'ejs');

//static files 
app.use('/css', express.static('css'))
app.use('/js', express.static('js'))
//this will load a index.html file by deafult
app.use('/', express.static('html'))
app.use('/images', express.static('images'))

//use a query string for delete request
app.use(methodOverride('_method'))

const uri = process.env.DOODLEDB;
mongoose.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true })
const connection = mongoose.connection;

//init gfs
let gfs;

connection.once('open', () => {
    console.log("MongoDB database connection is established successfully")
    //init stream for photo upload
    gfs = Grid(connection.db, mongoose.mongo);

    gfs.collection('uploads');
    launchServer(); //launch server only after the database is setup
})

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.DOODLEDB,
    options: { useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
                if (err) {
                    return reject(err);
                }
                const filename = file.originalname;
                //bucket name must match the collection name
                const fileInfo = {
                    filename: filename,
                    bucketName: 'uploads'
                };
                resolve(fileInfo);
            });
        });
    }
});
const upload = multer({ storage });

const router = express.Router();

app.use('/', router);

var sketch = require('./routes/sketch')

function launchServer() {
    const server = app.listen(port, () => {
        console.log(`Server is lisenting on port ${port}`);
    })
    sketch(app, router, upload, gfs) //initalize the sketch routes and queries only once the db and server are launched
}

app.post('/clear-board', (req, res) => {

    //cant clear board unless password is right
    if (req.body.password === process.env.CLR_PASS) {

        mongoose.connection.db.dropCollection('uploads.files', (err, result) => {
            if (err) throw err;
        });
        mongoose.connection.db.dropCollection('uploads.chunks', (err, result) => {
            if (err) throw err;
        });
        res.send("Database cleared!")
    } else {
        res.send("Wrong Password.")
    }

})

//for cntrl c
process.on('SIGINT', function () {
    console.log("\nGracefully shutting down from SIGINT (Ctrl-C)");
    // some other closing procedures go here
    process.exit(1);
});

process.on('exit', () => {
    console.log("exit")
    process.exit(1)
})

process.on('SIGTERM', () => {
    console.log("sigterm")
    server.exit(1)
})

process.on('SIGTSTP', () => {
    console.log("sigterm")
    server.exit(1)
})
