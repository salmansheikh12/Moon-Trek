<script>
    import ImageUploadForm from '../components/ImageUploadForm.vue'

    export default {
        name: 'UploadPage',
        components: { ImageUploadForm }
    }
</script>

<template>
    <ImageUploadForm />

    <div id="instructions">
        <div class="columns is-centered">
            <div class="column is-two-thirds">
                <h1>How Does it Work?</h1>
                <h2>
                    Moon Trek Telescope is an application that allows you to submit your own 
                    images of the moon and receive useful information within the field of view, 
                    such as annotations, layering, etc.
                </h2>
            </div>
        </div>
        <div class="columns is-centered">
            <div class="column is-one-third">
                <h3>
                    Begin by selecting your image of the moon. For best registration results consider: 
                    clear, non blurry images with at least 50% of the moon.
                </h3>
            </div>
            <div class="column is-one-third">
                <h3>
                    Our application will attempt image registration. If the image registers properly, we 
                    will be able to annotate your image. If registration fails, then you will have to 
                    resubmit a better image.
                </h3>
            </div>
        </div>
    </div>
</template>

<style>
    #instructions h1 {
        font-size: 2rem;
        font-weight: bold;
        text-decoration: underline;
        margin-top: 3rem;
        margin-bottom: 1.2rem;
    }

    #instructions h2 {
        font-size: 1.6rem;
    }

    #instructions h3 {
        font-size: 1.4rem;
    }

    #instructions p {
        font-size: 1.2rem;
    }
</style>