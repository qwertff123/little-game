<template>
  <div ref="player" class="player" v-if="curMusic">
    <div class="content">
      <div class="info">
        <div class="image">
          <img :src="curMusic.image" alt="" />
        </div>
        <div class="name">{{ curMusic.name }}</div>
        <div class="author">{{ curMusic.author }}</div>
      </div>
      <ul class="tool">
        <li class="islike normal">
          <span class="love iconfont icon-xihuan"></span>
          <span class="normal iconfont icon-xihuan1"></span>
        </li>
        <li class="download">
          <span class="iconfont icon-icon_xiazai"></span>
        </li>
        <li class="comment">
          <span class="iconfont icon-pinglun"></span>
        </li>
        <li class="video">
          <span class="iconfont icon-shipin"></span>
        </li>
        <li class="unlove">
          <span class="iconfont icon-ziyuan173"></span>
        </li>
      </ul>
      <progress-bar
        :second="second"
        :totalTime="totalTime"
        @updateTime="changeTime"
        class="progress-bar"
      ></progress-bar>
      <ul class="control">
        <li class="play-order">
          <span class="iconfont icon-shunxubofang"></span>
        </li>
        <li class="prev" @click="changeMusic('prev')">
          <span class="iconfont icon-yinlebofangye-shangyishou"></span>
        </li>
        <li class="center pause">
          <span
            class="play iconfont icon-bofang1"
            @click="play"
            v-show="!isPlay"
          ></span>
          <span
            class="pause iconfont icon-zantingtingzhi2"
            @click="pause"
            v-show="isPlay"
          ></span>
        </li>
        <li class="next" @click="changeMusic('next')">
          <span class="iconfont icon-yinlebofangye-shangyishou"></span>
        </li>
        <li class="music-list-btn" @click="showMusicList = !showMusicList">
          <span class="iconfont icon-bofangliebiao"></span>
        </li>
      </ul>
    </div>
    <div class="music-list" :class="{ show: showMusicList }">
      <div class="close" @click="showMusicList = !showMusicList">
        <span class="close-btn iconfont icon-close-o"></span>
      </div>
      <ul class="list">
        <li
          class="item"
          :class="{ play: curMusic.id == music.id }"
          v-for="(music, index) in musicData"
          :key="music.id"
          @click="changeMusic(index)"
        >
          <div class="name">{{ music.name }}</div>
          <div class="info">
            <span class="icon"></span>
            <span class="detail"> {{ music.author }} - {{ music.name }} </span>
          </div>
          <div class="islike normal">
            <span class="love iconfont icon-xihuan" v-if="music.isLike"></span>
            <span class="normal iconfont icon-xihuan1" else></span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch, toRef } from "vue";
import blurImage from "./blurImage";
import MyAudio from "./audio";
import progressBar from "./progressBar.vue";
import "./musicPlayer.less";
import { formatTime } from "./convertTime";
export default {
  props: ["musicData"],
  components: {
    progressBar,
  },
  setup(props) {
    const musicDataRef = toRef(props, "musicData"); //所有的音乐信息
    const playerRef = ref(null); //播放器容器元素
    const curMusicRef = ref(null); //当前播放的音乐信息
    let curMusicIndex = 0; //当前播放音乐的索引
    let audio = null;
    const isPlayRef = ref(false); //当前是否播放
    const secondRef = ref(0); //当前播放的秒数
    const totalTimeRef = ref(null); //当前播放的总秒数
    const showMusicListRef = ref(false); //是否展示播放列表

    onMounted(() => {
      // const resp = await fetch("./src/assets/data.json", { method: "get" });
      // musicDataRef.value = await resp.json();
      curMusicRef.value = musicDataRef.value[curMusicIndex];
      audio = new MyAudio();
      audio.updateAudio(curMusicRef.value.audio);
      totalTimeRef.value = formatTime(curMusicRef.value.totalTime);
      console.log(totalTimeRef.value);
    });

    watch(curMusicRef, async () => {
      //将音乐图片高斯模糊后作为播放器的背景
      const image = await blurImage(curMusicRef.value.image);
      playerRef.value.style.backgroundImage = `url(${image})`;
      secondRef.value = 0;
      console.log(curMusicRef.value);
      totalTimeRef.value = formatTime(curMusicRef.value.totalTime);
    });

    let timer = null;

    //随着音乐的播放自动更新时间
    const updateTime = () => {
      secondRef.value = audio.getCurTime();
      timer = requestAnimationFrame(updateTime);
    };

    const play = () => {
      console.log("播放音乐");
      isPlayRef.value = true;
      audio.play();
      updateTime();
    };
    const pause = () => {
      console.log("暂停音乐");
      isPlayRef.value = false;
      audio.pause();
      cancelAnimationFrame(timer);
    };

    //更改当前音乐播放的秒数
    const changeTime = (second) => {
      secondRef.value = second;
      audio.setSecond(second);
    };

    const changeMusic = (type) => {
      const musicLen = musicDataRef.value.length;
      if (type == "next") {
        //下一首
        curMusicIndex = ++curMusicIndex % musicLen;
      } else if (type == "prev") {
        //上一首
        curMusicIndex = (--curMusicIndex + musicLen) % musicLen;
        console.log(curMusicIndex);
      } else if (typeof type == "number") {
        //指定切换歌曲索引的歌曲
        curMusicIndex = type;
        showMusicListRef.value = false;
      } else {
        return;
      }
      curMusicRef.value = musicDataRef.value[curMusicIndex];
      audio.updateAudio(curMusicRef.value.audio);
    };

    return {
      musicData: musicDataRef,
      curMusic: curMusicRef,
      player: playerRef,
      isPlay: isPlayRef,
      play,
      pause,
      second: secondRef,
      totalTime: totalTimeRef,
      changeTime,
      showMusicList: showMusicListRef,
      changeMusic,
    };
  },
};
</script>
<style scoped lang="less">
@import url("http://at.alicdn.com/t/font_2286146_z8xgu1dl3d.css");
</style>