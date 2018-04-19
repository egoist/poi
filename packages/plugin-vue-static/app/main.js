import Vue from 'vue'
import Meta from 'vue-meta'

Vue.use(Meta, {
  keyName: 'head',
  attribute: 'data-vs-meta',
  ssrAttribute: 'data-vs-rendered',
  tagIDKeyName: 'vsid'
})
