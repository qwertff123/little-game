<template>
  <div class="top-bar">
    <router-link to="/"> <i class="home"></i></router-link>
    <i
      ref="musicBtn"
      class="music"
      @click="showMusicPlayer = !showMusicPlayer"
    ></i>
  </div>
  <div class="wrapper">
    <router-view class="game-page"></router-view>
  </div>
  <div
    ref="musicPlayer"
    class="music-player"
    :class="{ show: showMusicPlayer, hide: !showMusicPlayer }"
  >
    <music-player :musicData="musicData"></music-player>
  </div>
</template>

<script>
import musicPlayer from "./components/musicPlayer/musicPlayer.vue";
import { ref } from "vue";
export default {
  components: {
    musicPlayer,
  },
  setup() {
    const musicPlayerRef = ref(null); //音乐播放器dom元素实例
    const musicBtnRef = ref(null); //音乐按钮dom元素实例
    const musicData = [
      {
        id: "00001",
        name: "少年",
        author: "梦然",
        image: "./src/assets/image/少年.jpg",
        audio: "./src/assets/audio/少年.mp3",
        totalTime: "03:56",
        islike: false,
      },
      {
        id: "00002",
        name: "victory",
        author: "Two Steps From Hell",
        image: "./src/assets/image/victory.jpg",
        audio: "./src/assets/audio/victory.mp3",
        totalTime: "05:20",
        islike: true,
      },
      {
        id: "00003",
        name: "Jealousy (Dance Radio)",
        author: "French Kiss",
        image: "./src/assets/image/Jealousy (Dance Radio).jpg",
        audio: "./src/assets/audio/Jealousy (Dance Radio).mp3",
        totalTime: "03:26",
        islike: true,
      },
      {
        id: "00004",
        name: "句号",
        author: "G.E.M.邓紫棋",
        image: "./src/assets/image/句号.jpg",
        audio: "./src/assets/audio/句号.mp3",
        totalTime: "03:55",
        islike: false,
      },
      {
        id: "00005",
        name: "浮夸",
        author: "陈奕迅",
        image: "./src/assets/image/浮夸.jpg",
        audio: "./src/assets/audio/浮夸.mp3",
        totalTime: "04:46",
        islike: false,
      },
      {
        id: "00006",
        name: "大家一起喜羊羊",
        author: "宿雨涵",
        image: "./src/assets/image/大家一起喜羊羊.jpg",
        audio: "./src/assets/audio/大家一起喜羊羊.mp3",
        totalTime: "03:34",
        islike: false,
      },
      {
        id: "00007",
        name: "猪猪侠",
        author: "陈洁丽",
        image: "./src/assets/image/猪猪侠.jpg",
        audio: "./src/assets/audio/猪猪侠.mp3",
        totalTime: "03:31",
        islike: false,
      },
    ];
    const showMusicPlayerRef = ref(false);

    document.addEventListener("click", (e) => {
      if (
        musicBtnRef.value.contains(e.target) ||
        musicPlayerRef.value.contains(e.target)
      ) {
        return;
      }
      showMusicPlayerRef.value = false;
      // console.log(musicPlayerRef.value.contains(e.target));
    });

    return {
      musicPlayer: musicPlayerRef,
      musicData,
      showMusicPlayer: showMusicPlayerRef,
      musicBtn: musicBtnRef,
    };
  },
};
</script>

<style lang="less">
@import url(http://at.alicdn.com/t/font_2113403_ecges43epow.css);
html,
body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
body {
  position: relative;
  background-color: black;
  margin: 0;
}

.top-bar {
  position: fixed;
  left: 0;
  right: 0;
  height: 60px;
  // background-color: red;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  i {
    display: inline-block;
    width: 30px;
    height: 30px;
    cursor: pointer;
    &.home {
      background: center / contain no-repeat url("./src/assets/home.png");
    }
    &.music {
      background: center / contain no-repeat url("./src/assets/music.png");
    }
  }
}

.wrapper {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 60%;
  height: 80%;
  transform: translate(-50%, -50%);
}

.music-player {
  position: absolute;
  height: 80%;
  width: 350px;
  right: -350px;
  top: 50%;
  transform: translateY(-50%);
  transition:all .5s;
  &.show {
    right : 0px;
  }

}
.start {
  position: absolute;
  left: 50%;
  top: 50%;
  border: 5px solid #f6d25c;
  padding: 5px 10px;
  height: 50px;
  width: 150px;
  box-sizing: border-box;
  text-align: center;
  font-size: 20px;
  font-weight: bolder;
  margin-left: -75px;
  margin-top: -25px;
  border-radius: 15px;
  background-color: #c53211;
  color: white;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.game-page {
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
.v-enter-active,
.v-leave-active {
  transition: opacity 1s;
}
.v-enter-to,
.v-leave-from {
  opacity: 1;
}

</style>
