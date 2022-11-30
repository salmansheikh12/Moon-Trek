<script>
    import BasicMoon from '../components/BasicMoon.vue';
    import AnimatedStars from '../components/AnimatedStars.vue'

    export default {
        name: 'HomePage',
        components: { BasicMoon, AnimatedStars }
    }
</script>

<template>
    <AnimatedStars />
    <div id="home">
        <div class="columns is-centered">
            <div class="column is-two-thirds is-mobile">
                <h1>Moon Trek Telescope</h1>
            </div>
        </div>
        <div class="columns is-centered">
            <div class="column">
                <BasicMoon />
            </div>
        </div>
        <div class="columns is-centered">
            <div class="column is-one-third">
                <h2>Moon Trek Telescope applies data to user images of the moon</h2>
            </div>
        </div>
        <div class="columns is-centered">
            <div class="column">
                <router-link id="get-started" to="/upload">Get Started</router-link>
            </div>
        </div>
    </div>
</template>

<style>
    #home h1 {
        background: -webkit-linear-gradient(#d9ecff, #2E3440 80%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 8rem;
        font-weight: bold;
        line-height: 7rem;
        text-transform: uppercase;
        margin-bottom: -6.5rem;
    }

    #home h2 {
        font-size: 1.6rem;
        margin-top: -4rem;
    }

    #get-started {
        background-image: linear-gradient(to right, #88C0D0, #B48EAD);
        color: #d9ecff;
        font-size: 1.4rem;
        padding: .6rem;
    }
</style>