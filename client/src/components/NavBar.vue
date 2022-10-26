<template>
    <nav class="navbar is-transparent" role="navigation" aria-label="main navigation">
        <div class="navbar-brand">
            <router-link class="navbar-item" to="/">
                <div class="icons">
                    <img src="https://logos-world.net/wp-content/uploads/2020/05/NASA-Logo-1959-present.png"/>
                    <img src="https://www.freelogovectors.net/svg09/california-state-university-los-angeles-logo-freelogovectors.net_.svg"/>
                </div>
                <p>Moon Trek Telescope</p>
            </router-link>
            <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbar">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbar" class="navbar-menu">
            <div class="navbar-end">
                <div class="navbar-item">
                    <router-link class="navbar-item" to="/">Home</router-link>
                    <router-link class="navbar-item" to="/upload">Upload</router-link>
                    <router-link class="navbar-item" to="/connect">Connect</router-link>
                    <router-link class="navbar-item" to="/model">3D Model</router-link>
                    <router-link class="navbar-item" to="/about">About</router-link>
                </div>
            </div>
        </div>
    </nav>
</template>

<style>
    .navbar {
        background: rgba(0, 0, 0, 0);
        height: 2rem;
        margin-top: -2rem;
        margin-bottom: 6rem;
    }

    .icons {
        margin-right: .6rem;
    }

    .navbar-item {
        color: #d9ecff;
        font-family: 'Nunito';
        font-size: 1.2rem;
        margin-left: .4rem;
        margin-right: .4rem;
    }

    .navbar-item:hover {
        color: #81A1C1;
    }
</style>