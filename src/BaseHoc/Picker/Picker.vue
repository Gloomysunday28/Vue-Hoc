<template>
    <div>
        <transition name="fade1">
            <div class="shade" v-show="showStatus" @click="closeToast('shade')" @touchmove.prevent="()=>{}"></div>
        </transition>
        <transition name="slideup">
            <div class="toast" :class="classname" v-show="showStatus" ref="toast">
                <div v-if="title"  class="title">
                    <i class="icon iconfont icon-arrow-left" v-if="title && title.back"></i>
                    <span v-text="title && title.text"></span>
                    <i class="icon iconfont close icon-guanbi"
                       @click="closeToast('btn')"
                       v-if="title && title.close"></i>
                </div>
                <slot></slot>
                <p v-if="!onlyslot"
                   class="cancel"
                   :class='{red:cancelType=="red"}'
                   @click="closeToast('btn')"
                   v-text="cancelText||'取消'"></p>
            </div>
        </transition>
    </div>
</template>
<script>
    export default {
        name: 'Toast',
        data() {
            return {
                showStatus: this.show || this.value|| false
            }
        },
        // props:['title','show','cancelText','cancelType','onlyslot'],//show 显示或者关闭  cancelText：关闭按钮的文字 cancelType 样式 红色或者默认
        props:{
            title: {//标题
                type: [String,Object],
                default: '',
            },
            show : {//展示状态
                type: [Boolean,String],
                default: false,
            },
            cancelText: {//取消按钮的文案
                type: String,
                default: '',
            },
            cancelType: {//cancelType 样式  红色或者默认
                type: String,
                default: '',
            },
            onlyslot : {//是否只展示 slot内容
                type: [Boolean,String],
                default: false,
            },
            value:{
                type: [Boolean,String],//用来控制展示状态 使用v-model在外部进行控制
                default: false,
            },
            disableShadeClose:{//点击遮罩层 是否可以关闭
                type: [Boolean,String],
                default: false,
            },
            classname: {
                type: String,
                default: ''
            },
            cancel: { // 外面传入
                type: Function,
                default: () => {},
            },
        },
        methods: {
            closeToast(type) {
                if((type === 'shade' && !this.disableShadeClose) || type==='btn'){
                    this.showStatus = false
                    this.cancel && this.cancel()
                    this.$emit('msg',this.showStatus);
                    this.$emit('input',this.showStatus)
                }
            },
        },
        watch: {
            show(n,old){
                this.showStatus = n
            },
            value(n,old){
                this.showStatus = n
            }
        }
    }
</script>
<style lang="scss" scoped>
    .fade1-enter-active, .fade1-leave-active {
        transition: all ease 400ms;
        min-height: 1rem;
    }
    .fade1-enter, .fade1-leave-to {
        opacity: 0;
        min-height: 1rem;
    }
    .shade {
        @include box((w:100%, h:100%, bg:rgba(100, 100, 100, 0.5)));
        @include position((p:fixed, t:0, r:0, b:0, l:0));
        z-index: 11;
    }
    .toast {
        @include position((p:fixed, r:0, b:0, l:0));
        background-color: $white;
        z-index: 12;
        /*min-height: 1rem;*/
        .title{
            @include box((lh:1rem,p:0 0.3rem,fs:0.3rem));
            @include thin('bottom',$borderColor);
            .close{
                @include box((fl:right,fs:.3rem))
            }
        }
        .cancel {
            $btnH: 1rem;
            @include box((w:100%, lh:$btnH, ta:center, bg:$white, fs:0.36rem, c:$black2));
            &.red{
                @include box((bg:$red,c:$white));
            }
        }
    }
</style>
