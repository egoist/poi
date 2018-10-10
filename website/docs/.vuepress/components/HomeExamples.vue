<template>
  <div class="home-examples columns">
    <div class="column">
      <EditorWindow :files="files" />
    </div>
    <div class="column">
      <BrowserWindow address="http://localhost:4000">
        <h1 :class="$style.title">Hello Poi!</h1>
      </BrowserWindow>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      files: [
        {
          name: 'index.js',
          code: `import styles from './style.module.css'

const el = document.createElement('div')
el.className = styles.title
el.textContent = 'Hello Poi!'

document.body.appendChild(el)`,
          lang: 'javascript'
        },
        {
          name: 'style.module.css',
          code: `.title {
  font-size: 2rem;
  font-style: italic;
  margin: 0;
}`,
          lang: 'css'
        }
      ]
    }
  }
}
</script>

<style lang="stylus" scoped>
.columns {
  margin: 0 -1.5rem;
}

.column {
  flex: 1;
  padding: 0 1.5rem;
}

.home-examples {
  display: flex;
  margin-top: 80px;
  margin-bottom: 40px;
}

@media screen and (max-width: 768px) {
  .home-examples {
    flex-direction: column;
  }

  .column {
    margin-bottom: 1.5rem;
  }
}
</style>

<style module>
.title {
  font-size: 2rem;
  font-style: italic;
  margin: 0;
}
</style>
