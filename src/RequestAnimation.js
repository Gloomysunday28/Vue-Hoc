const requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame
let f = ~~(Math.random() * 22) + 100
const RequestAnimationFunc = function(cm, renderTime = 20) {
  // let speed = Math.ceil(+this.finallyData / renderTime)
  // if (cm.text >= this.finallyData) {
  //   cm.text = this.finallyData
  //   console.log('gggg', cm.text);
  //   return void cancelAnimationFrame(RequestAnimationFunc)
  // }
  cm.innerHTML= Math.random() * 5 + 1000
  // requestFrame(RequestAnimationFunc.bind(this, ...arguments))
}


export default {
  name: 'RequestAnimation',
  abstract: true,
  props: {
    renderTime: {
      type: [String, Number],
      default: 20,
      required: false
    }
  },
  filters: {
    ff() {
      return 11
    }
  },
  data() {
    return {
      finallyData: 0
    }
  },
  render() {
    const vnode = this.$slots.default

    if (vnode.length > 1) throw new Error(`
      Only One Root Element Can Be Render, from Component ${this.$options.name}
    `)

    if (!vnode[0].children) throw new Error(`
      Please variable in the root element, from Component ${this.$options.name}
    `)
    for (let c of vnode[0].children) {
      this.finallyData = f
      console.log(this.finallyData);
      c.text = this.finallyData
    }

    console.log(vnode);

    return vnode[0]
  }
}