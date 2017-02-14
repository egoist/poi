<template>
  <div id="app">
    <button @click="handleClick">{{ count }}</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {count: 0}
    },
    methods: {
      handleClick() {
        this.count+=20
      }
    }
  }
</script>

<style>
  body {
    display: flex;
    align-items: center;
    justify-content: center
  }
</style>
