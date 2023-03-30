const express = require('express');
const expressWs = require('express-ws');

const app = express();
const port = 8888;
const config = require('./config.json');
expressWs(app);

const fs = require('fs');

// Axios is used to make http requests
// Use:
//      To get info from JPL's servers
const axios = require('axios');

// Spawn is used to create separate processes
// Use:
//      To call the python file which performs image registration
const { spawn } = require('child_process');

// Find is used to get timezone based on geographical locations
// Use:
//      To use the given latitude, longitude, and time stamp to find the
//      uploader's time zone. This is helpful for getting their time in UTC
const { find } = require('geo-tz');

// Cross origin resource sharing is used for sending data across different
// servers and ports
// Use:
//      This is required for getting info from JPL's servers and forwarding
//      that data to the vue client
const cors = require('cors');
app.use(cors());

// Multer is used for uploading images
const multer = require('multer');

// Upload middleware
// Use:
//      This is where we define the location to store uploaded images and the
//      naming scheme we want to use for each uploaded image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images/uploads');
    },
    filename: (req, file, cb) => {
        // Before saving the file, all spaces are removed from the file name
        // and the current time (in seconds since epoch) is appended to the
        // beginning of the name. This handles the case of duplicate file names
        cb(null, `${Date.now()}--${file.originalname.replace(/\s/g, '')}`);
    }
});

// Instantiate the upload middleware with the defined configuration
const upload = multer({
    storage: storage,
});

// Endpoint for uploading an image and performing image registration
app.post('/upload', upload.single('image'), async (req, res) => {
    try {
        // Get the image object sent with the request
        const image = req.file;

        // Set up the command to call the python file, which performs image
        // registration given the file name as an argument, within the proper
        // anaconda environment that has all necessary dependencies. If no
        // errors are encountered, two files should be created in the folder
        // images/processed: one image which shows the commonalities found
        // during registration and the other is a cropped/resized version
        // of the original
        const cmd = `conda run -n MoonTrek python image-registration/process.py ${ image.filename }`;

        // Execute the command
        spawn(cmd, { shell: true });

        // Get the location data sent with the request as query parameters
        const { latitude, longitude } = req.query;
        const timeZone = find(latitude, longitude)[0];
        
        // Respond with a success message, the name we saved the uploaded
        // image as, and the object containing the UTC date info
        res.status(200).json({
            status: 'Upload successful',
            fileName: image.filename,
            timeZone
        });
    } catch (error) {
        // If there's any errors, respond with an error message and the actual
        // error itself
        res.status(500).json({
            status: 'Upload failed',
            error
        });
    }
});

app.use('/image', express.static('images/processed'));

const adjustPositionsForModel = (positions) => {
    // -------swap-------
    // x, y, z = x, z, -y
    const temp = -1 * positions.y;
    positions.y = positions.z;
    positions.z = temp;

    // ------scale------
    positions.x /= 1000;
    positions.y /= 1000;
    positions.z /= 1000;

    return positions;
};
const adjustRotationsForModel = (rotations) => {
    // -------swap-------
    // x, y, z = x, z, -y
    const temp = -1 * rotations.rotation_axis[1];
    rotations.rotation_axis[1] = rotations.rotation_axis[2];
    rotations.rotation_axis[2] = temp;

    return rotations;
};
// Endpoint to get positions of the earth and sun relative to the moon
// given a time stamp (expected in UTC)
app.get('/positions', async (req, res) => {
    try {
        const { latitude, longitude, timeStamp } = req.query;

        const personPositionSearch = await axios.get(
            `http://${ config.dataServer.ip }:${ config.dataServer.port }/lat-to-rect/earth/earth/${ longitude }/${ latitude }/${ timeStamp }`
        );
        const sunPositionSearch = await axios.get(
            `http://${ config.dataServer.ip }:${ config.dataServer.port }/planet-vector-search/earth/sun/${ timeStamp }`
        );
        const moonPositionSearch = await axios.get(
            `http://${ config.dataServer.ip }:${ config.dataServer.port }/planet-vector-search/earth/moon/${ timeStamp }`
        );
        const moonRotationSearch = await axios.get(
            `http://${ config.dataServer.ip }:${ config.dataServer.port }/target-rotation/sun/moon/${ timeStamp }`
        );

        res.status(200).json({
            "person": adjustPositionsForModel(personPositionSearch.data.positions.earth),
            "sun": adjustPositionsForModel(sunPositionSearch.data.positions.sun),
            "moon": {
                ...adjustPositionsForModel(moonPositionSearch.data.positions.moon),
                ...adjustRotationsForModel(moonRotationSearch.data)
            },
        });
    } catch(error) {
        // If there's any errors, respond with an error message and the actual
        // error itself
        res.status(500).json({
            status: 'Failed to retrieve positions',
            error
        });
    }
});

// Get the /ws websocket route
app.ws('/ws', async function(ws, req) {
    ws.on('message', async function(msg) {
        fs.writeFile('test.ppm', msg, err => {
            if (err) {
              console.error(err);
            }
            // file written successfully
            console.log("Written successfully");
          });        
        ws.send(JSON.stringify({ "message" : "success" }));
        // Start listening for messages
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});