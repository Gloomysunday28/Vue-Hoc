const hocUtils = Vue => ({
  warn$1: Vue.util.warn,
  extend$1: Vue.util.extend,
  defineReactive$1: Vue.util.defineReactive,
  /**
   * @description 判断是否是抽象组件
   * @param {Object} vnode 
   */
  getAbstractComponent(vnode) {
    return vnode && vnode.componentOptions && vnode.componentOptions.Ctor.options.abstract
  }
})

export default {
  install(Vue) {
    Vue.prototype.$hoc_utils = hocUtils(Vue)
  }
}
