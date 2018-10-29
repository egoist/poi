<template>
  <h1>{{ text }}, {{ name }} is {{ age }} yo</h1>
</template>

<page-data>
module.exports = () => {
  const users = {
    egoist: {
      name: 'EGOIST',
      age: 24
    },
    cristiano: {
      name: 'Cristiano Ronaldo',
      age: 33
    }
  }

  return {
    text: 'hello world',
    $pages: users
  }
}
</page-data>