//导入链表对象
import List from "./list.js";
export default class Snack {
    constructor(option) {
        //option配置项说明
        //length: 蛇的长度
        //cellWidth: 每个单元的宽度（像素）
        //cellHeight：每个单元的高度（像素）
        //headPos：蛇的起始点坐标{ X : ***,Y : *** }

        this.length = option.length;            //蛇的长度
        this.cellWidth = option.cellWidth;      //每单元的宽度
        this.cellheight = option.cellHeight;    //每单元的高度
        this.headPos = option.headPos;          //用于记录蛇头坐标
        this.tailPos = null;                    //用于记录蛇尾坐标
        this.isAuto = false;
        this.snackPath = []; //蛇身路径
        this.oldTailPos = option.oldTailPos; //旧蛇尾的坐标

        //如果有蛇链表则直接初始化蛇
        if (!option.snackList) {
            this.snackList = null; //蛇链表
            //初始化蛇
            this.initSnack();
        } else {
            this.snackList = option.snackList;
        }
    }

    /**
     * 初始化蛇（建立蛇链表）
     */
    initSnack() {
        const snackList = new List(this.headPos);
        let {
            X,
            Y
        } = this.headPos;
        for (let i = 0; i < this.length - 1; ++i) {
            snackList.push({
                X: X - i - 1,
                Y
            });
        }
        this.snackList = snackList;
        this.snackPath = this.getSnackPath();
        this.tailPos = this.snackList.tail.value;
    }
    /**
     * 蛇移动
     * @param {*} newPosX 
     * @param {*} newPosY 
     * @returns 
     */
    snackMove(newPosX, newPosY) {
        //如果蛇回头则不移动蛇
        if (this.isTurnBack(newPosX, newPosY)) {
            return;
        }

        const oldTailPosX = this.snackList.tail.value.X;
        const oldTailPosY = this.snackList.tail.value.Y;
        //每次移动都重新设置旧蛇尾的坐标
        this.oldTailPos = {
            X: oldTailPosX,
            Y: oldTailPosY
        }
        
        this.updateSnackList(newPosX, newPosY);
        //更新蛇头的位置
        this.headPos = {
            X: newPosX,
            Y: newPosY
        }

        //更新蛇尾位置
        this.tailPos = this.snackList.tail.value;
    }
    // snackMove(newPosX, newPosY) {

    //     if (this.isTurnBack(newPosX,newPosY)) {
    //         console.log(123);
    //         return;
    //     }

    //     let oldPosX = null;
    //     let oldPosY = null;
    //     this.snackList.forEach((pos) => {
    //         oldPosX = pos.X;
    //         oldPosY = pos.Y;

    //         pos.X = newPosX;
    //         pos.Y = newPosY;

    //         newPosX = oldPosX;
    //         newPosY = oldPosY;
    //     });
    //     this.snackPath = this.getSnackPath();

    //     //每次移动都重新设置旧蛇尾的坐标
    //     this.oldTailPos = {
    //         X: oldPosX,
    //         Y: oldPosY
    //     }
    // }

    /**
     * 更新蛇链表
     * @param {*} newPosX 
     * @param {*} newPosY 
     */
    updateSnackList(newPosX, newPosY) {
        /**
         * 蛇移动的思路
         * 将蛇尾换至旧蛇头的位置，蛇头更新至新位置，并重新整理节点的连接关系
         */
        const oldTailNode = this.snackList.pop();
        const head = this.snackList.head;

        oldTailNode.next = head.next;
        head.next = oldTailNode;

        const oldHeadPosX = head.value.X;
        const oldHeadPosY = head.value.Y;


        head.value.X = newPosX;
        head.value.Y = newPosY;

        oldTailNode.value.X = oldHeadPosX;
        oldTailNode.value.Y = oldHeadPosY;
    }
    /**
     * 获取蛇身路径
     * @returns 
     */
    getSnackPath() {
        const path = [];
        this.snackList.forEach(pos => path.push(pos));
        return path;
    }
    /**
     * 判断目标点是否为蛇身体的一部分
     * @param {*} X 
     * @param {*} Y 
     * @returns { Boolean }
     */
    isSnackBody(X, Y) {
        return this.getSnackPath().some(pos => pos.X == X && pos.Y == Y);
    }
    /**
     * 蛇长大
     */
    growth() {
        this.snackList.push(this.oldTailPos);
        this.snackPath = this.getSnackPath();
        this.length++;
    }
    /**
     * 提前判断当前蛇是否直接回头
     * @param {*} X 
     * @param {*} Y 
     */
    isTurnBack(X, Y) {
        //禁止蛇直接回头
        const next = this.snackList.head.next;
        return next.value.X == X && next.value.Y == Y;
    }
    //得到头结点的坐标
    getHeadPos() {
        return this.snackList.head.value;
    }
    //得到尾节点的坐标
    getTailPos() {
        return this.snackList.tail.value;
    }
    /**
     * 克隆出一条虚拟的蛇，以便能够预先模拟移动
     * @returns 
     */
    getVirtualSnack() {
        const snackList = this.snackList.clone();
        const snack = new Snack({
            snackList,
            oldTailPos: this.oldTailPos
        });
        return snack;
    }
    /**
     * 判断传入的坐标是否为蛇尾巴
     * @param {*} X 
     * @param {*} Y 
     * @returns 
     */
    isTail(X, Y) {
        const tailPos = this.getTailPos()
        return X == tailPos.X && Y == tailPos.Y;
    }
}