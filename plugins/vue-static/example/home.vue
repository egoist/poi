<template>
  <div>
    <h1>home</h1>
    <router-link to="/about">about</router-link>
  </div>
</template>

<script>
export default {
  head: {
    title: 'Homepage'
  }
}
</script>

<style scoped>
div {
  color: red;
  font-size: 4rem;
}
</style>
