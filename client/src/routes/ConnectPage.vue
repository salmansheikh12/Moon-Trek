<script>
    import { useCookies } from 'vue3-cookies';
    import ImageCanvas from '../components/ImageCanvas.vue';
    import AnimatedStars from '../components/AnimatedStars.vue'

    export default {
        name: 'ConnectPage',
        components: { ImageCanvas, AnimatedStars },
        setup() {
            const { cookies } = useCookies();
            return { cookies };
        },
        data() {
            return {
                // Get and save the file name from cookies
                fileName: this.cookies.get('fileName'),
                // Object used to keep track of what content to display which is
                // either the 2d canvas data or image showing registration info
                // Default is 2d canvas data
                selectedImage: {
                    'name': 'data',
                    'message': 'Switch to Image Registration'
                },
            }
        },
        methods: {
            // This method changes the object that is used to keep track of
            // which content to display
            switchImage() {
                if(this.selectedImage.name === 'data') {
                    this.selectedImage = {
                        'name': 'registration',
                        'message': 'Switch to Image Data'
                    };
                } else {
                    this.selectedImage = {
                        'name': 'data',
                        'message': 'Switch to Image Registration'
                    };
                }
            },
        },
    }
</script>

<template>
    <AnimatedStars />
    <div id="connect">
        <div v-if="!fileName">
            <div class="columns is-centered">
                <router-link id="re-upload" to="/upload">Please Upload an Image</router-link>
            </div>
        </div>
        <div v-else>
            <div class="columns is-centered">
                <a id="image-selector" @click="switchImage">
                    {{ this.selectedImage.message }}
                </a>
            </div>
            <div v-if="this.selectedImage.name === 'data'">
                <image-canvas/>
            </div>
            <div v-else>
                <img id="registered-image" v-bind:src="`http://localhost:8888/image/registration-${ this.fileName }`"/>
            </div>
        </div>
    </div>
</template>

<style>
    #connect #image-selector {
        color: #d9ecff;
        font-size: 1.2rem;
    }

    #connect #image-selector:hover {
        color: #81A1C1
    }

    #connect #registered-image {
        max-width: 80rem;
        max-height: 40rem;
        z-index: 7;
    }

    #connect #re-upload {
        background-image: linear-gradient(to right, #88C0D0, #B48EAD);
        color: #d9ecff;
        font-size: 1.4rem;
        padding: .6rem;
    }
</style>