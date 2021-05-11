export default {
  name: 'InsertParent',
  abstract: true,
  props: {
    condition: {
      type: Boolean,
      default: false,
      required: false
    },
    classname: {
      type: [Object, String],
      default: '',
      required: false
    }
  },
  render(h) {
    if (this.condition) {
      const defaultVnode = this.$slots.default.slice()
      const parentNode = this.$slots.parent || []
      defaultVnode.forEach((vnode, i) => {
        parentNode.forEach(pNode => {
          const index = ((vnode.data || {}).attrs || {})['data-index']
          const pNodeCondition = pNode.componentOptions ? pNode.componentOptions.listeners.condition : pNode.data.on.condition
          
          if (pNodeCondition(index)) {
            const children = pNode.componentOptions ? pNode.componentOptions : pNode
            ;(children.children || (children.children = [])).push(vnode)
            defaultVnode[i] = null
          }
        })
      })

      return h('div', {
        class: this.classname,
      }, [parentNode, ...defaultVnode.filter(Boolean)])
    } else {
      var vnode = this.$slots.default.slice(-1)[0]
      const [parentNode] = this.$slots.parent || []
      let realParentNode = parentNode
      while (this.$hoc_utils.getAbstractComponent(realParentNode)) { // 判断是否是抽象组件
        realParentNode = (parentNode.children || parentNode.componentOptions.children || [])[0]
      }

      if (realParentNode) {
        const container = realParentNode.componentOptions || realParentNode
        ;(container.children || (container.children = [])).push(vnode)
    
        return parentNode // 始终返回最顶级的vnode，保证功能正常
      }
    }
  
    return vnode
  }
}
