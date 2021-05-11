/**
 * @author Mr.Cai
 * @description 装饰者模式， 在执行真正的函数之前, 需要验证某些东西，只有通过后才可以执行真正需要执行的函数
 * @param {Function} beforeFn 
 * @param {Function} realFn 
 */

const decorate = (beforeFn, realFn) => {
  return function(...arg) {
    const result = beforeFn.call(this, ...arg)
    if (result) return realFn(result)
  }
}

export default {
  name: 'Decorate',
  abstract: true,
  props: {
    required: { // 枚举装饰模式所需要处理的事件名称
      type: [Array, String],
      required: false,
      default: ''
    },
    deepDecorate: { // 是否深度遍历子节点进行装饰
      type: Boolean,
      required: false,
      default: false
    },
  },
  methods: {
    returnTrue() {
      return true
    },
    /**
     * @author Mr.Cai
     * @param { String } key 检验key是否是属于指定的
     * @returns { String }
     */
    checkRequired(key) {
      if (this.required) {
        if ((Array.isArray(this.required) && this.required.includes(key)) || this.required === key) {
          return key
        }
      } else return key
    },
    decorateBefore(vnode) {
      if (vnode) {
        if (vnode[0].componentOptions && vnode[0].componentOptions.tag === 'keep-alive') {
          vnode = vnode[0].componentOptions.children
        }

        for (let v of vnode) {
          const children = v.children
          if (children && this.deepDecorate) {
            this.decorateBefore(children)
          }

          if(!v.data) continue
          if (!v.data.on && !(v.componentOptions || {}).listeners) break

          const beforeFn = this.$options._parentListeners.before || this.returnTrue
          const listener = v.data.on || (v.componentOptions || {}).listeners || {}

          if (this.required && !listener[this.required]) break // 判断如果存在指定函数，并且没被定义则跳出

          for (let eve in listener) {
            const events = this.checkRequired(eve)
            if (!events) continue
            listener[events] = decorate(beforeFn, listener[events])
          }
        }
      }
    }
  },
  render() {
    let vnode = this.$slots.default || []
    if(!vnode.length) return this.$hoc_utils.warn$1('Please set a outside div in this slot', this)
    
    this.decorateBefore(vnode)
    return vnode[0]
  }
}
