<template>
  <div id="app">
    {{ count }}
  </div>
</template>

<script>
  export default {
    data: () => ({ count: 0 }),

    methods: {
      async hahaha() {
        return 'hahaha'
      }
    }
  }
</script>
