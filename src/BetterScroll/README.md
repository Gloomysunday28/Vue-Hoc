# BetterScroll

概念: 基于better-scroll封装的Better-scroll
解决的问题:
1. 集成了分页交互，里面监听了scroll事件，并将page变量返回给了父组件，父组件可以获取this.page
2. 暴露了better实例给到父组件，父组件会被注入this.container，container即是bs的instance
3. 利用svg自定义了下拉刷新的loading效果
4. 在父组件里注入了beforeRouteLeave钩子函数用于记录当前的滚动位置
5. 上拉加载和下拉刷新全部都被处理，只需要传入自定义事件去获取数据源

## 用法
```html
  <better-scroll @getList="getList">
    <div ref="contain"></div>
  </better-scroll>
```