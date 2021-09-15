<template>
  <div ref="wrapper" class="snack">
    <div class="left">
      <p>
        得分：<span class="score">{{ score }}</span>
      </p>
      <p>
        已吃食物：<span class="foot-num">{{ hasEat }}</span>
      </p>
      <p>
        蛇身长度：<span class="snack-length">{{ snackLen }}</span>
      </p>
    </div>
    <div class="right">
      <button
        class="start-game"
        :class="{ active: activeBtn == 'start' }"
        @click="startGame"
      >
        开始游戏
      </button>
      <button
        class="end"
        :class="{ active: activeBtn == 'pause' }"
        @click="pauseGame"
      >
        暂停游戏
      </button>
      <button
        class="auto"
        :class="{ active: activeBtn == 'auto' }"
        @click="autoGame"
      >
        自动游戏
      </button>
      <button
        class="cancel-auto"
        :class="{ active: activeBtn == 'cancelAuto' }"
        @click="cancelAutoGame"
      >
        取消自动
      </button>
    </div>
  </div>
</template>
<script>
import { ref, onMounted } from "vue";
import GluttonousSnack from "../js/snack/gluttonousSnack";
export default {
  setup() {
    const wrapperRef = ref(null); //游戏容器
    const scoreRef = ref(0); //得分
    const hasEatRef = ref(0); //已吃食物数量
    const snackLenRef = ref(0); //蛇身体长度
    const activeBtnRef = ref("pause"); //当前激活的按钮

    let gluttonousSnack = null;
    onMounted(() => {
      gluttonousSnack = new GluttonousSnack({
        wrapper: wrapperRef.value,
        cb: {
          getScore(num) {
            scoreRef.value = num;
            ++hasEatRef.value;
          },
          getSnackLength(length) {
            snackLenRef.value = length;
          },
        },
      });
    });

    //开始游戏
    const startGame = () => {
      if (activeBtnRef.value == "start") return;
      activeBtnRef.value = "start";
      gluttonousSnack.start();
    };
    //暂停游戏
    const pauseGame = () => {
      if (activeBtnRef.value == "pause") return;
      activeBtnRef.value = "pause";
      gluttonousSnack.end();
    };

    //自动游戏
    const autoGame = () => {
      if (activeBtnRef.value == "auto") return;
      activeBtnRef.value = "auto";
      gluttonousSnack.auto();
    };

    //取消自动游戏
    const cancelAutoGame = () => {
      if (activeBtnRef.value == "cancelAuto") return;
      activeBtnRef.value = "cancelAuto";

      gluttonousSnack.cancelAuto();
    };

    return {
      wrapper: wrapperRef,
      startGame,
      pauseGame,
      autoGame,
      cancelAutoGame,
      score: scoreRef,
      hasEat: hasEatRef,
      snackLen: snackLenRef,
      activeBtn: activeBtnRef,
    };
  },
};
</script>

<style scoped lang="less">
/* .wrapper {
  width: 100%;
  height: 100%;
} */
.left,
.right {
  color: white;
  position: absolute;
  width: 200px;
  top: 0;
  bottom: 0;
}
.left {
  left: -200px;

  p {
    font-size: 20px;
    font-weight: bolder;
    padding-right: 40px;
    margin-bottom: 30px;
    span {
      float: right;
    }
  }
}
.right {
  right: -200px;

  button {
    display: block;
    border: none;
    outline: none;
    height: 40px;
    width: 100px;
    margin-bottom: 10px;
    margin-left: 10px;
    cursor: pointer;
    color: white;
    background-color: transparent;
    font-size: 16px;
    font-weight: bolder;
    transition: all 0.3s;
    &:hover {
      color: aquamarine;
    }

    &.active {
      background-color: aquamarine;
      color: black;
    }
  }
}
</style>