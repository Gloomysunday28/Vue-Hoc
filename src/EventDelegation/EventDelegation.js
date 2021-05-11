const EventDelegation = (eTagName, fn) => {
  return function(e) {
    let target = e.target
    while (target && target.parentNode && !target.classList.contains(eTagName)) {
      target = target.parentNode
    }
    
    if (target.nodeType === 1 && target.classList.contains(eTagName)) {
      fn && fn.call(this, { target }, ...arguments)
    }
  }
}

export default {
  name: 'EventDelegation',
  abstract: true,
  props: {
    debounce: {
      type: Boolean,
      default: false,
      required: false
    },
    transition: {
      type: Object,
      default: () => ({}),
      required: false
    },
    eTagName: {
      type: String,
      default: '',
      required: true
    }
  },
  render(h) {
    let vnode = this.$slots.default[0]
    
    while(this.$hoc_utils.getAbstractComponent(vnode)) {
      vnode = (vnode.children || vnode.componentOptions.children || [])[0]
    }

    if (vnode) {
      if (!vnode.data.on) return vnode
      if (this.debounce) {
        vnode = h('Debounce', null, [vnode])
      }

      for (let eve in vnode.data.on) {
        vnode.data.on[eve] = EventDelegation(this.eTagName, vnode.data.on[eve])
      }
    }

    if (Object.keys(this.transition).length) { // 替代transition组件
      vnode.data.transition = this.transition
    }
    return vnode
  }
}
