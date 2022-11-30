<script>
    import NavBar from './components/NavBar.vue'
    export default {
        name: 'App',
        components: {
            NavBar
        }
    }
</script>

<template>
    <NavBar />
    <router-view></router-view>
</template>

<style>
    #app {
        font-family: 'Nunito';
        color: #d9ecff;
        text-align: center;
        margin-top: 40px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
</style>
