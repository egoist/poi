<template>
  <div class="window browser-window">
    <div class="titlebar">
      <TrafficLight :light="true" />
      <div class="address">{{ address }}</div>
    </div>
    <div class="window-body">
      <slot name="default"></slot>
    </div>
  </div>
</template>

<script>
import TrafficLight from './TrafficLight.vue'

export default {
  components: {
    TrafficLight
  },

  props: {
    address: {
      type: String,
      required: true
    }
  }
}
</script>

<style lang="stylus" scoped>
.browser-window {
  display: flex;
  flex-direction: column;
  color: black;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 14px 50px 0px, rgba(0, 0, 0, 0.48) 0px 2px 10px 0px;
  width: 100%;
  height: 352px;
  background: rgb(255, 255, 255);
  border-radius: 7px;
  overflow: hidden;
}

.titlebar {
  display: flex;
  height: 2rem;
  line-height: 2rem;
  text-align: left;
  position: relative;
  box-shadow: rgb(204, 204, 204) 0px 0px 0px 1px;
  background-image: linear-gradient(-180deg, rgb(245, 245, 245) 2%, rgb(232, 232, 232) 99%);
  position: relative;
}

.window-body {
  margin: 8px;
}

.address {
  color: rgb(140, 140, 140);
  margin: auto;
  background: rgba(255, 255, 255, 0.65);
  border-radius: 5px;
  padding: 0px 2rem;
  height: 22px;
  line-height: @height;
  font-size: 13px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}
</style>
