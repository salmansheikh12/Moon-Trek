<script>
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ZonedDateTime, ZoneId } from '@js-joda/core';
import '@js-joda/timezone';
import * as imgUrl from './assets/earth.jpg';

export default {
    data() {
        return {
            view: 'model',
            incrementValue: 4,
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

            this.camera.position.set(
                10,
                0,
                0
            );
            this.orbit.update();

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
                    map: new THREE.TextureLoader().load(imgUrl.default),
                    shininess: 0
                })
            );
            // this.earth.rotateX(Math.PI / 2);

            this.moon = new THREE.Mesh(
                new THREE.SphereGeometry(1.737, 30, 30),
                new THREE.MeshBasicMaterial({
                    color: 0xCCCCCC
                })
            );

            this.scene.add(this.sun);
            this.scene.add(this.earth);
            this.scene.add(this.moon);
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

            // const earthMatrix = new THREE.Matrix4;
            // earthMatrix.makeRotationAxis(
            //     new THREE.Vector3(
            //         positions.earth.rotation_axis[0],
            //         positions.earth.rotation_axis[1],
            //         positions.earth.rotation_axis[2]
            //     ),
            //     positions.earth.rotation_angle * Math.PI / 180
            // );
            // this.earth.applyMatrix4(earthMatrix);

            this.light.position.x = positions.sun.x / 1000;
            this.light.position.y = positions.sun.y / 1000;
            this.light.position.z = positions.sun.z / 1000;

            this.sun.position.x = positions.sun.x / 1000;
            this.sun.position.y = positions.sun.y / 1000;
            this.sun.position.z = positions.sun.z / 1000;

            this.moon.position.x = positions.moon.x / 1000;
            this.moon.position.y = positions.moon.y / 1000;
            this.moon.position.z = positions.moon.z / 1000;
        },
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