<template>
  <div>
    <h1>{{ count }}</h1>
    <button @click="count++">inc</button>
  </div>
</template>

<script>
  export default {
    data() {
      return {
        count: 0
      }
    }
  }
</script>
