import Unit from "../unit.js";
import Maze from "./maze.js";
import {
    SPACE,
    WALL,
    PLAYER,
    EXIT,
    FOOT
} from "./constant.js";
import {
    random
} from "../utils.js";

/**
 * X，Y坐标的说明
 * X表示行，Y表示列
 * 当坐标运用到地图矩阵（二维数组）时，需要map[Y][X]
 */
//目前提供的回调
//getScore      得到分数时
//pass          通关进入下一关时

export default class EatDoug {
    /**
     * @param { Object } option 配置参数 auto{Boolean} 用于设置是否自动游戏     cb{ Object } 用于设置各种情形的回调（getScore得到分数时调用，pass通关进入下一关时调用）wrapper 包裹元素的容器元素
     */
    constructor(option) {
        this.cb = option.cb || {}; //用户传入包含回调函数的对象

        this.width = null; //地图的宽度，像素
        this.height = null; //地图的高度，像素
        this.ctx = null;

        this.goExitTimer = null; //自动寻找出口的定时器
        this.eatFootTimer = null; //自动寻找食物的定时器
        this.isAuto = false; //判断当前是否处于自动玩
        this.initGameArea(option); //初始化游戏的区域
        const ctx = this.ctx;

        this.gameInfo = {
            hasEat: 0, //已经吃的食物个数
            footNum: 16, //食物的总个数
            eachFootScore: 100, //每个食物的分数
            score: 0, //当前的分数
            level: 1, //当前的关卡
        }
        this.footPos = []; //标记所有食物的坐标

        this.maze = new Maze(31, 21);
        // this.auto = option.auto;
        this.isStart = false; //用于设置当前游戏是否可以开始
        this.drawMaze();
        this.cellWidth = this.width / this.maze.width; //每个单元的宽度
        this.cellHeight = this.height / this.maze.height; //每个单元的高度

        const playerOption = {
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
        const exitOption = {
            src: "./src/assets/exit.jpg",
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

        // const pathSpot = {
        //     src: "./src/assets/redSpot.png",
        //     ctx,
        //     width: this.cellWidth,
        //     height: this.cellHeight
        // }
        this.player = new Unit(playerOption);
        this.wall = new Unit(wallOption);
        this.space = new Unit(spaceOption);
        this.exit = new Unit(exitOption);
        this.foot = new Unit(footOption);
        // this.pathSpot = new Unit(pathSpot);
        Promise.all([this.wall.render(-550, -550), this.space.render(-550, -550), this.foot.render(-550, -550)]).then(() => {
            this.render();
        })
    }
    /**
     * 初始化游戏区域
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
    //渲染地图
    render() {
        const map = this.map;
        const lenX = this.map[0].length;
        const lenY = this.map.length;
        for (let i = 0; i < lenY; ++i) {
            for (let j = 0; j < lenX; ++j) {
                const posX = this.cellWidth * j;
                const posY = this.cellHeight * i;
                if (map[i][j] == WALL) { //渲染墙
                    this.wall.clone(posX, posY);
                } else if (map[i][j] == PLAYER) { //渲染玩家
                    //先画草地后画人物使得人物在草地之上
                    this.space.clone(posX, posY);
                    this.player.render(posX, posY);
                } else if (map[i][j] == SPACE) { //渲染空白
                    this.space.clone(posX, posY);
                } else if (map[i][j] == EXIT) {
                    this.exit.render(posX, posY);
                } else if (map[i][j] == FOOT) { //渲染食物
                    this.space.clone(posX, posY);
                    this.foot.clone(posX, posY)
                }
            }
        }
    }
    /**
     * 用于在地图上添加食物
     */
    addFoot() {
        const footNum = this.gameInfo.footNum;
        let i = 0;
        let X = null,
            Y = null;
        const lenX = this.map[0].length,
            lenY = this.map.length;
        while (footNum > i) {
            X = random(1, lenX - 1);
            Y = random(1, lenY - 1);
            if (this.map[Y][X] == SPACE) {
                this.map[Y][X] = FOOT;
                this.footPos.push({
                    X,
                    Y
                });
                ++i;
            }
        }
    }
    /**
     * 用于重新绘制一副全新的地图矩阵
     */
    drawMaze() {
        this.maze.createMaze(this.maze.exitSpot); //重新生成新的地图
        this.map = this.maze.matrix; //重新设置游戏的地图矩阵
        this.map[this.maze.startSpot.Y][this.maze.startSpot.X] = PLAYER; //在地图矩阵中标记玩家的位置
        this.playerPos = { //玩家的位置
            X: this.maze.startSpot.X,
            Y: this.maze.startSpot.Y
        };
        this.gameInfo.hasEat = 0;
        this.addFoot(); //添加食物
    }
    /**
     * 游戏开始
     */
    start() {
        document.onkeydown = e => {
            const direction = [0, 0];
            const key = e.code;
            if (key == "ArrowRight") {
                direction[0] = 1;
            } else if (key == "ArrowLeft") {
                direction[0] = -1;
            } else if (key == "ArrowUp") {
                direction[1] = -1;
            } else if (key == "ArrowDown") {
                direction[1] = 1;
            }

            const newPosX = this.playerPos.X + direction[0];
            const newPosY = this.playerPos.Y + direction[1];
            this.playerMove(newPosX, newPosY);
        }
    }
    /**
     * 暂停游戏
     * @returns 
     */
    pause() {
        document.onkeydown = null;
    }

    /**
     * 玩家移动
     * @param {*} newPosX 
     * @param {*} newPosY 
     */
    playerMove(newPosX, newPosY) {

        //如果下一步碰到墙则不移动
        if (!this.collisionWall(newPosX, newPosY)) {
            return;
        }
        //判断是否吃到桃子
        if (this.getScore(newPosX, newPosY)) {
            this.gameInfo.score += this.gameInfo.eachFootScore;
            this.cb.getScore && this.cb.getScore(this.gameInfo.score);
            //调用所传入的getScore回调
            this.footPos = this.footPos.filter(pos => !(pos.X == newPosX && pos.Y == newPosY));
        }
        //判断是否到达终点且吃完地图上的所有桃子
        if (this.arriveExit(newPosX, newPosY) && this.eatAllFoot()) {

            //重新绘制地图矩阵
            this.drawMaze();
            //重新渲染新地图
            this.render();

            this.gameInfo.level++;
            //运行所传入的pass回调
            this.cb.pass && this.cb.pass(this.gameInfo.level);

            if (this.isAuto) {
                this.isAuto = false;
                this.auto();
            }
        }
        //如果没有吃完桃子就进入出口则弹出提示
        if (this.arriveExit(newPosX, newPosY) && !this.eatAllFoot()) {
            console.log(this.gameInfo.hasEat);
            alert("桃子都没吃完就想走？？");
            return;
        }

        const oldPos = {
            ...this.playerPos
        };
        this.playerPos.X = newPosX;
        this.playerPos.Y = newPosY;
        //用户的旧位置设置为空地
        this.map[oldPos.Y][oldPos.X] = SPACE;
        //更新用户在地图上的新位置
        this.map[newPosY][newPosX] = PLAYER;

        this.player.clone(newPosX * this.cellWidth, newPosY * this.cellHeight);
        this.space.clone(oldPos.X * this.cellWidth, oldPos.Y * this.cellHeight);


        // //重新渲染地图
        // this.render();
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
     * 判断当前预走的这一步是否达到出口以及食物是否还有剩
     * @param {*} newPosX 
     * @param {*} newPosY 
     * @returns 
     */
    arriveExit(newPosX, newPosY) {
        if (this.map[newPosY][newPosX] == EXIT) {
            return true;
        }
        return false;
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
     * 判断是否吃完所有的食物
     * @returns 
     */
    eatAllFoot() {
        if (this.gameInfo.hasEat == this.gameInfo.footNum) {
            return true;
        }
        return false;
    }

    /**
     * 利用bfs查找起点至目标点的路径
     * @param {*} nodeList 节点列表，初始值应包含至少一个起点坐标
     * @param {*} target 目标点
     * @param {*} nodeComplete 已经查找过的节点信息
     * @returns 
     */
    bfs(nodeList = [], target, nodeComplete = []) {
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
            neighbor = neighbor.concat(this.getNeighbor(node.pos.X, node.pos.Y).map(val => ({
                pos: val,
                parent: node
            })));
        }

        const next = this.bfs(neighbor, target, nodeComplete);
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
    getPath(start, end) {
        start || (start = this.playerPos);
        end || (end = this.maze.exitSpot);
        const path = this.bfs([{
            pos: start
        }], end).path;
        return path;
    };
    /**
     * 通过给定的路径数组在地图上画出路线
     * @param {*} path 
     */
    renderPath(path) {
        this.render();
        path.forEach(pos => {
            this.pathSpot.clone(pos.X * this.cellWidth, pos.Y * this.cellHeight);
        });
    }
    /**
     * 用于得到距离玩家最近的食物的路径
     * @returns 路径数组
     */
    getFootPath() {
        if (this.gameInfo.hasEat == this.gameInfo.footNum) return;
        let result = [];
        const startPos = this.playerPos;
        let path = null;
        this.footPos.forEach(pos => {
            path = this.getPath(startPos, pos);
            if (!result.length || path.length < result.length) {
                result = path;
            }
        })
        return result;
    }
    /**
     * 获取一个坐标周围的节点（墙除外）
     * @param {*} X 
     * @param {*} Y 
     * @returns 
     */
    getNeighbor(X, Y) {
        const map = this.map;
        const neighbor = [];
        const direction = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ]; //左右上下
        for (let i = 0; i < 4; ++i) {
            if (map[Y + direction[i][1]][X + direction[i][0]] != WALL) {
                neighbor.push({
                    X: X + direction[i][0],
                    Y: Y + direction[i][1]
                })
            }
        }
        return neighbor;
    }
    /**
     * 自动玩游戏
     */
    auto() {
        //只有把所有的桃子都吃完了才能去找出口
        if (!this.isAuto) {
            this.isAuto = true;
            this.autoEatFoot(this.autoGoExit.bind(this));
        }

    }
    /**
     * 取消自动玩游戏
     */
    cancelAuto() {
        this.isAuto = false;
        clearInterval(this.goExitTimer);
        clearInterval(this.eatFootTimer);
        this.goExitTimer = null;
        this.eatFootTimer = null;
    }
    /**
     * 自动移动至出口
     */
    autoGoExit() {
        const path = this.getPath().reverse();
        path.shift();
        this.playerMove(path[0].X, path[0].Y);
        const len = path.length;
        let i = 1;
        this.goExitTimer = setInterval(() => {
            if (i >= len - 1) {
                console.log(path[i].X, path[i].Y);
                clearInterval(this.goExitTimer);
            }
            this.playerMove(path[i].X, path[i].Y);
            ++i;
        }, 50);
    }
    /**
     * 自动移动至距离玩家最近的桃子的位置
     * @param {*} cb 
     * @returns 
     */
    autoEatFoot(cb = () => {}) {
        if (this.gameInfo.hasEat == this.gameInfo.footNum) return cb();
        //由于路径数组中的路径是从目标点到起点的路径，因此需要对路径数组逆序
        const path = this.getFootPath().reverse();
        //去除玩家当前所在的位置，避免出现延迟
        path.shift();
        const len = path.length;
        this.playerMove(path[0].X, path[0].Y);
        let i = 1;
        this.eatFootTimer = setInterval(() => {
            if (i >= len - 1) {
                clearInterval(this.eatFootTimer);
                this.autoEatFoot(cb);
                return;
            }
            this.playerMove(path[i].X, path[i].Y);
            ++i;
        }, 50)
    }
}