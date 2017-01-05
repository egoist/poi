<template>
  <div id="app">
    <img src="../assets/images/logo.png" height="100" alt="">
    <h1>{{ projectName }}</h1>
    <p>
      Edit files in <code>./src</code> and save to reload
    </p>
  </div>
</template>

<script>
  export default {
    mounted() {
      console.log('welcome!')
    }
  }
</script>

<style>
  body {
    text-align: center;
    font-family: Helvetica, sans-serif;
  }
</style>
