<script>
    // import BasicMoon from '../components/BasicMoon.vue';
    import AnimatedStars from '../components/AnimatedStars.vue'

    export default {
        name: 'AboutPage',
        components: { AnimatedStars }
    }
</script>

<template>
    <AnimatedStars />
    <div id="aboutpage">
        <div class="columns is-centered">
            <div class="column is-two-thirds">
                <h1>
                    About Moon-Trek
                </h1>
                <img src="https://www.marssociety.org/wp-content/uploads/2022/10/nasa_jpl.jpg" width="500" height="333">
            </div>
        </div>

        <div class="columns is-centered">
            <div class="column is-two-thirds">
                <h2>
                    Previously, the Cal State Senior Design Capstone Project has focused on lunar image 
                    processing - in particular coregistration between telescope images and LRO WAC images. 
                    Some work has been done in rendering 3D Sun, Earth, and Moon geometry, and Earth-Moon visibility.

                    The goal of the project is to build upon the previous year's project, but the focus is on AR.

                    For phase one, students will work with a telescope electronic eye-piece that will provide students with access to real-time images. 
                    The effort will focus on using the co-registration algorithm and allow real-time AR metadata to be added to the image. 
                    The metadata will be queried from a Trek web service.

                    Phase two will focus on “super zoom”. A telescope image will be co-registered with a WAC mosaic. 
                    Users will be able to zoom into their image - as they zoom past the resolution of their image pixels from the LRO cameras will be used. 
                    This will also be supplemented with metadata. 
                    The experience will allow users for backyard space enthusiasts to use their home equipment to be able to connect what they are seeing with 
                    NASAs high-resolution datasets.

                    Phase three will build on the 3-D modeling that will allow a user to see the relative position of the earth moon and Sun as it is in real 
                    time from their current earth location.
       
                </h2>
            </div>
        </div>
    </div>
</template>

<style>
    #aboutpage h1 {
        font-size: 2rem;
        font-weight: bold;
        text-decoration: underline;
        margin-top: 3rem;
        margin-bottom: 1.2rem;
    }

    #aboutpage h2 {
        font-size: 1.6rem;
    }

    #aboutpage h3 {
        font-size: 1.4rem;
    }

    #aboutpage p {
        font-size: 1.2rem;
    }
</style>