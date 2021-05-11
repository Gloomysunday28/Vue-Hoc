import BetterScroll from 'better-scroll'
import DataEmpty from 'components/DataEmpty'

export default {
  name: 'BetterScroll',
  abstract: true,
  props: {
    finishParam: {
      type: String,
      required: false,
      default: 'finish',
    },
    pageParam: {
      type: String,
      required: false,
      default: 'page',
    },
    showWarn: {
      type: Boolean,
      required: false,
      default: false,
    },
    forceInject: {
      type: Boolean,
      required: false,
      default: true,
    },
    invade: {
      type: Boolean,
      required: false,
      default: false,
    },
    context: {
      type: [Object, Boolean],
      required: false,
      default: false
    },
  },
  data() {
    return {
      refreshTimer: null,
      refresh: false,
      circleR: 0,
      viewSvg: 0,
      progress: 0,
      loadingText: '下拉即可刷新...',
      loading: false,
      page: 1,
      finish: false,
      container: Object.freeze({}),
      containerRefs: null,
      injection: [void 0, 'container' ,'endLists', 'scrollTo', 'initBSData'],
      loadingTip: null,
    }
  },
  created() {
    const circleR = this.dpr * .25
    this.circleR = circleR * .9
    this.viewSvg = circleR * 2
    this.progress = 2 * Math.PI * this.circleR
  },
  computed: {
    parentInstance() {
      return this.$vnode.context
    },
    isKeepAlive() {
      return this.$parent.$vnode.data.keepAlive
    },
    VueTool() {
      return this.base.util
    }
  },
  methods: {
    defineReactiveData(param = 'page', customerSetter) {
      const context = this.context || this.$parent
      if (context && context[param] && this.showWarn) {
        return void this.VueTool.warn('The parent already has the same data, to avoid injecting the same data, please change the field', this)
      }

      if (this.forceInject || (!this.forceInject && !context[param])) {
        Object.defineProperty(context, param, {
          get: () => {
            return this[param]
          },
          set: (value) => {
            console.log('value', value)/* 2021年01月18日 11时05分33秒 */
            if (this.invade) return this[param] = value
            this.VueTool.warn(customerSetter || 'Avoid Set Data', this)
          }
        })
      }
    },
    getContainer() {
      return this.containerRefs = this.$refs.bsContainer
    },
    // 注入beforeRouteLeave函数
    beforeRouteLeave(to, from, next) {
      if (to.meta.recordScroll) {
        window.sessionStorage.setItem('bsScroll', this.container.scrollTop)
      } else {
        window.sessionStorage.removeItem('bsScroll')
      }
      
      if (this.refresh) this.refresh = false
      
      if (this.loadingTip) {
        this.loadingTip.removeEventListener('animationend', this.disappearLoading)
      }
      next(this.$listeners.beforeLeave ? this.$listeners.beforeLeave() : true)
    },
    scrollTo(x = 0, y = window.sessionStorage.bsScroll) {
      this.$nextTick().then(() => {
        this.container.refresh()
        this.container.scrollTo(x, y)
      })
    },
    endLists() {
      this[this.finishParam] = true
    },
    disappearLoading() {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
      this.refresh = false
    },
    /**
     * @description
     *  上拉加载与下拉更新基本是一样的用法，除了最后的恢复函数以及中间的page更改
     *  那么就可以抽离出公告部分，并暴露出函数执行时机去做一些不同的事情
     *  Generator正好符合这个场景
     * @param {*} methods 
     */
    * pullOrPush(methods) {
      const { getList } = this.$listeners
      const finish = this[this.finishParam]
      if (!getList || this.loading || finish) {
        return void methods()
      }
      this.loading = true
      this[this.finishParam] = false
      this.loadingText = '加载中...'
      yield 'next' // 暴露出函数调用位置，在getList之前做其他事
      yield getList.fns ? getList.fns(this[this.pageParam]) : getList(this[this.pageParam])// 等待getList请求回数据后会再次执行
      this.loading = false
      methods()
      this.container.refresh()
    },
    initBSData() {
      if (this[this.pageParam] > 1) {
        this[this.pageParam] = 1
      }

      this[this.finishParam] = false
      return true
    }
  },
  watch: {
    pageParam(pageParam) {
      if (this[pageParam]) return
      this[pageParam] = 1
      this.defineReactiveData(pageParam)
      this.getContainer()
    },
    finishParam: {
      handler(finishParam) {
        if (this[finishParam] !== void 0) return
        this[finishParam] = false
        this.defineReactiveData(finishParam)
        this.getContainer()
      },
      immediate: true
    }
  },
  render(h) {
    const slot = this.$slots.default || []
    const {
      viewSvg,
      circleR
    } = this

    const dymicClass = this.loadingText.startsWith('释放') || this.loading ? {
      arrowClass: 'm-bs__arrow--rotate'
    } : {}
    
    // 下拉刷新loading
    const loadSvg = h(
      'div', 
      {
        staticClass: 'm-bs__loading__container',
      }, 
      [
        h(
          'div',
          {
            staticClass: 'm-bs__loading'
          },
          [h(
            'svg',
            {
              staticClass: 'm-bs__loading__svg',
              class: this.loading && 'm-bs__circle--rotate',
              attrs: {
                view: `0 0 ${viewSvg} ${viewSvg}`,
                width: viewSvg,
                height: viewSvg
              }
           },
           [h(
             'circle',
             {
              staticClass: 'm-bs__circle',
              attrs: {
                r: circleR,
                cx: viewSvg / 2,
                cy: viewSvg / 2,
                stroke: '#ccc',
                fill: 'transparent',
                'stroke-dasharray': 2 * Math.PI * circleR,
                'stroke-dashoffset': this.progress,
                'stroke-width': 5
              }
             })
          ]
        ), 
        h(
          'i', {
            staticClass: 'iconfont icon-back-arrow',
            class: dymicClass.arrowClass
          }
        )], 
      ),
      h(
        'span',
        {
          staticClass: 'm-bs__loading__text',
        },
        this.loadingText
      )
    ])
    
    const refreshTip = this.refresh ? h('div', {
      staticClass: 'm-bs__loading__tip'
    }, '数据刷新成功') : void 0

    // 取消v-for情况下ref为数组的情况
    ;(slot).forEach(vnode => (vnode.data || {}).refInFor = false)
    return h('div', {
      staticClass: 'm-bs__container',
      ref: 'bsContainer'
    }, [h('div', {
      staticClass: 'm-bs__content'
    }, slot.concat([loadSvg].concat(refreshTip)))])
  },
  mounted() {
    const container = this.getContainer()
    const matched = this.$route.matched.slice(-1)[0]
    // 在这里因为现在的matched.components都是已经经过Vue.extend处理后的components, 内部已经具有_Ctor属性，vue-router是通_Ctor.options去取出对应的钩子函数，这里只能通过改变_Ctor的options, _Ctor中缓存了以Vue.cid为key的组件方法
    const Ctor = matched.components.default._Ctor[this.base.cid]
    Ctor.options = this.VueTool.mergeOptions(Ctor.options, {
      beforeRouteLeave: this.beforeRouteLeave
    })
    
    const threshold = 2 * Math.PI * this.circleR
    if (container) {
      this.container = new BetterScroll(container, {
        startY: 100,
        scrollX: false,
        click: true,
        probeType: 3,
        pullDownRefresh: {
          threshold,
          stop: threshold * .5
        },
        pullUpLoad: true
      })

      this.container.on('scroll', pos => {
        this.container.scrollTop = pos.y
        if (pos.y < threshold * .9 && pos.y > 0 && !this.loading) {
          this.loadingText = '下拉即可刷新...'
          this.progress =  threshold - pos.y
        }
        if (pos.y >= threshold * .9 || this.loading) {
          if (!this.loading) {
            this.loadingText = '释放即可刷新...'
          }
          this.progress = threshold * .1
        }
      })

      this.container.on('pullingDown', async () => {
        const pull = this.pullOrPush(() => {
          this.container.finishPullDown()
          if (this.refresh) return void 0
          this.refresh = true
          this.$nextTick(() => {
            this.loadingTip = document.getElementsByClassName('m-bs__loading__tip')[0]
            this.loadingTip.addEventListener('animationend', this.disappearLoading)
          })
        })
        this[this.finishParam] = false
        const { value: goNext } = pull.next()
        if (!goNext) return void 0
        this.refreshTimer && clearTimeout(this.refreshTimer)
        if (this.pageParam) {
          this[this.pageParam] = 1
        } else this.page = 1
        const { value: getData = {} } = pull.next()
        getData.then ? getData.then(pull.next.bind(pull)) : pull.next()
      })

      this.container.on('pullingUp', async () => {
        const push = this.pullOrPush(() => this.container.finishPullUp())
        const { value: goNext } = push.next()
        if (!goNext) return void 0
        if (this.pageParam) {
          this[this.pageParam]++
        } else this.page++
        setTimeout(() => {

        }, 300)
        const { value: getData = {} } = push.next()
        getData.then ? getData.then(push.next.bind(push)) : push.next()
      })

      // 往父级注入betterscroll的方法属性
      this.injection.forEach(this.defineReactiveData)
    }
  }
}
