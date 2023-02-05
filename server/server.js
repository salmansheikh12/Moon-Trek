const express = require('express');
const app = express();
const port = 8888;
const config = require('./config.json');

// Super agent is used to make http requests
// Use:
//      To get info from JPL's servers
const superagent = require('superagent');

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
app.use('/model', express.static('models'));

// Endpoint to get positions of the earth and sun relative to the moon
// given a time stamp (expected in UTC)
app.get('/positions', async (req, res) => {
    try {
        // Get the time stamp that was sent with the request as a query parameter
        const { latitude, longitude, timeStamp } = req.query;

        // Search for position information using the given time stamp
        const personPositionSearch = await superagent.get(
            `http://${ config.dataServer.ip }:${ config.dataServer.port }/lat-to-rect/earth/earth/${ longitude }/${ latitude }/${ timeStamp }`
        );
        const earthSearch = await superagent.get(
            `http://${ config.dataServer.ip }:${ config.dataServer.port }/planet-vector-search/moon/earth/${ timeStamp }`
        );
        const sunSearch = await superagent.get(
            `http://${ config.dataServer.ip }:${ config.dataServer.port }/planet-vector-search/moon/sun/${ timeStamp }`
        );
        const moonSearch = await superagent.get(
            `http://${ config.dataServer.ip }:${ config.dataServer.port }/target-rotation/earth/moon/${ timeStamp }`
        );

        // Parse the search data for specifically the position information
        const person = JSON.parse(personPositionSearch.text).positions.earth;
        const earth = JSON.parse(earthSearch.text).positions.earth;
        const sun = JSON.parse(sunSearch.text).positions.sun;
        const moon = JSON.parse(moonSearch.text);

        // Respond with the position information
        res.status(200).json({ person, earth, sun, moon });
    } catch(error) {
        // If there's any errors, respond with an error message and the actual
        // error itself
        res.status(500).json({
            status: 'Failed to retrieve positions',
            error
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});