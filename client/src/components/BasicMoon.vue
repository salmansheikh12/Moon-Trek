<script>
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default {
    name: 'BasicMoon',
    data() {
        return {
        }
    },
    methods: {
        init() {
            this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(45, 1050 / 450, 0.1, 1050);
            this.gltfLoader = new GLTFLoader();
        },
        renderScene() {
            this.renderer.setSize(1050, 450);

            const canvas = document.getElementById('moon-canvas');
            canvas.appendChild(this.renderer.domElement);

            this.camera.position.set(0, 0, 2);

            const light = new THREE.PointLight(0xffffff, 3.5, 200);
            light.position.set(-50, 0, 50);
            this.scene.add(light);

            this.gltfLoader.load('http://localhost:8888/model/Moon.glb', (gltf) => {
                this.moon = gltf.scene;
                this.moon.scale.set(1 / 850, 1 / 850, 1 / 850);
                this.scene.add(this.moon);

                // const box = new THREE.Box3().setFromObject(moon);
                // const size = box.getSize(new THREE.Vector3());
                // console.log(size);
            });
        },
        animate() {
            requestAnimationFrame(this.animate);

            const canvas = document.getElementById('moon-canvas');
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;

            if (canvas.width !== width || canvas.height !== height) {
                this.renderer.setSize(width, height);
                this.camera.aspect = width / height;
                this.camera.updateProjectionMatrix();
            }

            this.moon.rotation.y += 0.0025;
            this.renderer.render(this.scene, this.camera);
        }
    },
    mounted() {
        this.init();
        this.renderScene();
        this.renderer.setAnimationLoop(this.animate);
    },
    beforeUnmount() {
        this.renderer.setAnimationLoop(null);
    }
}
</script>

<template>
    <div class='columns is-centered'>
        <div id='moon-canvas'>

        </div>
    </div>
</template>

<style>
#moon-canvas {
    z-index: 7;
}
</style>