<script>
import * as THREE from 'three'

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
            this.moonTexture = new THREE.TextureLoader().load(require('../assets/mesh/moon-1k.jpg'));
        },
        renderScene() {
            this.renderer.setSize(1050, 450);

            const canvas = document.getElementById('moon-canvas');
            canvas.appendChild(this.renderer.domElement);

            this.camera.position.set(0, 0, 6);

            const light = new THREE.PointLight(0xffffff, 3.5, 200);
            light.position.set(-50, 0, 50);
            this.scene.add(light);

            const moonGeo = new THREE.SphereGeometry(1.737, 30, 30);
            const moonMat = new THREE.MeshPhongMaterial({
                map: this.moonTexture,
                shininess: 0
            });
            this.moon = new THREE.Mesh(moonGeo, moonMat);
            this.scene.add(this.moon);
        },
        animate() {
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