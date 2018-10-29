<template>
  <h1>hello {{ text }}</h1>
</template>

<page-data>
module.exports = () => ({
  text: 'world'
})
</page-data>