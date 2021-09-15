<template>
  <div class="progress">
    <span class="curtime">{{ secondStr }}</span>
    <div class="progress-bar" @click="jumpProgress">
      <div ref="bottomBar" class="bottom"></div>
      <div ref="topBar" class="top">
        <span ref="spot" class="spot" @mousedown="dragProgress"></span>
      </div>
    </div>
    <span class="totalTimeStr">{{ totalTimeStr }}</span>
  </div>
</template>
<script>
import { ref, watch, onMounted, computed, toRef } from "vue";
import { timeToString } from "./convertTime";
export default {
  props: {
    second: {
      type: Number,
      require: true,
    },
    totalTime: {
      type: Number,
      require: true,
    },
  },
  setup(props, ctx) {
    const topBarRef = ref(null); //顶部进度条元素（可移动）
    const bottomBarRef = ref(null); //底部进度条（不可移动）
    const spotRef = ref(null); //进度条小圆点
    let offsetX = null;
    const secondRef = toRef(props, "second"); //当前秒数，Number
    const totalTimeRef = toRef(props, "totalTime"); //总时长
    let isDrapProgressRef = ref(false);
    const drapSecondRef = ref(null);
    const totalTimeStrRef = computed(() => timeToString(props.totalTime)); //总时长，字符串类型
    const secondStrRef = computed(() => {
      if (isDrapProgressRef.value) {
        return timeToString(Math.floor(drapSecondRef.value));
      }
      //当前不拖拽或点击则采取传入的当前秒数
      return timeToString(Math.floor(secondRef.value));
    }); //当前的秒数，字符串类型

    let width = null; //进度条总宽度
    const moveLenRef = ref(null); //进度条已经滑动的宽度

    //当前进度
    const percentageRef = computed(() => {
      if (isDrapProgressRef.value) return;
      return secondRef.value / totalTimeRef.value;
    });

    onMounted(() => {
      //初始化宽度
      width = bottomBarRef.value.clientWidth;
      console.log("宽度",bottomBarRef.value.offsetWidth)
      //初始化进度条的进度
      topBarRef.value.style.width = width * percentageRef.value + "px";

      //初始化进度条离屏幕右边的偏移
      offsetX = bottomBarRef.value.getBoundingClientRect().left;
    });

    //当进度发生变化时，进度条也跟着发生变化
    watch(percentageRef, () => {
      //当百分比变化时候，进度条也发生相应的变化
      topBarRef.value.style.width = width * percentageRef.value + "px";
    });

    //拖动进度条的事件
    const dragProgress = (e) => {
      document.onmousemove = (e) => {
        isDrapProgressRef.value = true;
        let disX = null;
        disX = e.pageX - offsetX;
        disX = disX < 0 ? 0 : disX;
        disX = disX > width ? width : disX;
        moveLenRef.value = disX;

        drapSecondRef.value = (moveLenRef.value / width) * totalTimeRef.value;
        topBarRef.value.style.width = moveLenRef.value + "px";
      };

      document.onmouseup = () => {
        isDrapProgressRef.value = false;
        //将最新的事件传递出去
        ctx.emit("updateTime", (moveLenRef.value / width) * totalTimeRef.value);

        document.onmousemove = null;
        document.onmouseup = null;
      };
    };

    //跳跃性的调整进度
    const jumpProgress = (e) => {
      //如果点击的为小圆点
      if (e.target == spotRef.value) {
        //保持原样，不动
        return;
      }
      moveLenRef.value = e.offsetX;
      //将最新的事件传递出去
      ctx.emit("updateTime", (moveLenRef.value / width) * totalTimeRef.value);
    };

    return {
      topBar: topBarRef,
      bottomBar: bottomBarRef,
      totalTimeStr: totalTimeStrRef,
      secondStr: secondStrRef,
      dragProgress,
      jumpProgress,
      spot: spotRef,
    };
  },
};
</script>

<style scoped lang="less">
.progress {
  user-select: none;
  width: 100%;
  height: 5rem;
  padding: 0 15px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  font-size: 16px;

  // background-image:linear-gradient(to bottom,rgba(255,255,255,0),rgba(255,255,255,.01),rgba(255,255,255,0));
  .progress-bar {
    flex: 1 1 auto;
    height: 30px;
    margin: 0 15px;
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    padding: 0 20px;
    box-sizing: border-box;
    .top {
      flex: 0 0 auto;
      position: absolute;
      left: 0;
      width: 0;
      height: 5px;
      background-color: #ffb32f;
      border-radius: 8px;
      .spot {
        position: absolute;
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
        right: 0;
        top: 50%;
        transform: translate(50%, -50%);
        cursor: pointer;
      }
    }

    .bottom {
      position: absolute;
      left: 0;
      right: 0;
      height: 5px;
      background-color: rgba(255, 255, 255, 0.2);
      border-radius: 8px;
    }
  }
}
</style>