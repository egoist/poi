exports.consoleMessageToLogArgs = async message => {
  const args = message.args()

  const jsonArgs = await Promise.all(args.map(arg => arg.jsonValue()))

  // Clean-up to enable garbage collection
  args.forEach(arg => arg.dispose())

  return jsonArgs
}

exports.filterLogs = (type, args) => {
  if (type !== 'info') return args

  const isReactDevtoolLog = args.some(arg => {
    return arg.includes('Download the React DevTools')
  })

  if (isReactDevtoolLog) {
    return []
  }

  return args
}
