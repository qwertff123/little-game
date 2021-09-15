<template>
  <div class="photo-list" :class="{ 'has-active': activeIndex != -1 }">
    <div
      class="photo-item"
      :class="{ active: activeIndex == 0 }"
      @click="activeIndex = 0"
    >
      <div class="inner">
        <span class="name">贪吃蛇</span>
        <div class="top">
          <span class="name">贪吃蛇</span>
          <span
            class="close iconfont icon-guanbi"
            @click.stop="activeIndex = -1"
          ></span>
        </div>
        <transition>
          <router-link to="/snack" v-show="activeIndex == 0">
            <span class="start">开始游戏</span></router-link
          >
        </transition>
      </div>
    </div>
    <div
      class="photo-item"
      :class="{ active: activeIndex == 1 }"
      @click="activeIndex = 1"
    >
      <div class="inner">
        <span class="name">吃豆豆迷宫</span>
        <div class="top">
          <span class="name">吃豆豆迷宫</span>
          <span
            class="close iconfont icon-guanbi"
            @click.stop="activeIndex = -1"
          ></span>
        </div>
        <transition>
          <router-link to="/eatDoug" v-show="activeIndex == 1">
            <span class="start">开始游戏</span></router-link
          >
        </transition>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
export default {
  setup() {
    const activeIndexRef = ref(-1); //当前选择的游戏索引（-1表示不选择任何游戏）
    return {
      activeIndex: activeIndexRef,
    };
  },
};
</script>

<style scoped>
.photo-list {
  display: flex;
  width: 100%;
  height: 100%;
  flex-wrap: nowrap;
  justify-content: center;
  align-items: center;
}
.photo-list.has-active .photo-item:not(.active) {
  transition: height 1s 0s, width 1s 0.5s, opacity 1s;
}

.photo-item {
  position: relative;
  flex: 1 1 auto;
  height: 100%;
  opacity: 1;
  border-radius: 20px;
  margin-right: 8px;
  cursor: pointer;
  transition: height 1s 0.5s, width 1s 0s, opacity 1s 0.5s;
  overflow: hidden;
  background-color: #333;
}

.photo-item.active {
  width: 100%;
  transition: all 1s 0.5s;
  margin: 0;
}

.photo-list.has-active .photo-item:not(.active) {
  width: 0;
  height: 0;
  opacity: 0;
}

.photo-item:not(.active)::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
.photo-item:hover::after {
  display: none;
}
.photo-item:not(.active) {
  width: 0;
}
.photo-item .inner {
  position: absolute;
  height: 100%;
  width: 100%;
  background-position: center center;
  background-size: cover;
  transform: translateY(100%);
  border-radius: 20px;
}
.photo-item:nth-of-type(1) .inner {
  background-image: url(../assets/snack.jpg);
  animation: slide-up 2s 0s forwards;
}
.photo-item:nth-of-type(2) .inner {
  background-image: url(../assets/maze.jpg);
  animation: slide-up 2s 0.3s forwards;
}
.photo-item .inner > .name {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 30px;
  font-weight: bolder;
  color: white;
  transition: opacity 1s;
}
.photo-item.active .inner > .name {
  opacity: 0;
}

.photo-item .top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  color: white;
  font-size: 25px;
  font-weight: bolder;
  padding: 40px 30px;
  opacity: 0;
  transition: opacity 0.5s 0.5s;
}
.photo-item.active .top .close {
  transform: rotate(360deg);
  transition: 0.5s 1s;
}
.photo-item.active .top {
  opacity: 1;
}
.iconfont.icon-guanbi {
  font-size: 25px;
}
.photo-item .top .close {
  position: absolute;
  right: 30px;
  vertical-align: middle;
  cursor: pointer;
}

@keyframes slide-up {
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0%);
  }
}
</style>