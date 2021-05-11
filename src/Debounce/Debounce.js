const debounce = (fn, wait, immediate) => {
  let timer = null
  fn = Array.isArray(fn) ? fn : [fn]
  return function() {
    if (timer) clearTimeout(timer)
    if (immediate) { // 与普通防抖区别， 此属性是在持续触发的时间段内只有第一次才会执行， 普通防抖是在最后一次执行后过一段时间执行
      timer = setTimeout(() => {
        timer = null
      }, wait)

      if (!timer) {
        fn.forEach(realFn => {
          realFn && realFn.call(this, ...arguments)
        })
      }
      return
    }

    timer = setTimeout(() => {
      fn.forEach(realFn => {
        realFn && realFn.call(this, ...arguments)
      })
    }, wait)
  }
}

export default {
  name: 'Debounce',
  abstract: true,
  props: {
    delayTime: {
      type: [String, Number],
      default: 300,
      required: false
    },
    exclude: {
      type: [Array, String],
      default: '',
      required: false
    }
  },
  render() {
    const vnode = this.$slots.default || []
    if(!vnode.length) return this.base.util.warn('Please set a outside div in this slot', this.$vnode)
    if (vnode) {
      for (let v of vnode) {
        if (!v.data.on) break
        for (let eve in v.data.on) {
          v.data.on[eve] = debounce(v.data.on[eve], this.delayTime)
        }
      }
    }

    return vnode[0]
  }
}

