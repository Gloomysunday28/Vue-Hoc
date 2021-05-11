import Vue from 'vue'

export default {
  name: 'ChangeTag',
  abstract: true,
  props: {
    tag: {
      type: String,
      default: null,
      required: false,
    }
  },
  render() {
    const vnode = this.$slots.default
    
    if (!vnode.length) return Vue.util.warn(`
      Check Your Code For <${this.$options._componentTag}> Children is Empty
    `)

    if (vnode.length > 1) return Vue.util.warn(`
      Check Your Code For <${this.$options._componentTag}> Children is Mulitle, It's Only for One root
    `)

    const childComponents = vnode[0].componentOptions && vnode[0].componentOptions.children

    if (this.tag) {
      if (Array.isArray(childComponents)) {
        for (let opt of childComponents) {
          opt.tag = this.tag
        }
      } else {
        vnode[0].tag = this.tag
      }
    }

    return vnode[0]
  }
}

