/**
 * 随机生成给定范围内的随机整数
 * @param {*} min 最小值
 * @param {*} max 最大值
 * @returns 
 */
export function random(min, max) {
    if (min > max) {
        return min;
    }
    return Math.round(Math.random() * (max - min)) + min;
}

/**
 * 深度克隆
 * @param {*} origin 克隆源
 * @returns 返回克隆出来的对象
 */
export function deepClone(origin) {
    if (Object.prototype.toString.call(origin) == "[object Array]") {
        const arr = [];
        for (const key in origin) {
            arr.push(deepClone(origin[key]));
        }
        return arr;
    } else if (Object.prototype.toString.call(origin) == "[object Object]") {
        const obj = {};
        for (const key in origin) {
            obj[key] = deepClone(origin[key]);
        }
        return obj;
    }
    return origin;
};

/**
 * 延迟
 * @param {*} delay 延迟时间
 * @returns promise对象
 */
export function delay(delay) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, delay)
    });
}