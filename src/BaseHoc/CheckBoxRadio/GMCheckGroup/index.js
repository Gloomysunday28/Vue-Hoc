import GMCheckBox from '../GMCheckBox'
import GMRadio from '../GMRadio'

export default {
  name: 'GMCheckBoxGroup',
  props: {
    checkBoxList: {
      type: Array,
      default: () => [],
      required: true,
    },
    radioChecked: {
      type: [String, Number],
      default: '',
      required: false,
    },
    type: {
      type: String,
      default: 'checkBox',
      required: false,
    },
    slotName: {
      type: String,
      default: 'default',
      required: false,
    },
    extraProps: {
      type: Object,
      default: () => ({
        class: 'm-checkbox__group',
        on: {
          '&scroll': function(e) {
            e.stopPropagation()
            return false
          }
        }
      }),
      required: false,
    },
    title: {
      type: String,
      default: '',
      required: false,
    },
    showOptions: {
      type: Boolean,
      default: true,
      required: false
    },
    defaultValue: {
      type: Array,
      default: () => [],
      required: false
    },
    deepCloneData: {
      type: Boolean,
      default: true,
      required: false
    }
  },
  render(h) {
    const listeners = this.$listeners
    const vnodeProps = {...this.extraProps}
    const checkBoxList = this.deepCloneData ? this.checkBoxList.map(checkBox => {
       return { ...checkBox, checked: this.defaultValue.includes(checkBox.id || checkBox.shopId) }
    }) : [...this.checkBoxList]
    
    const prefixVnode = this.showOptions ? [h('div', {
      class: 'm-checkbox__option flex'
    }, [h('span', {
      class: 'm-checkbox__cancel',
      on: {
        click: listeners.cancel
      }
    }, '取消'), h('span', {
      class: 'm-checkbox__title'
    }, this.title), h('span', {
      class: 'm-checkbox__confirm',
      on: {
        click: () => {
          listeners.confirm(this.type === 'radio' ? checkBoxList.find(box => +box.id === +this.radioChecked || +box.shopId === +this.radioChecked) : checkBoxList.filter(check => check.checked)) 
        }
      }
    }, '确定')])] : []
    
    return h('div', vnodeProps, prefixVnode.concat([h('div', { class: 'm-toast__container' }, this._l(checkBoxList, cbox => {
      const vnode = h(this.type === 'radio' ? GMRadio : GMCheckBox, {
        key: cbox.id || cbox.shopId,
        props: {
          check: this.type === 'radio' ? this.radioChecked : cbox.checked,
          id: cbox.id || cbox.shopId
        },
        on: {
          ...this.type === 'radio' ? {
            changeRadio: id => {
              if (listeners.changeRadio) listeners.changeRadio(id)
              this.$toast.isMounted && this.$toast.updateChildrenComponent({
                props: {
                  radioChecked: id
                }
              })
            }
          } : {
            'update:check': checked => {
              this.$nextTick(() => {
                if (cbox.all) {
                  if (!checked && cbox.isProcessed) {
                    return cbox.isProcessed = false
                  }
                  cbox.checked = checked
                  this.$refs.checkBox.forEach(v => {
                    v.checked = checked
                  })
                } else {
                  cbox.checked = checked
                  const allCheckBox = checkBoxList.find(v => v.all) || {}
                  if (allCheckBox.label) {
                    allCheckBox.isProcessed = !checked
                    if (!checked) {
                      allCheckBox.checked = false
                      this.$refs.checkBox[0].checked = checked
                    }
                  }
                }

                this.$listeners.change.fns(checkBoxList.filter(check => check.checked))
              })
            }
          }
        },
        ref: 'checkBox',
        refInFor: true
      }, [h('span', {
        slot: cbox.slotName || this.slotName
      }, cbox.label || cbox.name)])
      
      return vnode
    }))]))
  }
}
