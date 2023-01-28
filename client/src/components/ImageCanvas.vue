<script>
import { useCookies } from "vue3-cookies";
import moonDataJSON from '../assets/MoonData.json';

export default {
    name: 'ImageCanvas',
    setup() {
        const { cookies } = useCookies();
        return { cookies };
    },
    data() {
        return {
            // Data for Moon craters, maria, and landing sites
            moonData: moonDataJSON,
            // User selected points name
            pointName: "",
            // User selected point description
            pointInfo: "",
            // Will be the CSS styling for the image
            imageStyling: {
                cursor: 'crosshair',
                background: `url(http://localhost:8888/image/resized-${this.cookies.get('fileName')})`,
                "background-size": "625px 623px",
            }
        }
    },
    methods: {
        // Displays all points of a given type on the canvas in red
        displayPoints(pointType) {
            // Assign the html element (by id) to render over
            const canvas = document.getElementById("canvas").getBoundingClientRect();
            const ctx = document.getElementById("canvas").getContext("2d");

            // Clear any other points
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Set color to red
            ctx.fillStyle = "red";

            // Begin a new path of points to plot
            ctx.beginPath();

            // Loop through all points of given type and plot them
            Object.keys(this.moonData[pointType]).forEach(point => {
                // Get position for current point
                const xLat = this.moonData[pointType][point].latitude;
                const yLong = this.moonData[pointType][point].longitude;
                const x = (xLat + (canvas.width / 2)) - 5;
                const y = ((canvas.height / 2) - yLong) - 5;
                // Plot current point
                ctx.fillRect(x, y, 10, 10);
            });

            // Render all plots
            ctx.fill();
        },
        // Displays specific point on canvas in cyan
        colorSpecificPoint(pointType, pointName) {
            // Assign the html element (by id) to render over
            const canvas = document.getElementById("canvas").getBoundingClientRect();
            const ctx = document.getElementById("canvas").getContext("2d");

            // Get the specific point to plot
            const point = this.moonData[pointType][pointName];

            // Get position for given point
            const xLat = point.latitude;
            const yLong = point.longitude;
            const x = (xLat + (canvas.width / 2)) - 5;
            const y = ((canvas.height / 2) - yLong) - 5;

            // Set color to cyan
            ctx.fillStyle = "cyan";

            // Plot given point
            ctx.fillRect(x, y, 10, 10);

            // Render plot
            ctx.fill();
        },
        // When a point is selected, all points of the same type are plotted in red
        // and the selected point is plotted in cyan. The selected point name and
        // point information is updated as well
        displayPointInfo(pointType, pointName) {
            // Plot all points of type in red
            this.displayPoints(pointType);

            // Plot specific point in cyan
            this.colorSpecificPoint(pointType, pointName);

            // Update to selected point name
            this.pointName = pointName;

            // Update to selected point description
            this.pointInfo = this.moonData[pointType][pointName].description;
        },
        // This method loops through all points of given type and returns an array
        // containing pairs of points to display per row
        getPointPairs(pointType) {
            // Get an array of all point names given point type
            const pointNames = Object.keys(this.moonData[pointType]);
            let pairs = [];

            // Loop through the names array two at a time
            for (let i = 0; i < pointNames.length - 1; i += 2) {
                // Enter pairs of point names into the pairs array
                pairs.push([pointNames[i], pointNames[i + 1]]);
            }

            // If the point names array is odd, add the last value
            // by itself
            if (pointNames.length % 2 !== 0) {
                pairs.push([pointNames[pointNames.length - 1]]);
            }

            // Return the pairs array
            return pairs;
        },
        // cellClicked(event) {
        //     const canvas = document.getElementById("canvas").getBoundingClientRect();
        //     const x = event.clientX - canvas.left;
        //     const y = event.clientY - canvas.top;

        //     this.message = `${x - canvas.width / 2}, ${canvas.width / 2 - y}`;
        // }
    }
}
</script>

<template>
    <div id="image-canvas">
        <div class="columns is-centered">
            <div class="columns is-centered">
                <div class="column">
                    <div>
                        <p id="type-selection">
                            Crater
                        </p>
                        <div v-for="pair in getPointPairs('crater')" :key="pair.id">
                            <a id="point-selection" @click="displayPointInfo('crater', pair[0])">
                                {{ pair[0] }}
                            </a>
                            <a id="point-selection" @click="displayPointInfo('crater', pair[1])">
                                {{ pair[1] }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="columns is-centered">
                <div class="column">
                    <div>
                        <p id="type-selection">
                            Maria
                        </p>
                        <div v-for="pair in getPointPairs('maria')" :key="pair.id">
                            <a id="point-selection" @click="displayPointInfo('maria', pair[0])">
                                {{ pair[0] }}
                            </a>
                            <a id="point-selection" @click="displayPointInfo('maria', pair[1])">
                                {{ pair[1] }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div class="columns is-centered">
                <div class="column">
                    <div>
                        <p id="type-selection">
                            Landing Sites
                        </p>
                        <div v-for="pair in getPointPairs('landingSite')" :key="pair.id">
                            <a id="point-selection" @click="displayPointInfo('landingSite', pair[0])">
                                {{ pair[0] }}
                            </a>
                            <a id="point-selection" @click="displayPointInfo('landingSite', pair[1])">
                                {{ pair[1] }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="columns is-centered">
            <div id="canvas-section" class="column">
                <canvas id="canvas" width="625" height="623" :style="imageStyling" @click="cellClicked">
                </canvas>
            </div>
        </div>
        <div class="columns is-centered">
            <div class="column">
                <p id="point-name">
                    {{ this.pointName }}
                </p>
                <p id="point-info">
                    {{ this.pointInfo }}
                </p>
            </div>
        </div>
    </div>
</template>

<style>
#canvas-section {
    z-index: 7;
}

#image-canvas #type-selection {
    font-size: 1.8rem;
    font-weight: bold;
    text-decoration: underline;
    margin-top: .8rem;
    margin-bottom: .8rem;
}

#image-canvas #point-selection {
    font-size: 1.4rem;
    margin-left: .6rem;
    margin-right: .6rem;
}

#image-canvas #point-selection:hover {
    color: #81A1C1
}

#image-canvas #point-name {
    font-size: 2rem;
}

#image-canvas #point-info {
    font-size: 1.4rem;
    margin-left: 2rem;
    margin-right: 2rem;
}
</style>