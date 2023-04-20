<script>

import AnimatedStars from '../components/AnimatedStars.vue'

export default {
    // name: 'AboutPAge',
    components: { AnimatedStars }


}


</script>

<template>
    <AnimatedStars />

    <div class="about">
      <h1>About Moontrek</h1>
      <p>Moontrek is a website dedicated to providing information and resources about space exploration and astronomy. We aim to inspire and educate people of all ages about the wonders of the universe.</p>
      <h2>Our Mission</h2>
      <p>Our mission is to make space exploration and astronomy accessible to everyone, regardless of their background or experience. We want to inspire people to learn more about the universe and the incredible things that are happening in space.</p>
      <h2>Our Team</h2>
      <ul>
        <li><strong>Salman Sheikh</strong> - </li>
        <li><strong>Nadir Abdusemend</strong> - </li>
        <li><strong>Joe</strong> - </li>
        <li><strong>Rich Ho</strong> - </li>
        <li><strong>Derek G</strong> - </li>
        <li><strong>Youssef </strong> - </li>
        <li><strong>Alex </strong> - </li>
        <li><strong>Owen </strong> - </li>
      </ul>
    </div>
  </template>
  

  
  <style>
  li strong{
    color: white;
  }
  .about {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h1 {
    font-size: 36px;
    text-align: center;
    margin-bottom: 20px;
  }
  
  h2 {
    font-size: 24px;
    margin-top: 40px;
  }
  
  p {
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 20px;
  }
  
  ul {
    list-style: none;
    padding-left: 0;
    margin-top: 20px;
  }
  
  li {
    font-size: 18px;
    line-height: 1.5;
    margin-bottom: 10px;
  }
  
  strong {
    font-weight: bold;
  }
  </style>
  