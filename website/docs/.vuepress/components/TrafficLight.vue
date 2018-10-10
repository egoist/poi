<template>
  <div class="traffic-light" :class="{'is-light': light}">
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  </div>
</template>

<script>
export default {
  props: {
    light: {
      type: Boolean,
      default: false
    }
  }
}
</script>


<style lang="stylus" scoped>
.traffic-light {
  margin: 0 12px;

  &.is-light {
    .dot {
      background-color: rgba(0, 0, 0, 0.2);
    }
  }
}

.dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
}
</style>
