/**
 * 用于将时间的字符串形式转换成秒数
 * @param {*} time 时间的字符串格式（时:分:秒 或 分:秒）
 */
export function formatTime(time){
    return time.split(":").reverse().reduce((prev,cur,index)=>{
        return prev + +cur * Math.pow(60,index);
    },0);
}
/**
 * 用于将秒数转换成字符串时间
 * @param {*} time 时间，单位秒数
 */
export function timeToString(time){
    let second = time % 60;
    second = second < 10 ? "0" + second : second;
    let minute = Math.floor(time / 60);
    minute = minute < 10 ? "0" + minute : minute;
    return minute + ":" + second;
}