# 函数防抖
## 思路
我们知道事件绑定会存储在vnode.data.on下, 那么我们只需要将v.data.on套上一个防抖的高阶函数即可

## 用法
```html
<Debounce delayTime="300" exclude="scroll">
  <div @click="handlerClick" @scroll="handlerScroll"></div>
</Debounce>
```