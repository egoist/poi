<template>
  <div id="app">
    <my-component></my-component>
  </div>
</template>

<script>
  import MyComponent from '../src/<%= moduleName %>.vue'

  export default {
    components: {
      MyComponent
    }
  }
</script>
