import Snack from "./snack.js";
import Unit from "../unit.js";

import {
    random,
    delay
} from "../utils.js";

const WALL = 1;
const SPACE = 0;
const FOOT = 7;

/**
 * 需要改进：
 * 1.增加自动玩与玩家自己玩这两种模式能自由切换
 */
export default class GluttonousSnack {
    constructor(option) {
        this.cb = option.cb || {};
        this.width = null;
        this.height = null;
        this.ctx = null;
        this.initGameArea(option);
        const ctx = this.ctx;
        this.unitNumX = 15; //X方向上的单元长度
        this.unitNumY = 15; //Y方向上的单元长度

        this.speed = 100; //玩家手动玩时的速度
        this.map = null;
        this.spaceNum = this.unitNumX * this.unitNumY - (this.unitNumX + this.unitNumY - 2) * 2;

        //this.isStart = false;       //判断游戏是否开始

        this.initMap();

        this.autoSpeed = 10; //自动贪吃蛇移动的速度

        //初始化蛇身
        this.initSnack();

        //初始化食物的位置
        this.initFoot();

        this.gameInfo = {
            hasEat: 0,
            score: 0,
            eachFootScore: 10
        }

        this.timer = null; //定时器，用于玩家开始与暂停游戏的定时器

        this.cellWidth = this.width / this.unitNumX;
        this.cellHeight = this.height / this.unitNumY;

        this.judgeCirculation = null; //用于记录蛇行走的路径，每次吃到食物后，都会清空该数组，因此当 
        const headOption = {
            src: "./src/assets/cat.png",
            ctx,
            width: this.cellWidth,
            height: this.cellHeight,
        }
        const wallOption = {
            src: "./src/assets/wall.jpg",
            ctx,
            width: this.cellWidth,
            height: this.cellHeight,
        };
        const spaceOption = {
            src: "./src/assets/grass.jpg",
            ctx,
            width: this.cellWidth,
            height: this.cellHeight
        }
        const footOption = {
            src: "./src/assets/peach.png",
            ctx,
            width: this.cellWidth,
            height: this.cellHeight
        }
        const bodyOption = {
            src: "./src/assets/body.png",
            ctx,
            width: this.cellWidth,
            height: this.cellHeight
        }
        const tailOption = {
            src: "./src/assets/tail.png",
            ctx,
            width: this.cellWidth,
            height: this.cellHeight
        }
        this.head = new Unit(headOption);
        this.wall = new Unit(wallOption);
        this.space = new Unit(spaceOption);
        this.foot = new Unit(footOption);
        this.body = new Unit(bodyOption);
        this.tail = new Unit(tailOption);
        Promise.all([this.wall.render(-550, -550), this.space.render(-550, -550), this.foot.render(-550, -550), this.head.render(-550, -550), this.body.render(-550, -550), this.tail.render(-550, -550)]).then(() => {
            this.renderMap();
            this.renderSnack();
        })
    }
    /**
     * 初始化地图区域，即生成canvas标签
     * @param {*} option 传入GluttonousSnack的配置对象
     */
    initGameArea(option) {
        const wrapper = option.wrapper; //传入的包裹的元素
        const canvas = document.createElement("canvas");
        this.width = wrapper.clientWidth; //宽度，像素
        this.height = wrapper.clientHeight; //高度，像素
        canvas.width = this.width;
        canvas.height = this.height;
        wrapper.appendChild(canvas);
        this.ctx = canvas.getContext("2d");
    }
    /**
     * 初始化地图矩阵
     */
    initMap() {
        const lenX = this.unitNumX;
        const lenY = this.unitNumY;
        const map = [];
        map.push(new Array(lenX).fill(1));
        for (let i = 1; i < lenY - 1; ++i) {
            map.push([]);
            for (let j = 0; j < lenX; ++j) {
                if (j == 0 || j == lenX - 1) {
                    map[i][j] = WALL;
                    continue;
                }
                map[i][j] = SPACE;
            }
        }
        map.push(new Array(lenX).fill(1));
        this.map = map;
    }
    /**
     * 初始化食物位置，并在真实地图上渲染出食物
     */
    initFoot() {
        const oldPos = this.footPos;
        this.footPos = this.randomFoot();
        this.map[this.footPos.Y][this.footPos.X] = FOOT;
        if (oldPos) {
            this.map[oldPos.Y][oldPos.X] = SPACE;
            this.space.clone(oldPos.X * this.cellWidth, oldPos.Y * this.cellHeight);
            this.foot.clone(this.footPos.X * this.cellWidth, this.footPos.Y * this.cellHeight);
        }
    }
    /**
     * 初始化蛇
     */
    initSnack() {
        this.snack = new Snack({
            length: 5,
            headPos: {
                X: 6,
                Y: 6
            }
        });
    }
    /**
     * 渲染蛇
     */
    renderSnack() {
        const cellWidth = this.cellWidth,
            cellHeight = this.cellHeight;
        const len = this.snack.snackPath.length;
        this.snack.snackPath.forEach((pos, index) => {
            //表明是蛇头
            if (index == 0) {
                this.head.clone(pos.X * cellWidth, pos.Y * cellHeight);
                return;
            }
            this.body.clone(pos.X * cellWidth, pos.Y * cellHeight);
            if (index == len - 1) { //蛇尾
                this.tail.clone(pos.X * cellWidth, pos.Y * cellHeight);
            }
        })
        const oldTailPos = this.snack.oldTailPos
        oldTailPos && this.space.clone(oldTailPos.X * cellWidth, oldTailPos.Y * cellHeight);
    }
    /**
     * 
     */
    renderMap() {
        const map = this.map;
        const lenX = this.map[0].length;
        const lenY = this.map.length;
        for (let i = 0; i < lenY; ++i) {
            for (let j = 0; j < lenX; ++j) {
                const posX = this.cellWidth * j;
                const posY = this.cellHeight * i;
                if (map[i][j] == WALL) { //渲染墙
                    this.wall.clone(posX, posY);
                } else if (map[i][j] == SPACE) { //渲染空白
                    this.space.clone(posX, posY);
                } else if (map[i][j] == FOOT) { //渲染食物
                    this.space.clone(posX, posY);
                    this.foot.clone(posX, posY)
                }
            }
        }
    }
    /**
     * 开始游戏，玩家按下方向键后游戏开始
     */
    start() {
        let direction = [1, 0];
        let tempDirection = null;
        const headPos = this.snack.headPos;
        let newPosX = null;
        let newPosY = null;
        document.onkeydown = e => {
            tempDirection = [0, 0];
            const key = e.code;
            if (key == "ArrowRight") {
                tempDirection[0] = 1;
            } else if (key == "ArrowLeft") {
                tempDirection[0] = -1;
            } else if (key == "ArrowUp") {
                tempDirection[1] = -1;
            } else if (key == "ArrowDown") {
                tempDirection[1] = 1;
            } else {
                return;
            }

            if (this.snack.isTurnBack(headPos.X + tempDirection[0], headPos.Y + tempDirection[1])) {
                return;
            }
            direction = tempDirection;
        }

        newPosX = headPos.X + direction[0];
        newPosY = headPos.Y + direction[1];
        this.snackMove(newPosX, newPosY);

        this.timer = setInterval(() => {
            newPosX = headPos.X + direction[0];
            newPosY = headPos.Y + direction[1];
            this.snackMove(newPosX, newPosY);
        }, this.speed);
    }
    /**
     * 暂停游戏
     */
    pause() {
        clearInterval(this.timer);
        this.timer = null;
    }
    /**
     * 蛇移动
     * @param {*} newPosX 
     * @param {*} newPosY 
     */
    snackMove(newPosX, newPosY) {
        let hasEatFoot = false;
        //如果下一步碰到墙则不移动
        if (!this.collisionWall(newPosX, newPosY)) {
            console.log("撞墙了，游戏结束！！");
            this.pause();
            return;
        }
        if (this.snack.isSnackBody(newPosX, newPosY) && !this.snack.isTail(newPosX, newPosY)) {
            console.log(newPosX, newPosY);
            console.log("碰到自己，游戏结束!!");
            this.pause();
            return;
        }
        //判断是否吃到桃子,如吃到则随机一个地方生成桃子
        if (this.getScore(newPosX, newPosY)) {
            this.gameInfo.score += this.gameInfo.eachFootScore;
            //调用所传入的getScore回调
            this.cb.getScore && this.cb.getScore(this.gameInfo.score);
            // console.log("是否得分", this.snack.headPos, this.footPos);
            this.snack.growth();
            hasEatFoot = true;
        }

        const oldHeadPos = {
            ...this.snack.headPos
        };

        //让蛇移动
        this.snack.snackMove(newPosX, newPosY);

        // console.log("目前头部", this.snack.headPos, "目前尾部", this.snack.tailPos);

        //重新渲染蛇
        this.space.clone(this.snack.oldTailPos.X * this.cellWidth, this.snack.oldTailPos.Y * this.cellHeight);

        this.body.clone(oldHeadPos.X * this.cellWidth, oldHeadPos.Y * this.cellHeight);
        this.tail.clone(this.snack.tailPos.X * this.cellWidth, this.snack.tailPos.Y * this.cellHeight);

        //需在蛇移动后才可以渲染食物
        if (hasEatFoot && (this.unitNumX * this.unitNumY) - (this.unitNumX + this.unitNumY - 2) * 2 - this.snack.length > 1) {
            this.initFoot();
            this.cb.getSnackLength && this.cb.getSnackLength(this.snack.length)
        }

        this.head.clone(newPosX * this.cellWidth, newPosY * this.cellHeight);
        // debugger;
    }

    /**
     * 检测是否碰到墙体
     * @param {*} newPosX 
     * @param {*} newPosY 
     * @returns 
     */
    collisionWall(newPosX, newPosY) {
        if (this.map[newPosY][newPosX] == WALL) {
            return false;
        }
        return true;
    }
    /**
     * 判断给定坐标是否为墙
     * @param {*} X 
     * @param {*} Y 
     * @returns 
     */
    isWall(X, Y) {
        return this.map[Y][X] == WALL;
    }
    /**
     * 判断给定坐标是否为空地
     * @param {*} X 
     * @param {*} Y 
     * @returns 
     */
    isSpace(X, Y) {
        return this.map[Y][X] == SPACE;
    }
    /**
     * 判断当前预走的这一步是否能吃到食物
     * @param {*} newPosX 
     * @param {*} newPosY 
     * @returns 
     */
    getScore(newPosX, newPosY) {
        if (this.map[newPosY][newPosX] == FOOT) {
            this.gameInfo.hasEat++;
            return true;
        }
        return false;
    }
    /**
     * 随机生成食物坐标
     * @returns 
     */
    randomFoot() {
        let pos = {
            X: random(1, this.unitNumX - 1),
            Y: random(1, this.unitNumY - 1)
        }
        //食物不能生成在墙上也不能生成在蛇身上
        if (this.map[pos.X][pos.Y] != SPACE || this.snack.isSnackBody(pos.X, pos.Y)) {
            pos = this.randomFoot();
        }
        return pos;
    }

    /****************************************以下为AI贪吃蛇代码*************************************** */

    /**
     * 取消自动玩贪吃蛇
     */
    cancelAuto() {
        this.isAuto = false;
    }
    /**
     * 开启自动玩贪吃蛇
     */
    auto() {
        if (this.isAuto) return;
        this.isAuto = true;
        this.autoMove();
    }
    /**
     * 利用bfs查找起点至目标点的路径
     * @param {*} nodeList 节点列表，初始值应包含至少一个起点坐标
     * @param {*} target 目标点
     * @param {*} nodeComplete 已经查找过的节点信息
     * @returns 
     */
    bfs(nodeList = [], target, neighborRule = () => true, nodeComplete = []) {
        if (nodeList.length == 0) return [];
        let neighbor = [];
        const len = nodeList.length;
        let node = null;
        for (let i = 0; i < len; ++i) {
            node = nodeList[i];
            if (nodeComplete.some(val => JSON.stringify(val.pos) == JSON.stringify(node.pos))) { //判断当前点是否已经遍历过
                continue;
            }
            if (node.pos.X == target.X && node.pos.Y == target.Y) { //如果当前点与目标点相等则返回
                return {
                    path: [node.pos], //通过BFS的出的最终路劲所经过的点
                    parent: node.parent //当前点的父节点
                }
            };
            nodeComplete.push(node);
            neighbor = neighbor.concat(this.getNeighbor(node.pos.X, node.pos.Y, neighborRule).map(val => ({
                pos: val,
                parent: node
            })));
        }

        const next = this.bfs(neighbor, target, neighborRule, nodeComplete);
        //如果next.path为空则证明没有找到路径
        if (!next.path) return {};
        //添加经过点的父节点添加进路径数组中，因此最终所得到的路径为逆向路径
        next.path.push(next.parent.pos);
        //重新设置父节点，设置为最新添加进路径数组的父节点
        next.parent = next.parent.parent;
        return next;
    }
    /**
     *  获取起始点至目标点的路径
     * @param { Object } start 起始点坐标信息   格式:{X : 1,Y : 1}
     * @param {*} end 目标点坐标信息    格式{X : 1,Y : 1}
     */
    getPath(start, end, neighborRule) {
        if (JSON.stringify(start) == JSON.stringify(end)) {
            return [start];
        }
        const path = this.bfs([{
            pos: start
        }], end, neighborRule).path;
        return path;
    };

    /**
     * 获取一个坐标周围的节点
     * @param {*} X 
     * @param {*} Y 
     * @returns 
     */
    getNeighbor(X, Y, neighborRule = () => true) {
        const neighbor = [];
        const direction = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ]; //左右上下
        let newX = null,
            newY = null;
        for (let i = 0; i < 4; ++i) {
            newX = X + direction[i][0];
            newY = Y + direction[i][1];
            if (neighborRule(newX, newY)) {
                neighbor.push({
                    X: newX,
                    Y: newY
                })
            }
        }
        return neighbor;
    }

    /**
     * 自动玩贪吃蛇（半AI贪吃蛇的核心），只能尽可能的吃更多的桃子
     * @param {*} cb 
     * @returns 
     */
    //自动贪吃蛇的思路
    /**
     * 贪吃蛇每走一步都要进行以下的校验：
     * 如果找到吃到桃子的最短路径，则去吃桃子
     * 如果当前找不到吃桃子的路径，则跟随着尾巴走（跟随尾巴的方法为followTail）
     * 如果找到吃到桃子的路径后需要放出一条虚拟的蛇去吃，并且吃完后能够找到蛇尾，则按照相应的路径走一步
     */
    /**
     * 目前AI贪吃蛇的问题
     * 1.如果地图比较大，刚运行的时候会有些许卡顿
     * 2.贪吃蛇在寻找食物路径时，有一定概率出现死循环
     * 3.如果蛇前方只有一条路，当这一条路连续刷出2个及以上的时候，可能导致蛇死亡
     */
    async autoMove() {
        if (!this.isAuto) { //如果不为自动移动则退出
            return;
        }
        let footPath = null, //蛇从当前位置去吃食物的路径对象{ path : "完整路径",nextStep:"蛇下一步所走坐标"}
            nextStep = null, //蛇走的下一步
            isFindTail = false, //是否可以找到尾巴
            cachPath = null; //缓存路径对象
        do {
            if (!cachPath) {
                footPath = this.getFootPath(this.snack);
                nextStep = footPath.nextStep;
                cachPath = {
                    path: footPath.path,
                    nextStep: footPath.nextStep
                }
            } else {
                cachPath.nextStep = cachPath.path.pop();
                footPath = cachPath;
            }
            // footPath = this.getFootPath(this.snack);
            // nextStep = footPath.nextStep;
            //如果没有找到食物路径则跟着尾巴走
            if (!footPath) {
                //返回跟随尾巴走的下一步（要求尽可能的远离尾巴）
                nextStep = this.followTail();
            } else { //如果找到了食物路径
                //放出一条虚拟的蛇去吃食物，看看吃完食物后是否能找到尾部
                if (this.safetyEatFoot(this.snack, footPath.path)) {
                    isFindTail = true;
                    cachPath = null;
                    // console.log("可以吃食物");
                } else {
                    nextStep = this.followTail();
                }
                //如果不能找到食物则继续循环查找食物
            }
            // if (JSON.stringify(nextStep) == JSON.stringify(this.footPos)) {
            //     // console.log("吃到食物了");
            // }
            //如果下一步为空，则证明无路可走
            if (!nextStep) {
                console.log("已无路可走");
                return;
            }
            await delay(this.autoSpeed);
            this.snackMove(nextStep.X, nextStep.Y);
        } while (!footPath && isFindTail);
        this.autoMove();
    }

    /**
     * 通过传入的蛇身实例来获取获取食物的路径
     * @returns 如果找到路径则返回获取食物的路径以及蛇的下一步
     */
    getFootPath(snack) {
        //由于路径数组中的路径是从目标点到起点的路径，因此需要对路径数组逆序
        const neighborRule = (X, Y) => {
            return !this.isWall(X, Y) && !snack.isSnackBody(X, Y);
        }
        const path = this.getPath(snack.getHeadPos(), this.footPos, neighborRule); //蛇头找食物的路径
        //去除玩家当前所在的位置，避免出现延迟
        if (!path) return false;
        path.pop();
        const nextStep = path.pop();
        return {
            path: path.reverse(),
            nextStep
        }
    }

    /**
     * 用于获取两个坐标点之间的巨鹿
     * @param {*} start 
     * @param {*} end 
     * @returns 
     */
    getDistance(start, end) {
        return Math.pow(start.X - end.X, 2) + Math.pow(start.Y - end.X, 2);
    }
    neighborFarFrom(self, target, neighborRule) {
        const spotPos = this.getNeighbor(self.X, self.Y, neighborRule);
        let result = spotPos[0]; //最终距离最远的点
        let max = 0;
        let distance = null;
        spotPos.forEach(pos => {
            distance = Math.pow(pos.X - target.X, 2) + Math.pow(pos.Y - target.Y, 2);
            if (distance > max) {
                result = pos;
                max = distance;
            }
        })
        return {
            neighbor: spotPos,
            result
        };
    }

    /**
     * 判断吃完食物后是否能找到蛇尾
     * @param {*} virtualSnack snack实例
     * @param {*} path 路径
     * @returns 
     */
    safetyEatFoot(snack, path) {
        // const path = this.getFootPath(snack).path;
        if (!path) return false;

        const virtualSnack = snack.getVirtualSnack();
        const len = path.length;
        //找到食物
        for (let i = 0; i < len; ++i) {
            virtualSnack.snackMove(path[i].X, path[i].Y);
        }
        //如果路径为空数组，则说明预吃桃子了
        // console.log("路径", path);
        if (path.length == 0) {
            // console.log("虚拟蛇长大","食物路径",this.footPos);
            virtualSnack.snackMove(this.footPos.X, this.footPos.Y);
            virtualSnack.growth(); //让虚拟蛇长大以便能获取吃到桃子后的头尾坐标
        }
        // console.log("预判头部", virtualSnack.getHeadPos(), "预判尾部", virtualSnack.getTailPos());
        // debugger;
        return !!this.getPath(virtualSnack.getHeadPos(), virtualSnack.getTailPos(), (X, Y) => !this.isWall(X, Y) && (!virtualSnack.isSnackBody(X, Y) || virtualSnack.isTail(X, Y)));
    }

    /**
     * 跟随着蛇尾来走，并且返回尽可能远离蛇尾的点
     * @returns     返回蛇下一步所需要移动的坐标
     */
    followTail() {
        //得到当前蛇头的周围邻居
        const neighbor = this.getNeighbor(this.snack.headPos.X, this.snack.headPos.Y, (X, Y) => !this.isWall(X, Y) && (!this.snack.isSnackBody(X, Y) || this.snack.isTail(X, Y)));
        const len = neighbor.length;
        const path = this.getPath(this.snack.headPos, this.snack.tailPos, (X, Y) => !this.isWall(X, Y) && (!this.snack.isSnackBody(X, Y) || this.snack.isTail(X, Y)));
        if (!path) {
            // console.log("随机");
            const randomPos = neighbor[random(0, len - 1)];
            // console.log("邻居",neighbor,"随机邻居",randomPos);
            // debugger;
            return randomPos;
        }
        path.pop();
        let nextStep = path.pop();
        // console.log("跟随尾巴的下一步")
        let max = this.getDistance(this.snack.headPos, this.snack.tailPos);

        let virtualSnack = null;
        let distance = 0;
        for (let i = 0; i < len; ++i) {
            distance = this.getDistance(neighbor[i], this.snack.tailPos)
            if (distance < max) continue;
            virtualSnack = this.snack.getVirtualSnack();
            virtualSnack.snackMove(neighbor[i].X, neighbor[i].Y);
            //循环遍历蛇头周围符合要求的邻居并找去允许走的离蛇尾的最远的点（目的是为了绕更多的路）
            if (!!this.getPath(virtualSnack.getHeadPos(), virtualSnack.getTailPos(), (X, Y) => !this.isWall(X, Y) && (!virtualSnack.isSnackBody(X, Y) || virtualSnack.isTail(X, Y)))) {
                nextStep = neighbor[i];
                max = distance;
            }
        }
        //返回蛇下一步所需要移动的坐标
        return nextStep;
    }
}