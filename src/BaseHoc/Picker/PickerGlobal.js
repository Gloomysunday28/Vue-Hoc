import Toast from './Picker.vue'
import store from '@/store/store'
var inBrowser = typeof window !== 'undefined'
var raf = inBrowser
  ? window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : setTimeout
  : /* istanbul ignore next */ function (fn) { return fn(); };
var nextFrame = function(fn) {
  raf(fn)
}

export default function(Vue) {
  const {
    extend,
    warn
  } = Vue.util
  /**
   * @description 组装多个父子组件
   * @param {Object} component {component: xxx, attrs: {}, children}
   */
  let getMultipleComponent = function(createElement, componentChildren, pVNode) {
    componentChildren = Array.isArray(componentChildren) ? componentChildren : [componentChildren]

    componentChildren.forEach(componentConfig => {
      const {
        component,
        attrs = null,
        content,
        children
      } = componentConfig

      const vnode = createElement(component, attrs, content)
      if (pVNode) {
        const container = (pVNode.componentOptions || pVNode)
        ;(container.children || (container.children = [])).push(vnode)

        if (children) {
          const params = [children, vnode]
          getMultipleComponent.call(this, ...params)
        }
      }
    })

    return pVNode
  }

  const ToastCommand = function(Component, option, componentChildren) {
    option = option.attrs || option

    const ToastExtends = ToastCommand.create(Component, option);
    if (!ToastExtends) return void 0
    const createElement = ToastExtends && ToastExtends.$createElement
    ToastExtends.renderComponent = Component
    ToastExtends.currentOptions = { ...option }

    if (getMultipleComponent.length === 3) { // 函数重载
      getMultipleComponent = getMultipleComponent.bind(this, createElement)
    }

    if (componentChildren) {
      getMultipleComponent(componentChildren.children, vnode)
    }

    ToastCommand.show()
    return ToastExtends
  }

  /**
   * @author {Mr.Cai}
   * @description 工厂函数，每次调用的Toast都会实例化一个新的, 避免交叉污染
   */
  ToastCommand.create = function(Component, options) {
    if (this.ToastExtends) {
      warn(`
        There can only be one Toast component at a time,
        try to click with a gap of 0.5 seconds
      `, this.ToastExtends)
    }

    if (this.isMounted) return void 0

    this.el = document.createElement('div')
    return this.ToastExtends = new Vue({
      el: this.el,
      store,
      data() {
        return {
          duration: 0
        }
      },
      mounted() {
        /**
         * @description
         *  抛出问题
         *    1.为什么采用setTimeout去删除
         *    2.为什么需要在requestAnimationFrame里去取动画时间, 而不是在mounted直接可以获取?
         *  回答
         *    1. 使用监听transtionend会有一个问题:
         *        Vue本身在transition组件子节点里监听了transitionend(或者animationend)
         *        动画完成后就会删除掉transition class, 那么此时transition-property就会消失掉
         *        根据文档显示, transition-property消失后将不触发transition钩子函数，继而无法触发
         *        transitionend函数，导致remove可能会无法调用，留下之前的ToastConainer
         *    2. 父组件的mounted函数是在初始化渲染后就会调用,而Toast组件通过设置showStatus去触发transition的enter函数(虽然
         *       Toast组件mounted在之前就会被调用，但此时toast dom上不存在transition class)，此时由于触发的是data.setter函
         *       数，从而对Watcher进行派发更新，导致所有的操作都在nextTick(也就是微任务)里执行
         *       所以调用顺序是这样的:
         *          Toast组件Mounted -> 父组件Mounted(也就是现在所处的Mounted函数, 注意此时因为toast里的transition没有携带
         *          appear属性，导致transition enter函数不会触发，从而transition class不会被添加) -> nextTick()
         *          -> Toast组件update(v-show) -> transition(v-show触发enter函数) -> toast dom增加了transition类名
         *          -> window.getComputedStyle(toast)获取toastDuration
         *       我们也可以在nextTick里获取，介于transition active在动画全过程都会有，并且requestAnimationFrame属于浏览器
         *       重绘（painter）钩子函数，比微任务还要靠后执行，所以在这里获取
         *
         */
        nextFrame(() => {
          if (this.duration) return void 0
          const ToastInstance = this.$children[0]
          var transitionProp = 'transition';
          var styles = window.getComputedStyle(ToastInstance.$refs.toast);
          this.duration = this.duration || parseFloat((styles[transitionProp + 'Duration'] || '')) * 1000
        })
      },
      render(h) {
        return h(Toast, { props: options.wrapperProps, staticClass: 'm-toast moreZIndex' }, [
          h(Component, options)
        ])
      }
    })
  }

  /**
   * @author {Mr.Cai}
   * @description 展示Toast, 并且添加到Body最后面, 保持其层级为最高级
   */
  ToastCommand.show = function() {
    const ToastInstance = this.ToastExtends.$children[0]
    ToastInstance.showStatus = true

    this.isMounted = true
    this.tearDown = ToastInstance.$watch('showStatus', ToastCommand.hide.bind(ToastCommand)) // 点击遮罩层时需要监听hide函数去删除container
    document.body.appendChild(this.ToastExtends.$el)
  }

  ToastCommand.hide = function() {
    if (!this.ToastExtends) return void 0
    this.isMounted = false

    if (typeof (this.tearDown) === 'function') {
      this.tearDown() // 删除之前的watch监听
    }

    const {
      $children: [ToastInstance],
      duration
    } = this.ToastExtends

    // ToastInstance.maskClosed && ToastInstance.maskClosed()
    ToastInstance.showStatus = false
    this.timer = setTimeout(this.remove, duration)
  }

  /**
   * @param {Object} options 更新后的组件选项
   *  使用场景:
   *    Toast内部组件使用了Toast外部的Props，当外部props更新后，没有重新渲染内部组件
   *    该函数手动调用updateChildComponent函数
   *      第一个参数是之前的vnode
   *      第二个参数是新的vnode
   */
  ToastCommand.updateChildrenComponent = function(options) {
    const {
      ToastExtends
    } = this

    const {
      renderComponent: pvnodeComponent
    } = ToastExtends

    const wrapperToastComponent = ToastExtends.$children[0]
    const renderVnode = wrapperToastComponent.$children[0].$vnode
    const currentOptions = ToastExtends.currentOptions
    currentOptions.on = renderVnode.componentInstance.$options._parentListeners
    for (let key in options) { // 合并配置项
      if (typeof options[key] === 'object') {
        extend(currentOptions[key], options[key])
      } else {
        currentOptions[key] = options[key]
      }
    }

    renderVnode.data.hook.prepatch(renderVnode, ToastExtends.$createElement(pvnodeComponent, currentOptions))
  }

  /**
   * @author {Mr.Cai}
   * @description 清空所有的实例以及监听
   */
  ToastCommand.remove = function() {
    if (this.isMounted) return this.hide()
    this.ToastExtends && document.body.removeChild(this.ToastExtends.$el)
    clearTimeout(this.timer)
    this.timer = this.ToastExtends = null
  }.bind(ToastCommand)
  /**
   * @author {Mr.Cai}
   * @description 清空所有的实例以及监听
   */
  ToastCommand.setKey = function(key) {
    ToastCommand.ToastExtends.key = key
    ToastCommand.ToastExtends.$forceUpdate()
  }

  Vue.prototype.$toast = ToastCommand
}
