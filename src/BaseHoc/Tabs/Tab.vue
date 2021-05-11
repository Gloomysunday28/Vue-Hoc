<script>
import ReturnTop from 'components/ReturnTop'
import DataEmpty from 'components/DataEmpty'
export default {
	name: 'GmTab',
	props: {
		returnTop: { // 是否显示回滚到顶部
			type: Boolean,
			required: false,
			default: false,
		},
		loopupScroll: { // 是否监听滚动到底部
			type: Boolean,
			required: false,
			default: false,
		},
		dataEmpty: { // 监听内容是否存在
			type: [Boolean, String],
			required: false,
			default: false,
		},
		hasContent: { // 是否具有内容
			type: Boolean,
			required: false,
			default: true,
		},
		emptyLength: { // 监听内容是否存在
			type: [Number, String],
			required: false,
			default: 0,
		},
		thread: {
			type: [String, Number],
			required: false,
			default: 500
		},
		title: { // tab头部的标题
			type: [String],
			required: false,
			default: '',
		},
		betterScroll: {
			type: Boolean,
			required: false,
			default: false,
		},
		containerRef: { // tab头部的标题
			type: [HTMLElement, Object],
			required: false,
			default: () => null,
		},
		finishParam: {
			type: Boolean,
			required: false,
			default: false,
		}
	},
	components: {
		ReturnTop,
		DataEmpty
	},
	data(vm) {
		return {
			animate: 'slide-in',
			active: false,
			width: 0,
			boundLeft: 0,
			scrollTop: 0,
			realContainer: this.containerRef,
			showReturnTop: false,
			excuteListener: false,
			dataEmptychildren: vm.$createElement(DataEmpty, {
				...typeof vm.dataEmpty === 'string' && {
					props: {
						emptyImage: vm.dataEmpty
					}
				},
			}),
		}
	},
	created() {
		this.tabContent = Object.freeze(null)
		this.bs = Object.freeze(null)
		this.returnTopRef = Object.freeze(null)
	},
	mounted() {
		this.$vnode.data.isTab = true
		this.getBaseInfo()
		if (this.betterScroll) {
			setTimeout(() => {
				this.container.refresh()
			}, 1000)
			this.$nextTick(() => {
				this.$refs.bs = this.bs.componentInstance
			})
		}
	},
	updated(){
		this.$vnode.data.isTab = true
	},
	render(h) {
		const { Transition } = this.$root.$options.components
		if (this.returnTop) {
			this.returnTopRef = h(this.$options.components.ReturnTop, {
				props: {
					el: this.realContainer,
				}
			})
		}
		const slots = [(this.$slots.default || []).concat(this.returnTop && this.realContainer && this.showReturnTop ? this.returnTopRef : null).concat(this.hasContent ? null : this.dataEmptychildren)]

		if (this.betterScroll) {
			this.bs = h(this.$options.components['better-scroll'],
			{
				props: {
					invade: true,
					context: this,
				},
				on: {
					getList: this.$listeners.getLists.fns
				}
			}, [h('div', null, slots)])
		}
		this.tabContent = h(
			'div',
			{
				class: `tab_content`,
				attrs: {
					isTab: true
				},
				directives: [{
					name: 'show',
					value: this.active
				}]
			},
			[
				this.betterScroll ? this.bs
				:
				slots
			]
		)
		return h(
			Transition,
			{
				props: {
					name: this.animate,
					appear: true
				},
			},
			[this.tabContent]
		)
	},
	methods: {
		getBaseInfo() {
			setTimeout(() => {
				const textContainer = this.$vnode.header ? this.$vnode.header.children[0].elm : null
				this.boundLeft = textContainer.offsetLeft
				this.width = textContainer.getBoundingClientRect().width
				if (textContainer) {
					this.$nextTick().then(() => {
						const index = this.getTabsDeepIndex()
						const headerContainer = document.querySelectorAll('.tabs_headers__container')[index]
						const tabContent = this.tabContent.elm
						if (headerContainer) {
							const topLimit = headerContainer.clientHeight
							tabContent.style.top = topLimit + 'px'
						}

						this.$listeners['change-active'].fns(void 0, 'changeTab', true) // fns是真正我们传入的函数
					})
				} else {
					this.$hoc_utils.warn$1('GMTab need title property.')
				}
		
				if (!this.realContainer) {
					this.addEventListenerScroll()
				}
			}, 0)
		},
		getTabsDeepIndex(vnode = this.$vnode, index = -1) { // 获取当前gm-tabs的嵌套层级, 与route-view的渲染模式类似
			const { isTab, isTabs } = vnode.data || {}
			let isTabComponent = isTab || isTabs
			if (isTabComponent) {
				vnode = vnode.componentInstance.$parent.$vnode
				return this.getTabsDeepIndex(vnode, isTabs ? index + 1 : index)
			}

			return index
		},
		addEventListenerScroll(container) {
			this.$nextTick().then(() => {
				this.realContainer = container || this.tabContent.elm
				if ((this.loopupScroll || this.returnTop) && this.realContainer) {
					if (container) {
						this.realContainer.onscroll = this.loadData()
					} else {
						this.realContainer.addEventListener('scroll', this.loadData(), {
							passive: true
						})
					}
				}
			})
		},
		loadData() {
			return this.$utils.debounce((e) => {
				const contain = e.target
				const st = contain.scrollTop
				if (this.returnTop) {
					this.showReturnTop = st > this.thread
				} 
				if (this.loopupScroll) {
					const h = contain.clientHeight
					const sh = contain.scrollHeight
					if (h + st + 300 > sh) {
						this.$listeners.getLists()
					}
				}
			}, 300, false)
		},
		setScrollTop(n) { // 记录当前tabContent的scrollTop, 方便下次回来回显
			let elm = this.realContainer
			if (!elm) return void 0
			if (!n) {
				this.scrollTop = elm.scrollTop
			} else {
				elm.scrollTop = this.scrollTop
			}
		},
		setActiveTabContent(n) {
			this.$vnode.header.elm.classList[n ? 'add' : 'remove']('tab_header--active')
			setTimeout(() => {
				if (this.container) {
					this.container.refresh()
				}
			}, 500)
			this.setScrollTop(n)
		}
	},
	watch: {
		active: 'setActiveTabContent',
		containerRef: 'addEventListenerScroll'
	},
}
</script>

<style scoped lang="scss">
.tab_content {
	position: absolute;
	background: #fff;
	top: .84rem;
	bottom: 0;
	left: 0;
	right: 0;
	margin: auto;
	overflow-y: auto;
	-webkit-overflow-scrolling: touch;
	@include setIphoneXBarSize(bottom);
}
</style>