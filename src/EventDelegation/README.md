# 事件委托

## 思路
事件委托就是找到特定的父级, 然后执行该父级上的事件, 所以我们只需要指定能标记父级的标志即可

## 用法
```html
<EventDelegation eTagName="#app">
</EventDelegation>
```

## 额外功能
Vue里的transition内置组件内部做了什么? 其实它内部只是将子节点的vnode.data添加上了transition对象, 其他的一系列操作都是在Vue内部的钩子函数create里去操作的(添加类名 删除类名)
事件委托组件里就定义了transition属性的添加, 可以模拟transition组件

如果还想了解其他Vue2.x的源码, 请移步[Vue2.x技术内幕解析](https://gloomysunday28.github.io/vue-source/)