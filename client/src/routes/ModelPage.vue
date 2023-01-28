<script>
import axios from 'axios';
import * as THREE from 'three';
import { useCookies } from 'vue3-cookies';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

export default {
    name: "ModelPage",
    setup() {
        const { cookies } = useCookies();
        return { cookies };
    },
    data() {
        return {
            // Import, load, and instantiate textures for the moon, earth, and sun
            moonTexture: new THREE.TextureLoader().load("https://raw.githubusercontent.com/GerardRosario/3DMoonstuff/main/moonstuff/MoonColorMap2.jpg"),
            earthTexture: new THREE.TextureLoader().load(require("../assets/mesh/earth.jpg")),
            sunTexture: new THREE.TextureLoader().load(require("../assets/mesh/sun.jpg")),
        };
    },
    methods: {
        // This method gets the time stamp stored in cookies (should be in
        // UTC) and sends a request to the 'positions' express endpoint
        // for the positions of the earth and sun relative to the moon
        async getPositions() {
            // Get the time stamp from cookies
            let timeStamp = this.cookies.get("timeStamp");

            // If there isn't a time stamp stored in cookies,
            // set it to some random time stamp
            if (!timeStamp) {
                timeStamp = '2022-10-16T06:59:30';
            }

            // Get the position information from the 'positions' endpoint
            const response = await axios.get(
                'http://localhost:8888/positions/',
                {
                    params: {
                        timeStamp
                    }
                }
            );

            // Return the position information
            return response.data;
        },
        // This method renders and animates the ThreeJs model
        async renderModel() {
            // Get position information for the earth and sun
            const positions = await this.getPositions();

            const canvas = document.getElementById("model-canvas");

            // Instantiate renderer
            const renderer = new THREE.WebGLRenderer({ alpha: true });

            // Set render size and append it to the canvas
            renderer.setSize(1600, 800);
            canvas.appendChild(renderer.domElement);

            // Instantiate the scene, camera, and orbit controls
            const scene = new THREE.Scene();
            const camera = new THREE.PerspectiveCamera(65, 2, 0.01, 1000000);
            const orbit = new OrbitControls(camera, renderer.domElement);

            // Set the camera position and update orbit controls
            camera.position.set(-5, 0, 0);
            orbit.update();

            // Create Moon sphere
            const moonGeo = new THREE.SphereGeometry(1.737, 30, 30);

            // Create Moon mesh which will overlay the sphere
            const moonMat = new THREE.MeshPhongMaterial({
                map: this.moonTexture
            });

            // Create Moon object 
            const moon = new THREE.Mesh(moonGeo, moonMat);

            // Set Moon position to origin
            moon.position.x = 0;
            moon.position.y = 0;
            moon.position.z = 0;

            // Add Moon to scene
            scene.add(moon);

            // Create Earth sphere
            const earthGeo = new THREE.SphereGeometry(6.371, 30, 30);
            const earthMat = new THREE.MeshPhongMaterial({
                map: this.earthTexture
            });

            // Create Earth mesh which will overlay the sphere
            const earth = new THREE.Mesh(earthGeo, earthMat);

            // Set Earth position relative to the moon
            earth.position.x = positions.earth.x / 1000;
            earth.position.y = positions.earth.y / 1000;
            earth.position.z = positions.earth.z / 1000;

            // Add Earth to the scene
            scene.add(earth);

            // Create Sun sphere
            const sunGeo = new THREE.SphereGeometry(696.34, 30, 30);
            const sunMat = new THREE.MeshBasicMaterial({
                map: this.sunTexture
            });

            // Create Sun mesh which will overlay the sphere
            const sun = new THREE.Mesh(sunGeo, sunMat);

            // Set Sun position relative to the moon
            sun.position.x = positions.sun.x / 1000;
            sun.position.y = positions.sun.y / 1000;
            sun.position.z = positions.sun.z / 1000;

            // Add Sun to the scene
            scene.add(sun);

            // Create point light to represent Sun light
            const light = new THREE.PointLight(16777215, 2, 1000000);

            // Set light's position to the Sun's position
            light.position.x = sun.position.x;
            light.position.y = sun.position.y;
            light.position.z = sun.position.z;

            // Add light to the scene
            scene.add(light);

            // Set Earth's and Moon's tilt
            earth.rotateZ(23.44 * (3.14 / 180));
            moon.rotateZ(-1.54 * (3.14 / 180));

            // Animate the scene
            const animate = () => {
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;

                if (canvas.width !== width || canvas.height !== height) {
                    renderer.setSize(width, height);
                    camera.aspect = width / height;
                    camera.updateProjectionMatrix();
                }

                //Self-rotation
                renderer.render(scene, camera);
            }
            renderer.setAnimationLoop(animate);
        }
    },
    mounted() {
        // When the page is loaded, this code will run
        this.renderModel();
    },
}
</script>

<template>
    <div class="columns is-centered">
        <div id="model-canvas">
        </div>
    </div>
</template>

<style>
#model {
    margin-top: -5rem;
}

#model-canvas {
    z-index: 7;
}
</style>