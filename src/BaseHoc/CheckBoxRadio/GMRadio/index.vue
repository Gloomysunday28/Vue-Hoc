<template functional>
  <div class="m-radio" @click="listeners.changeRadio(props.id)">
    <slot name="left"></slot>
    <div class="m-radio__container">
      <input class="m-radio__input" name="radio" type="radio" v-model="props.check" :value="props.id"/>
      <div class="m-radio__checked"></div>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
  .m-radio {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: .35rem 0;
    border-bottom: .01rem solid #ddd;
    font-size: .3rem;
  }
  .m-radio__input {
    position: absolute;
    width: .4rem;
    height: .4rem;
    left: 0;
    top: 0;
    opacity: 0;
    display: none;
    z-index: 10;
    &:checked {
       & + .m-radio__checked  {
         border-color: #F75F47;
         background: #F75F47;
         &::after {
           border-color: #fff;
           transform: rotate(405deg) scaleY(1.2);
         }
       }
    }
  }
  .m-radio__container {
    margin-left: .2rem;
  }
  .m-radio__checked {
    position: relative;
    box-sizing: border-box;
    width: .4rem;
    height: .4rem;
    border: .01rem solid #ccc;
    border-radius: 100%;
    transition: background .5s;
    &::after {
      content: '';
      position: absolute;
      border: .02rem solid transparent;
      left: .13rem;
      top: .07rem;
      border-top: none;
      border-left: none;
      width: .1rem;
      height: .15rem;
      transition: all .5s;
    }
  }
</style>