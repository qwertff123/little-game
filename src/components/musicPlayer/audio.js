export default class MyAudio {
    constructor() {
        this.isplay = false;
        this.curtime = 0;
        this.audio = new Audio();
    }
    /**
     * 用于更新audio实例，返回的是promise
     * @param {*} src 音频的url
     */
    updateAudio(src) {
        this.audio.src = src;
        this.isplay && this.play();
    }
    /**
     * 播放
     */
    play() {
        // // cancelAnimationFrame(this.timer);
        // // this.callback = callback || (() => {});
        this.audio.play();
        this.isplay = true;
        // // this.updateCurtime();
    }
    //暂停
    pause() {
        this.audio.pause();
        this.isplay = false;
        // // cancelAnimationFrame(this.timer);
        // // this.timer = null;
    }
    /**
     * 用于得到当前音乐播放的时间
     * @returns 
     */
    getCurTime() {
        return this.audio.currentTime;
    }
    /**
     * 设置当前音乐播放的时间
     * @param {*} second 秒
     */
    setSecond(second){
        this.audio.currentTime = second;
    }
}