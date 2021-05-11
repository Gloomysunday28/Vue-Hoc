# 事件装饰
## 描述
可能有些小伙伴不太清楚事件装饰是什么？我们来想象一个场景, 我们去学校里的某个班级去找人, 但是我们不清楚此人在哪个班级, 所以我们需要进入每个班级去询问, 只有当进入正确的班级后才会去寻找对应的人, 那么写成函数如下:
```javascript
  function judgeCorrectClass() {
    ...
  }

  function lookupPerson() {

  }

```
对于以上的步骤 其实我们更关心的是寻人这个操作, 而寻找班级只是寻人的前提条件, 能不能有方法能够让我们只关心寻人逻辑
```javascript
  function searchPerson(fn) {
    if (judgeCorrectClass()) {
      fn()
    }
  }

  const lookupPerson = searchPerson(function() {

  })
```
利用searchPerson高阶函数, 将前置条件放在内部处理, 这样我们就不需要重复写代码去验证

## 用法
```html
<Decorate @before="handlerBefore">
  <div @click="handlerClick"></div>
</Decorate>
```
只有在handlerBefore返回true的前提下才会执行handlerClick函数, 而我们只需要关心handlerClick逻辑即可