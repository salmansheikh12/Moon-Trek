<script>
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ZonedDateTime, ZoneId } from '@js-joda/core';
import '@js-joda/timezone';
import * as earthTexture from './assets/earth.jpg';
import * as moonTexture from './assets/moon.jpg';

export default {
    data() {
        return {
            view: 'model',
            cameraAnchor: 'earth',
            incrementValue: 1,
            incrementType: 'hours',
            timeStamp: new ZonedDateTime.now(ZoneId.of('UTC')),
            positionsLog: [],
        }
    },
    methods: {
        initialize() {
            const renderWidth = window.innerWidth * .8;
            const renderHeight = window.innerHeight * .8;

            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(45, renderWidth / renderHeight, 0.1, 10000000000000000000000);
            this.orbit = new OrbitControls(this.camera, this.renderer.domElement);

            this.renderer.setSize(renderWidth, renderHeight);
            this.$refs.modelCanvas.appendChild(this.renderer.domElement);
        },
        displayScene() {
            this.light = new THREE.PointLight(0xffffff, 2.5, 1000000);
            this.scene.add(this.light);

            this.sun = new THREE.Mesh(
                new THREE.SphereGeometry(695.700, 30, 30),
                new THREE.MeshBasicMaterial({
                    color: 0xF0D020
                })
            );

            this.earth = new THREE.Mesh(
                new THREE.SphereGeometry(6.371, 30, 30),
                new THREE.MeshPhongMaterial({
                    map: new THREE.TextureLoader().load(earthTexture.default),
                    shininess: 0
                })
            );

            this.moon = new THREE.Mesh(
                new THREE.SphereGeometry(1.737, 30, 30),
                new THREE.MeshPhongMaterial({
                    map: new THREE.TextureLoader().load(moonTexture.default),
                    shininess: 0
                })
            );

            this.camera.position.set(
                20,
                0,
                0
            );

            this.scene.add(this.sun);
            this.scene.add(this.earth);
            this.scene.add(this.moon);
        },
        changeOrbit(positions) {
            const newFocusPosition = {};
            const relativeCameraPosition = {};

            if (this.cameraAnchor === 'earth') {
                newFocusPosition.x = 0;
                newFocusPosition.y = 0;
                newFocusPosition.z = 0;

                relativeCameraPosition.x = this.camera.position.x;
                relativeCameraPosition.y = this.camera.position.y;
                relativeCameraPosition.z = this.camera.position.z;
            } else {
                newFocusPosition.x = positions.moon.x;
                newFocusPosition.y = positions.moon.y;
                newFocusPosition.z = positions.moon.z;

                relativeCameraPosition.x = this.camera.position.x + (positions.moon.x - this.moon.position.x);
                relativeCameraPosition.y = this.camera.position.y + (positions.moon.y - this.moon.position.y);
                relativeCameraPosition.z = this.camera.position.z + (positions.moon.z - this.moon.position.z);
            }

            const newWorldBox = new THREE.Box3().setFromCenterAndSize(
                new THREE.Vector3(newFocusPosition.x, newFocusPosition.y, newFocusPosition.z),
                new THREE.Vector3(.1, .1, .1),
            );
            newWorldBox.getCenter(this.orbit.target);

            this.camera.position.set(
                relativeCameraPosition.x,
                relativeCameraPosition.y,
                relativeCameraPosition.z
            );
            this.orbit.update();
        },
        async updatePositions() {
            let incrementAmount = this.incrementValue;

            if (this.incrementType === 'days') {
                incrementAmount *= 24;
            }

            const currentStamp = this.timeStamp.plusHours(incrementAmount);
            this.timeStamp = currentStamp;

            const timeStampStr = `${currentStamp.year()}-${currentStamp.monthValue()}-${currentStamp.dayOfMonth()}T${currentStamp.hour()}:${currentStamp.minute()}:${currentStamp.second()}`;

            const response = await axios.get(
                'http://localhost:8888/positions/',
                {
                    params: {
                        'latitude': 34,
                        'longitude': -118,
                        'timeStamp': timeStampStr,
                    }
                }
            );
            const positions = response.data;
            this.positionsLog.push([timeStampStr, positions]);

            this.changeOrbit(positions);

            this.light.position.set(
                positions.sun.x,
                positions.sun.y,
                positions.sun.z
            );
            this.sun.position.set(
                positions.sun.x,
                positions.sun.y,
                positions.sun.z
            );

            const moonMatrix = new THREE.Matrix4;
            moonMatrix.makeRotationAxis(
                new THREE.Vector3(
                    positions.moon.rotation_axis[0],
                    positions.moon.rotation_axis[1],
                    positions.moon.rotation_axis[2]
                ),
                positions.moon.rotation_angle * Math.PI / 180
            );
            this.moon.applyMatrix4(moonMatrix);
            this.moon.position.set(
                positions.moon.x,
                positions.moon.y,
                positions.moon.z
            );
        }
    },
    mounted() {
        this.initialize();
        this.displayScene();

        setInterval(async () => {
            await this.updatePositions();
        }, 1000);

        this.renderer.setAnimationLoop(() => {
            this.renderer.render(this.scene, this.camera);
        });
    }
}
</script>

<template>
    <div class="columns is-centered">
        <div class="column select is-narrow">
            <select id="viewSelect" v-model="view">
                <option value="model" selected>Model</option>
                <option value="logs">Logs</option>
            </select>
        </div>
        <div class="column is-narrow">
            <input class="input" type="number" id="incrementValueSelect" min="1" v-model="incrementValue"
                @change="positionsLog = []" />
        </div>
        <div class="column select is-narrow">
            <select id="incrementTypeSelect" v-model="incrementType" @change="positionsLog = []">
                <option value="hours" selected>Hours</option>
                <option value="days">Days</option>
            </select>
        </div>
        <div class="column select is-narrow">
            <select id="viewSelect" v-model="cameraAnchor">
                <option value="earth" selected>Earth</option>
                <option value="moon">Moon</option>
            </select>
        </div>
    </div>
    <br />
    <table class="table" v-show="view === 'logs'">
        <thead>
            <tr>
                <th>Date</th>
                <th>Moon X</th>
                <th>Moon Y</th>
                <th>Moon Z</th>
                <th>Sun X</th>
                <th>Sun Y</th>
                <th>Sun Z</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="log in positionsLog">
                <td>{{ log[0] }}</td>
                <td>{{ log[1].moon.x.toFixed(2) }}</td>
                <td>{{ log[1].moon.y.toFixed(2) }}</td>
                <td>{{ log[1].moon.z.toFixed(2) }}</td>
                <td>{{ log[1].sun.x.toFixed(2) }}</td>
                <td>{{ log[1].sun.y.toFixed(2) }}</td>
                <td>{{ log[1].sun.z.toFixed(2) }}</td>
            </tr>
        </tbody>
    </table>
    <div v-show="view === 'model'">
        <div class="columns is-centered" id="date">
            {{ `${timeStamp.hour()}:${timeStamp.minute()} --
                        ${timeStamp.year()}-${timeStamp.monthValue()}-${timeStamp.dayOfMonth()}` }}
        </div>
        <div class="columns is-centered" ref="modelCanvas">
        </div>
    </div>
</template>

<style>
input[type='number'] {
    width: 65px;
}

#date,
th,
td {
    text-align: center;
    font-size: 1.2rem;
    z-index: 7;
}
</style>