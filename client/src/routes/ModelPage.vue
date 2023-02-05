<script>
import axios from 'axios';
import * as THREE from 'three';
import { useCookies } from 'vue3-cookies';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default {
    name: "ModelPage",
    setup() {
        const { cookies } = useCookies();
        return { cookies };
    },
    data() {
        return {
            timeStamp: this.cookies.get("timeStamp"),
            altitude: this.cookies.get("altitude"),
            longitude: this.cookies.get("longitude"),
            latitude: this.cookies.get("latitude"),

        };
    },
    methods: {
        init() {
            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(45, 1050 / 450, 0.1, 1050);
            this.orbit = new OrbitControls(this.camera, this.renderer.domElement);
            this.gltfLoader = new GLTFLoader();
            this.earthTexture = new THREE.TextureLoader().load(require("../assets/mesh/earth.jpg"));
        },
        async getPositions() {
            const response = await axios.get(
                'http://localhost:8888/positions/',
                {
                    params: {
                        "timeStamp": this.timeStamp,
                        "longitude": this.longitude,
                        "latitude": this.latitude,
                    }
                }
            );

            return response.data;
        },
        async renderScene() {
            const positions = await this.getPositions();

            this.renderer.setSize(window.innerWidth * .95, window.innerHeight * .8);

            const canvas = document.getElementById("model-canvas");
            canvas.appendChild(this.renderer.domElement);

            // const axesHelper = new THREE.AxesHelper(5);
            // this.scene.add(axesHelper);

            this.camera.position.set(
                (positions.earth.x + positions.person.x) / -1000,
                (positions.earth.z + positions.person.z) / -1000,
                (positions.earth.y + positions.person.y) / 1000
            );
            this.orbit.update();

            // Create Earth sphere
            const earthGeo = new THREE.SphereGeometry(6.371, 30, 30);
            const earthMat = new THREE.MeshPhongMaterial({
                map: this.earthTexture
            });

            // Create Earth mesh which will overlay the sphere
            const earth = new THREE.Mesh(earthGeo, earthMat);

            // Set Earth position relative to the moon
            earth.position.x = positions.earth.x / -1000;
            earth.position.y = positions.earth.z / -1000;
            earth.position.z = positions.earth.y / 1000;

            earth.rotateZ(-1 * 23.44 * (3.14 / 180));

            // Add Earth to the scene
            this.scene.add(earth);

            this.gltfLoader.load('http://localhost:8888/model/Moon.glb', (gltf) => {
                const moon = gltf.scene;

                moon.scale.set(1 / 225, 1 / 225, 1 / 225);

                moon.position.x = 0;
                moon.position.y = 0;
                moon.position.z = 0;

                // moon.rotateY(180 * (3.14 / 180));
                moon.rotateY((positions.moon.rotation_angle) * (3.14 / 180));

                this.scene.add(moon);

                // const box = new THREE.Box3().setFromObject(moon);
                // const size = box.getSize(new THREE.Vector3());
                // console.log(size);
            });

            const light = new THREE.PointLight(0xffffff, 3.5, 1000000);

            light.position.x = positions.sun.x / -1000;
            light.position.y = positions.sun.z / -1000;
            light.position.z = positions.sun.y / 1000;

            this.scene.add(light);

            // const ambientLight = new THREE.AmbientLight(0x404040);
            // this.scene.add(ambientLight);
        },
        animate() {
            const canvas = document.getElementById("model-canvas");
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            if (canvas.width !== width || canvas.height !== height) {
                this.renderer.setSize(width, height);
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
            }

            this.renderer.render(this.scene, this.camera);
        }
    },
    async mounted() {
        this.init();
        await this.renderScene();
        this.renderer.setAnimationLoop(this.animate);
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