<script>
  export default {
    name: 'GmTabs',
    inheritAttrs: false,
    props: {
      active: {
        type: [Number, String],
        required: false,
        default: '0'
      },
      showGap: {
        type: Boolean,
        required: false,
        default: false
      },
    },
    data() {
      return {
        isSameTab: true, // 是否点击同一个tab
        showLoading: false, // 数据是否正在请求
        prevIndex: null, // 前一个tab
      }
    },
    render(h) {
      this.tabsLine = h('div', {
        class: 'tabs_line'
      })
      const slots = this.$slots.default || []
      const slotHeaders = this.$slots.header || []
      const slotExtra = this.$slots.extra || []
      const slotNewLine = this.$slots.newline || []
      slots.forEach((slot, index) => {
        const showLoading = this.prevIndex === index && this.showLoading && this.isSameTab
        const componentOptions = slot.componentOptions || {}
        if (slot.componentOptions && !slot.header) {
          ;(slot.componentOptions.listeners || (slot.componentOptions.listeners = {}))['change-active'] = this.setTabLinePlace
          if (this.$listeners.getLists) {
            slot.componentOptions.listeners.getLists = this.$listeners.getLists
          }
          const attrs = {...this.$attrs}
          slot.componentOptions.propsData = Object.assign(attrs, slot.componentOptions.propsData) // 将gm-tabs的props全数传给gm-tab
        }

        if (componentOptions.propsData) {
          const header = (componentOptions.children || []).find(vnode => (vnode.data || {}).slot === 'header') || null

          slot.header = h('div', {
            class: ['tab_header'],
            on: {
              'click': () => this.setTabLinePlace(slot.data.key, 'changeTab')
            }
          }, [h('div', {
            class: 'tab_header_content'
          }, ([header || (componentOptions.propsData || {}).title || '']).concat(
            showLoading ? h('div', { class: 'tab_header--circle' }, null) : null
          ))])
        }
      })
      
      const slotsHeaders = slotHeaders.concat(slots.map((v, index, array) => [...[v.header].concat(this.showGap && index < array.length - 1 ? h('div', {
        staticClass: 'tab_gap'
      }) : null)])).concat(slotExtra)

      return h('div', {
        class: 'tabs_container'
      }, [
        h('div', {
          staticClass: 'tabs_headers__container'
        }, [
          h('div', {
            class: 'tabs_headers'
          }, slotsHeaders.concat(this.tabsLine)), 
          slotNewLine
        ]),
        slots
      ])
    },
    mounted() {
      this.$vnode.data.isTabs = true
      this.$nextTick().then(() => this.setTabLinePlace(this.active))
      this.$slots.default.forEach(slot => {
        const componentOptions = slot.componentOptions || {}
        if (componentOptions.tag === 'gm-tab') {
          this.$refs[slot.data.key] = slot.componentInstance
        }
      })

      const teardown = this.$watch('active', (n, v) => {
        this.$nextTick(() => {
          this.setTabLinePlace(n)
          teardown()
        })
      })
    },
    updated(){
      this.$vnode.data.isTabs = true
    },
    methods: {
      refreshBS(currentData) {
        this.$nextTick().then(() => {
          const ref = this.$refs
          for (let key in ref) {
            const tabContent = ref[key]
            if (tabContent && tabContent.container) {
              if (currentData.finish) tabContent.endLists()
              tabContent.container.refresh()
            }
          }
        })
      },
      closeLoading(time) {
        var timer = setTimeout(() => {
          clearTimeout(timer)
          timer = null
          this.showLoading = false
          this._watchers.forEach(watcher => watcher.update())
        }, time)
      },
      initBetterScroll() { // 初始化所有的tab的BS条件
        for (let key in this.$refs) {
          const ref = this.$refs[key]
          ref.page = 1
          if (ref.$refs.bs) {
            ref.$refs.bs.finish = false
          }
        }
      },
      refreshTabContent() {
        this.showLoading = true
        Promise.resolve(this.$listeners.getLists.fns(1)).then(() => {
          const ref = this.$refs[this.active]
          if (this.$attrs.betterScroll) {
            ref.page = 1
            if (ref.$refs.bs) {
              ref.$refs.bs.finish = false
            }
          }
          this.closeLoading(500)
        })

        this.closeLoading(100000)
      },
      setTabLinePlace(n = this.active, prev, init/* tab组件在获取完内容宽度时会再次触发该函数, 该标志用于识别该场景 */) { // 切换tab时底部
        const slots = this.$slots.default || []
        let index = slots.findIndex(comp => (comp.data || {}).key === n)
        if (!~index) return void 0
        this.isSameTab = false
        const currentSlot = (slots[index] || {})
        if (this.prevIndex === index && !init) { // 当点击同一个会返回顶部
          this.isSameTab = true
          if ((this.$attrs || {}).returnTop) {
            const returnTop = (((currentSlot.componentInstance || {}).returnTopRef || {}).componentInstance || {})
            if ((returnTop.scrollTop !== void 0 && returnTop.scrollTop <= 10) || returnTop.scrollTop === void 0) {
              !this.showLoading && this.refreshTabContent(currentSlot)
            }
          }
          return void 0
        }
        const prevSlotInstance = (slots[this.prevIndex] || {})
        const { boundLeft, width } = currentSlot.componentInstance || {}
        if (!init) {
          if (index > this.prevIndex) {
            ;(currentSlot.componentInstance || {}).animate = 'slide-right'
            ;(prevSlotInstance.componentInstance || {}).animate = 'slide-left'
          } else {
            ;(currentSlot.componentInstance || {}).animate = 'slide-left'
            ;(prevSlotInstance.componentInstance || {}).animate = 'slide-right'
          }

          ;(currentSlot.componentInstance || {}).active = true
          ;(prevSlotInstance.componentInstance || {}).active = false
        }
        this.tabsLine.elm.style.width = `${width}px`
        this.tabsLine.elm.style.transform = `translate3d(${boundLeft}px, 0, 0)`
        if (width) this.isCompleted = true
        if ((this.$options._parentListeners || {}).change && prev && !init) {
          this.$emit('change', n, (prevSlotInstance.data || {}).key)
        }
        this.showLoading = false
        this.prevIndex = index
      }
    },
  }
</script>

<style scoped lang="scss">
  .tabs_container {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
  }
  .tabs_line {
    position: absolute;
    bottom: 0;
    background: $primary;
    height: .04rem;
    border-radius: .04rem;
    overflow: hidden;
    transition: all .3s ease-in-out;
  }
  .tabs_headers {
    position: relative;
    width: fit-content;
    will-change: color;
    transition: color .3s;
    display: flex;
    align-items: center;
    width: 100%;
    overflow-x: auto;
    background: #fff;
    box-shadow: 0 0 -.15rem #f2f2f2;
    .tab_gap {
      width: .01rem;
      background: #979797;
      height: .25rem;
    }
    .tab_header {
      min-height: .8rem;
      flex: 1;
      min-width: 25%;
      margin: 0 .2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color .3s ease-in-out;
      &.tab_header--active {
        font-family: PingFangSC-Semibold, PingFang SC;
        color: $primary;
        font-weight: bold;
      }
      .tab_header_content {
        position: relative;
        display: flex;
        align-items: center;
        width: fit-content;
      }
      .tab_header--circle {
        position: absolute;
        right: -.35rem;
        top: .12rem;
        width: .22rem;
        height: .22rem;
        margin-left: 10px;
        border: .02rem solid $primary;
        border-radius: 100%;
        border-left: none;
        border-top: none;
        animation: circle .5s linear infinite;
      }
    }
  }
</style>