<template>
  <div class="window editor-window">
    <div class="titlebar">
      <TrafficLight />
      <div class="tabs">
        <div 
          class="tab"
          :class="{active: currentIndex === index}"
          v-for="(file, index) in files" 
          :key="index"
          @click="currentIndex = index">
          {{ file.name }}
        </div>
      </div>
    </div>
    <div class="editor-content">
      <pre><code v-html="code"></code></pre>
    </div>
  </div>
</template>

<script>
import Prism from 'prismjs'
import TrafficLight from './TrafficLight.vue'

export default {
  components: {
    TrafficLight
  },

  props: {
    files: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      currentIndex: 0
    }
  },

  computed: {
    currentFile() {
      return this.files[this.currentIndex]
    },

    code() {
      console.log(this.currentFile)
      return Prism.highlight(this.currentFile.code, Prism.languages[this.currentFile.lang], this.currentFile.lang)
    }
  }
}
</script>

<style scoped lang="stylus">
.window {
  width: 100%;
  height: 350px;
}

.editor-window {
  display: flex;
  flex-direction: column;
  box-shadow: rgba(0, 0, 0, 0.38) 0px 14px 50px 0px, rgba(0, 0, 0, 0.48) 0px 2px 10px 0px;
  width: 100%;
  height: 352px;
  background: rgb(12, 12, 12);
  border-radius: 7px;
  overflow: hidden;
}

.titlebar {
  display: flex;
  height: 2rem;
  line-height: 2rem;
  text-align: left;
  background-color: rgb(33, 33, 33);
  overflow: hidden;
}

.tabs {
  display: flex;
}

.tab {
  color: rgb(150, 150, 150);
  font-size: 13px;
  padding: 0 10px;

  &:hover {
    background-color: lighten(rgb(33, 33, 33), 3);
    cursor: pointer;
    user-select: none;
  }

  &.active {
    color: white;
    background: rgb(12, 12, 12);
  }
}

.editor-content {
  padding: 20px;
}
</style>

<style lang="stylus">
.editor-content {
  color: rgb(195, 195, 195);

  pre {
    background-color: transparent;
    margin: 0;
    padding: 0;
  }
}
</style>
