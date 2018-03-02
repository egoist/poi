function getFullEnvString(env) {
  return Object.keys(env).reduce((res, key) => {
    res[`process.env.${key}`] = env[key]
    return res
  }, {})
}

module.exports = getFullEnvString
