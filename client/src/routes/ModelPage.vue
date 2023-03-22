<script>
import axios from 'axios';
import * as THREE from 'three';
import { useCookies } from 'vue3-cookies';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Buffer } from 'buffer';

// THREE.Object3D.DEFAULT_UP.set(0, 1, 0);
// THREE.Object3D.DEFAULT_UP.set(0, -1, 1);

export default {
    name: 'ModelPage',
    setup() {
        const { cookies } = useCookies();
        return { cookies };
    },
    data() {
        return {
            timeStampLocal: this.cookies.get('timeStampLocal'),
            timeStampUTC: this.cookies.get('timeStampUTC'),
            altitude: this.cookies.get('altitude'),
            longitude: this.cookies.get('longitude'),
            latitude: this.cookies.get('latitude'),
            width: window.innerWidth * .8,
            height: window.innerHeight * .8,
            getRenderedPixels: false,
            currentOrbit: '',
            positions: {}
        };
    },
    methods: {
        async getPositions() {
            const response = await axios.get(
                'http://localhost:8888/positions/',
                {
                    params: {
                        'timeStamp': this.timeStampUTC,
                        'longitude': this.longitude,
                        'latitude': this.latitude,
                    }
                }
            );

            this.positions = response.data;
        },
        // Strips pixel raster of alpha component
        // Data must be in RGBA format
        RGBAToRGB(data) {
            const out = new Uint8Array(data.length * 3 / 4);
            for (let i = 0; i < data.length; i++) {
                if (i + 1 % 4 != 0) {
                    out[i - Math.floor(i / 4)] = data[i];
                }
            }
            return out;
        },
        // Converts raster data into PPM image format
        // Data must be RGB Uint8Array of length width * height * 3
        formatPPM(data, width, height, maxVal) {
            let out = '';
            out = out.concat('P3\n', width, ' ', height, '\n', maxVal, '\n');
            for (let i = 0; i < data.length; i++) {
                out = out.concat(data[i], ' ');
                if (i != 0 && i % width * 3 == 0) {
                    out = out.concat('\n');
                }
            }
            return out;
        },
        sendMessage(message) {
            console.log('Hello');
            console.log(this.connection);
            this.connection.send(message);
        },
        setAwaitFlag() {
            this.getRenderedPixels = true;
        },
        init() {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderTarget = new THREE.WebGLRenderTarget({ antialias: true });
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(45, 1050 / 450, 0.1, 2000);
            this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
            this.earthTexture = new THREE.TextureLoader().load(require('../assets/mesh/earth.jpg'));
            this.moonTexture = new THREE.TextureLoader().load(require('../assets/mesh/moon-4k.jpg'));

            // this.camera.up = new THREE.Vector3(0, 0, 1);
        },
        renderScene() {
            this.renderer.setSize(window.innerWidth * .95, window.innerHeight * .8);
            this.renderTarget.setSize(window.innerWidth * .95, window.innerHeight * .8);
            document.getElementById('model-canvas').appendChild(this.renderer.domElement);

            const earth = new THREE.Mesh(
                new THREE.SphereGeometry(6.371, 30, 30),
                new THREE.MeshPhongMaterial({
                    map: this.earthTexture,
                    shininess: 0
                })
            );
            earth.position.x = 0;
            earth.position.y = 0;
            earth.position.z = 0;
            // const earthMatrix = new THREE.Matrix4;
            // earthMatrix.makeRotationAxis(
            //     new THREE.Vector3(
            //         this.positions.earth.rotation_axis[0],
            //         this.positions.earth.rotation_axis[1],
            //         this.positions.earth.rotation_axis[2]
            //     ),
            //     this.positions.earth.rotation_angle * Math.PI / 180
            // );
            // earth.applyMatrix4(earthMatrix);
            this.scene.add(earth);

            const person = new THREE.Mesh(
                new THREE.SphereGeometry(.05),
                new THREE.MeshBasicMaterial({
                    color: 0xe62117
                })
            );
            person.position.x = this.positions.person.x;
            person.position.y = this.positions.person.y;
            person.position.z = this.positions.person.z;
            this.scene.add(person);

            const moon = new THREE.Mesh(
                new THREE.SphereGeometry(1.737, 30, 30),
                new THREE.MeshPhongMaterial({
                    map: this.moonTexture,
                    shininess: 0
                })
            );
            moon.position.set(
                this.positions.moon.x,
                this.positions.moon.y,
                this.positions.moon.z
            );
            // const moonMatrix = new THREE.Matrix4;
            // moonMatrix.setPosition(
            //     this.positions.moon.x,
            //     this.positions.moon.y,
            //     this.positions.moon.z
            // );
            // moonMatrix.makeRotationAxis(
            //     new THREE.Vector3(
            //         this.positions.moon.rotation_axis[0],
            //         this.positions.moon.rotation_axis[2],
            //         this.positions.moon.rotation_axis[1]
            //     ),
            //     this.positions.moon.rotation_angle * Math.PI / 180
            // );
            // moon.applyMatrix4(moonMatrix);
            this.scene.add(moon);

            const light = new THREE.PointLight(0xffffff, 2.5, 1000000);
            light.position.x = this.positions.sun.x;
            light.position.y = this.positions.sun.y;
            light.position.z = this.positions.sun.z;
            this.scene.add(light);

            this.camera.position.x = this.positions.person.x;
            this.camera.position.y = this.positions.person.y;
            this.camera.position.z = this.positions.person.z;

            this.changeOrbit('Earth');
            // const moonDirection = this.camera.position.clone().sub(moon.position).normalize();
            // this.camera.position.add(moonDirection.clone().multiplyScalar(-367.5));

            const ambientLight = new THREE.AmbientLight(0x404040);
            earth.add(ambientLight);

            const earthAxes = new THREE.AxesHelper(10);
            earthAxes.position.x = earth.position.x;
            earthAxes.position.y = earth.position.y;
            earthAxes.position.z = earth.position.z;
            this.scene.add(earthAxes);

            const moonAxes = new THREE.AxesHelper(10);
            moonAxes.position.x = moon.position.x;
            moonAxes.position.y = moon.position.y;
            moonAxes.position.z = moon.position.z;
            this.scene.add(moonAxes);
        },
        changeOrbit(newAnchor) {
            this.currentOrbit = newAnchor;
            const newFocusPosition = {};

            if (newAnchor === 'Person') {
                newFocusPosition.x = this.positions.person.x;
                newFocusPosition.y = this.positions.person.y;
                newFocusPosition.z = this.positions.person.z;
            }
            else if (newAnchor === 'Earth') {
                newFocusPosition.x = 0;
                newFocusPosition.y = 0;
                newFocusPosition.z = 0;
            } else {
                newFocusPosition.x = this.positions.moon.x;
                newFocusPosition.y = this.positions.moon.y;
                newFocusPosition.z = this.positions.moon.z;
            }

            const newWorldBox = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(newFocusPosition.x, newFocusPosition.y, newFocusPosition.z),
                new THREE.Vector3(.1, .1, .1),
            );
            newWorldBox.getCenter(this.orbit.target);
            this.orbit.update();
        },
        animate() {
            const width = window.innerWidth * .95;
            const height = window.innerHeight * .8;

            if (this.width !== width || this.height !== height) {
                this.renderer.setSize(width, height);
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
            }
            // Flag is triggered when the user clicks the screen
            if (this.getRenderedPixels) {

                // Renders to secondary target instead of canvas
                this.renderer.setRenderTarget(this.renderTarget);
                this.renderer.render(this.scene, this.camera);

                // Reads RGBA values into buffer
                const buffer = new Buffer(window.innerWidth * window.innerHeight * 4);
                this.renderer.readRenderTargetPixels(this.renderTarget, 0, 0, window.innerWidth, window.innerHeight, buffer);

                // Removes alpha values
                const bufferRGB = this.RGBAToRGB(buffer);

                // Formats RGB values into PPM image format
                const ppmFile = this.formatPPM(bufferRGB, window.innerWidth, window.innerHeight, 255);

                console.log(ppmFile);

                this.sendMessage(ppmFile);

                // Deactivates flag so model will render as normal
                this.getRenderedPixels = false;

            } else {
                this.renderer.render(this.scene, this.camera);
            }
        }
    },
    async mounted() {
        await this.getPositions();
        this.init();
        this.renderScene();
        this.renderer.setAnimationLoop(this.animate);
    },
    created() {
        console.log('Starting connection to WebSocket Server');

        const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:');
        const port = ':8888';
        const echoSocketUrl = socketProtocol + '//' + window.location.hostname + port + '/ws';

        this.connection = new WebSocket(echoSocketUrl);

        this.connection.onmessage = function (event) {
            console.log(event);
        }

        this.connection.onopen = function (event) {
            console.log(event)
            console.log('Successfully connected to the echo websocket server...')
        }

    },
    beforeUnmount() {
        this.renderer.setAnimationLoop(null);
    }
}
</script>

<template>
    <div class="columns is-centered" id="cookies-data">
        {{ this.latitude }}, {{ this.longitude }} | {{ this.timeStampLocal }} | {{ this.timeStampUTC }}
    </div>
    <div id="test-buttons">
        <button class="button" id="get-ppm" @click="setAwaitFlag">Get PPM</button>
        <p>Orbit:
            <a @click="changeOrbit('Person')">Person</a>
            <a @click="changeOrbit('Earth')">Earth</a>
            <a @click="changeOrbit('Moon')">Moon</a>
        </p>
    </div>
    <div class="columns is-centered">
        <div id="model-canvas">
        </div>
    </div>
</template>

<style>
#cookies-data {
    font-size: 1.2rem;
    margin-bottom: .5rem;
}

#test-buttons {
    font-size: 1.2rem;
    margin-bottom: 1rem;
}

#test-buttons a {
    margin-left: .5rem;
    margin-right: .5rem;
}

#model-canvas {
    z-index: 7;
}
</style>