import React from 'react'
import styles from './assets/scss-styles.module.scss'
import indexStyles from './assets/index.module.scss'

export default () => (
  <div>
    <p className={styles.scssModulesInclusion}>SCSS Modules are working!</p>
    <p className={indexStyles.scssModulesIndexInclusion}>
      SCSS Modules with index are working!
    </p>
  </div>
)
