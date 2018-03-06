async function foo() {
  const res = await bar()
  return res
}

const bar = async () => {
  return 'bar'
}
