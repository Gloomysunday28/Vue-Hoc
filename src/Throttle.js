const throttle = (fn, mustRun) => {
  let timer = null
  let oldTime = +new Date()
  
  return function() {
    let newTime = +new Date()

    if (timer) clearTimeout(timer)

    timer = setTimeout(() => {
      fn && fn.call(this, ...arguments)
    }, mustRun)

    if (newTime - oldTime > mustRun) {
      fn && fn.call(this, ...arguments)
      oldTime = newTime
    }
  }
}

export default {
  name: 'Throttle',
  abstract: true,
  render() {
    const vnode = this.$slots.default
    if(!vnode.length) return console.error('Please set a outside div in this slot')
    
    if (vnode) {
      for (let v of vnode) {
        if (!v.data.on) break
        for (let eve in v.data.on) {
          v.data.on[eve] = throttle(v.data.on[eve], 300)
        }
      }
    }

    return vnode[0]
  }
}

