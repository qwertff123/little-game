import {
    random
} from "../utils.js";
import {
    WALL,
    SPACE,
    WAITCONNECT,
    EXIT
} from "./constant.js";

export default class Maze {
    constructor(width, height) {
        //地图矩阵（二维数组）的宽度与长度
        this.width = width + (width + 1) % 2; //保证宽度为奇数
        this.height = height + (height + 1) % 2; //保证长度为奇数
        this.matrix = []; //地图矩阵
        this.startSpot = null; //用于设置地图的起始点,即玩家的起点
        this.exitSpot = null; //用于设置地图的终点
    }
    /**
     * 初始化地图矩阵（此时只是地图的雏形）
     */
    initMatrix() {
        this.matrix = [];
        const lenX = this.width;
        const lenY = this.height;
        let temp = [];
        for (let i = 0; i < lenY; ++i) {
            if ((i + 1) % 2) {
                this.matrix.push(new Array(lenX).fill(1));
            } else {
                temp = [];
                for (let j = 0; j < lenX; ++j) {
                    if (j % 2) {
                        temp.push(WAITCONNECT);
                    } else {
                        temp.push(WALL);
                    }
                }
                this.matrix.push(temp);
            }
        }
    }
    /**
     * 随机一个起点坐标
     * @returns 
     */
    randomStartSpot() {
        let X = null,
            Y = null;
        if (Math.random() < 0.5) {
            X = [1, this.width - 2].sort(() => Math.random() - 0.5)[0];
            Y = random(1, this.height - 2);
        } else {
            X = random(1, this.width - 2);
            Y = [1, this.height - 2].sort(() => Math.random() - 0.5)[0];
        }

        if (this.matrix[Y][X] != WALL) {
            return {
                X,
                Y
            }
        }
        if (this.matrix[Y][X] == WALL) {
            return this.randomStartSpot();
        }
    }
    /**
     * 创建地图矩阵
     * @param { Object } startSpot X坐标与Y坐标，如不传入则随机起点
     */
    createMaze(startSpot) {
        this.initMatrix();
        this.startSpot = startSpot || this.randomStartSpot();
        this.matrix[this.startSpot.Y][this.startSpot.X] = SPACE;
        let wallList = [];
        wallList = wallList.concat(this.findWall(this.startSpot.X, this.startSpot.Y));
        console.log(wallList);
        let wall = null;
        let throughWall = null;
        let exit = null;
        while (wallList.length) {
            wall = this.randomWall(wallList);
            throughWall = this.throughWall(wall.X, wall.Y);
            if (throughWall.result) {
                this.matrix[wall.Y][wall.X] = SPACE; //打通墙，将其变为空地
                this.matrix[throughWall.Y][throughWall.X] = SPACE;
                wallList = wallList.concat(this.findWall(throughWall.X, throughWall.Y));
                exit = throughWall;
            }
            wallList.splice(wall.index, 1);
        }
        this.matrix[exit.Y][exit.X] = EXIT;
        this.exitSpot = exit;
    }
    /**
     * 查找查找坐标周围的墙（除了游戏围墙）
     * @param {*} X 
     * @param {*} Y 
     * @returns 返回周围墙的坐标数组
     */
    findWall(X, Y) {
        const result = [];
        const direction = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ]; //左右上下
        direction.forEach(direction => {
            const disX = direction[0],
                disY = direction[1];
            if (!this.isEdge(X + disX, Y + disY) && this.isWall(X + disX, Y + disY)) {
                result.push({
                    X: X + disX,
                    Y: Y + disY
                });
            }
        })
        return result;
    }
    /**
     * 判断指定坐标是否为墙
     * @param {*} X 
     * @param {*} Y 
     * @returns 
     */
    isWall(X, Y) {
        if (this.matrix[Y][X] == WALL) {
            return true;
        }
        return false;
    }
    /**
     * 判断是否为游戏边界
     * @param {*} X 
     * @param {*} Y 
     * @returns 
     */
    isEdge(X, Y) {
        if (X == 0 || Y == 0 || X == this.width - 1 || Y == this.height - 1) {
            return true;
        }
        return false;
    }
    /**
     * 判断墙是否可以被打通
     * @param {*} X 墙的X坐标
     * @param {*} Y 墙的Y坐标
     * @return 对象，对象内有墙是否打通的结果
     */
    throughWall(X, Y) {
        const direction = [
            [-1, 0],
            [1, 0],
            [0, -1],
            [0, 1]
        ]; //左右上下
        for (let i = 0; i < 4; ++i) {
            if (this.matrix[Y + direction[i][1]][X + direction[i][0]] == WAITCONNECT) {
                return {
                    result: true,
                    //打通墙后所连接的空地坐标
                    X: X + direction[i][0],
                    Y: Y + direction[i][1]
                };
            }
        }
        return {
            result: false
        };
    }
    /**
     * 通过墙数组随意选取一面墙
     * @param {*} wallList 墙数组
     * @returns 
     */
    randomWall(wallList) {
        const index = random(0, wallList.length - 1);
        return {
            X: wallList[index].X,
            Y: wallList[index].Y,
            index
        };
    }
}