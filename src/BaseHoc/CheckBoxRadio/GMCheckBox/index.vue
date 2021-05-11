<template>
  <div class="m-checkbox" @click.stop="checked = !checked">
    <slot name="left"></slot>
    <div class="m-checkbox__container">
      <input class="m-checkbox__input" type="checkbox" v-model="checked"/>
      <div class="m-checkbox__checked"></div>
    </div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'GMCheckBox',
  props: {
    check: {
      type: Boolean
    }
  },
  data() {
    return {
      checked: false
    }
  },
  mounted() {
    this.checked = this.check
  },
  watch: {
    checked(checked) {
      this.$emit('update:check', checked)
      this.$emit('selectUser')
    },
    check(n) {
      this.checked = n
    }
  }
}
</script>

<style lang="scss" scoped>
  .m-checkbox {
    position: relative;
    display: flex;
    align-items: center;
  }
  .m-checkbox__input {
    position: absolute;
    width: .4rem;
    height: .4rem;
    left: 0;
    top: 0;
    z-index: 10;
    &:checked {
       & + .m-checkbox__checked  {
         border-color: #F75F47;
         background: #F75F47;
         &::after {
           border-color: #fff;
           transform: rotate(405deg) scaleY(1.2);
         }
       }
    }
  }
  .m-checkbox__checked {
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