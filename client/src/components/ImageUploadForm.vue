<script>
    import axios from 'axios';
    import { useCookies } from 'vue3-cookies';
    import { EXIF } from 'exif-js';

    export default {
        name: 'ImageUploadForm',
        setup() {
            const { cookies } = useCookies();
            return { cookies };
        },
        data() {
            return {
                image: '',
                // Message for displaying success or failure when uploading
                message: '',
                // Tracks if image has meta data
                hasExif: true,
                latitude: '',
                longitude: '',
                altitude: '',
                timeStamp: '',
                // Tracks date input if there isn't meta data
                date: '',
                // Tracks time input if there isn't meta data
                time: ''
            }
        },
        methods: {
            // This method is run when a new image is selected on the form. It
            // will pull and store exif data if it exists. If not it displays
            // the form for the user to manually enter that data
            onSelect() {
                // Get the selected image
                this.image = this.$refs.moonImage.files[0];

                try {
                    // Within the getData method, the 'this' keyword references
                    // the current instance of meta data associated with the
                    // image. So to keep a reference to the route variables,
                    // the outer instance of this is stored in a local variable
                    // called 'instance'
                    const instance = this;
                    EXIF.getData(instance.image, function() {
                        // Attempt to pull data from image
                        const latitude = EXIF.getTag(this, "GPSLatitude");
                        const longitude = EXIF.getTag(this, "GPSLongitude");
                        const altitude = EXIF.getTag(this, "GPSAltitude");
                        const timeStamp = EXIF.getTag(this, "DateTimeOriginal");

                        // Check if the data exists
                        if (latitude && longitude && altitude && timeStamp) {
                            // Set the track variable to true if there is data
                            instance.hasExif = true;

                            // Set the latitude to positive or negative according
                            // to the latitude reference
                            if (EXIF.getTag(this, "GPSLatitudeRef") === 'N') {
                                instance.latitude = latitude[0];
                            } else {
                                instance.latitude = latitude[0] * -1;
                            }

                            // Set the longitude to positive or negative according
                            // to the longitude reference
                            if (EXIF.getTag(this, "GPSLongitudeRef") === 'E') {
                                instance.longitude = longitude[0];
                            } else {
                                instance.longitude = longitude[0] * -1;
                            }

                            instance.altitude = altitude;
                            instance.timeStamp = timeStamp;
                        } else {
                            // Set the track variable to negative if there isn't data
                            // This will display the form for the user to manually
                            // enter the data
                            instance.hasExif = false;
                        }
                    });
                } catch(err) {
                    this.message = err;
                }
            },
            // This method runs when the user actually clicks submit. At this
            // point, the meta data was either pulled from the image or
            // manually entered by the user
            async onSubmit() {
                try {
                    // Set up form data will be sent with the request to
                    // the 'upload' express endpoint
                    const formData = new FormData();
                    formData.append('image', this.image);

                    // If there's manually entered date and time data, adjust
                    // the time stamp to that entered data
                    if(this.date !== '' && this.time !== '') {
                        this.timeStamp = `${this.date}T${this.time}:00`;
                    }

                    // Make request to 'upload' endpoint with form data containing the image
                    // and location data which are sent as query parameters
                    const res = await axios.post('http://localhost:8888/upload', formData, {
                        params: {
                            latitude: this.latitude,
                            longitude: this.longitude,
                            altitude: this.altitude,
                            timeStamp: this.timeStamp
                        }
                    });

                    // Update message to response status
                    this.message = res.data.status;

                    // Pull UTC time info from the response
                    const { year, month, day, hour, minute, second } = res.data.timeStampInfo;

                    // Store file name, UTC time stamp, and geolocation data in cookies
                    this.cookies.set("fileName", res.data.fileName);
                    this.cookies.set("timeStamp", `${year}-${month}-${day}T${hour}:${minute}:${second}`);
                    this.cookies.set("longitude", this.longitude);
                    this.cookies.set("latitude", this.latitude);
                    this.cookies.set("altitude", this.altitude);
                } catch(err) {
                    this.message = err;
                }
            }
        }
    }
</script>

<template>
    <div id="image-upload">
        <form @submit.prevent="onSubmit" enctype="multipart/form-data">
            <div class="field">
                <div class="file is-centered">
                    <label class="file-label">
                        <input class="file-input" type="file" ref="moonImage" @change="onSelect"/>
                        <span class="file-cta">
                            <span class="file-icon">
                                <font-awesome-icon icon="fa-solid fa-file-arrow-up" />
                            </span>
                            <span class="file-label">
                                Select your moon picture
                            </span>
                        </span>
                    </label>
                </div>
            </div>
            <div v-if="!hasExif" id="manual-form">
                <div class="columns is-centered">
                    <div class="column is-one-fifth">
                        <div class="field">
                            <label class="label">
                                Altitude
                            </label>
                            <div class="control">
                                <input class="input" type="text" v-model="altitude"/>
                            </div>
                        </div>
                    </div>
                    <div class="column is-one-fifth">
                        <div class="field">
                            <label class="label">
                                Latitude
                            </label>
                            <div class="control">
                                <input class="input" type="text" v-model="latitude"/>
                            </div>
                        </div>
                    </div>
                    <div class="column is-one-fifth">
                        <div class="field">
                            <label class="label">
                                Longitude
                            </label>
                            <div class="control">
                                <input class="input" type="text" v-model="longitude"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="columns is-centered">
                    <div class="column is-one-fifth">
                        <div class="field">
                            <label class="label">
                                Date
                            </label>
                            <div class="control">
                                <input class="input" type="date" v-model="date"/>
                            </div>
                        </div>
                    </div>
                    <div class="column is-one-fifth">
                        <div class="field">
                            <label class="label">
                                Time
                            </label>
                            <div class="control">
                                <input class="input" type="time" v-model="time"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="field">
                <button class="button is-link">
                    Upload
                </button>
            </div>
        </form>
        <p id="status-message">
            {{ this.message }}
        </p>
    </div>
</template>

<style>
    #image-upload #status-message {
        font-size: 1.4rem;
    }

    #image-upload label {
        font-size: 1.2rem;
        color: whitesmoke;
    }

    #image-upload #manual-form {
        margin-top: 2rem;
        margin-bottom: 3rem;
    }
</style>