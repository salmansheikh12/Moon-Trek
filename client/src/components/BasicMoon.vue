<script>
    import * as THREE from 'three'

    export default {
        name: "BasicMoon",
        data() {
            return {
                // Import, load, and instantiate texture for the moon
                moonTexture: new THREE.TextureLoader().load("https://raw.githubusercontent.com/GerardRosario/3DMoonstuff/main/moonstuff/MoonColorMap2.jpg"),
            }
        },
        methods: {
            RenderMoon() {
                const canvas = document.getElementById("moon-canvas");

                // Instantiate renderer
                const renderer = new THREE.WebGLRenderer({ alpha: true });

                // Set render size and append it to the canvas
                renderer.setSize(1050, 450);
                canvas.appendChild(renderer.domElement);

                // Instantiate the scene and camera
                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(45, 1050/450, 0.1, 1050);

                // Set the camera position
                camera.position.set(0, 0, 2);

                // Create point light to represent Sun light
                const light = new THREE.PointLight(0xffffff, 2, 200);

                // Set the light's position
                light.position.set(-50, 0, 50);

                // Add light to the scene
                scene.add(light);

                // Create Moon sphere
                const moonGeo = new THREE.SphereGeometry(0.57, 62, 62);

                // Create Moon mesh which will overlay the sphere
                const moonMat = new THREE.MeshPhongMaterial({
                    map: this.moonTexture
                });

                // Create Moon object 
                const moon = new THREE.Mesh(moonGeo, moonMat);

                // Add Moon to scene
                scene.add(moon);

                // Animate the scene
                const animate = () => {
                    requestAnimationFrame(animate);

                    const width = canvas.clientWidth;
                    const height = canvas.clientHeight;

                    if (canvas.width !== width || canvas.height !== height) {
                        renderer.setSize(width, height);
                        camera.aspect = width / height;
                        camera.updateProjectionMatrix();
                    }

                    moon.rotation.y += 0.005;

                    renderer.render(scene, camera);
                };
                animate();
            }
        },
        mounted() {
            // When the page is loaded, this code will run
            this.RenderMoon();
        }
    }
</script>

<template>
    <div class="columns is-centered">
        <div id="moon-canvas">

        </div>
    </div>
</template>

<style>
    #moon-canvas {
        z-index: 7;
    }
</style>