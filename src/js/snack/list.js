import {
    deepClone
} from "../utils.js";
export default class List {
    constructor(value) {
        const node = {
            value,
            next: null
        }
        this.head = node;
        this.tail = this.head;
    }
    push(value) {
        const node = {
            value,
            next: null
        };
        if (!this.head) {
            this.head = node;
            this.tail = this.head;
        } else {
            this.tail.next = node;
            this.tail = node;
        }
    }
    pop() {
        let result = null;
        let p = this.head;
        //如果只有一个节点
        if (p.next == null) {
            result = p;
            //将头节点置为空节点
            this.head = null;
            this.tail = this.head;
            return result;
        }

        //找到倒数第二个节点
        while (p.next.next != null) {
            p = p.next;
        }
        result = p.next;
        p.next = null;
        this.tail = p;
        //返回最后一个节点
        return result;
    }
    /**
     * 遍历链表
     * @param {*} cb 
     */
    forEach(cb) {
        let p = this.head;
        let i = 0;
        while (p != null) {
            cb(p.value, i);
            ++i;
            p = p.next;
        }
    }
    /**
     * 逆序链表
     * @param {*} p 
     * @returns 
     */
    reverse(p = this.head) {
        if (p.next == null) {
            return p;
        }
        if (p.next == this.tail) {
            p.next.next = p;
            this.tail = this.head;
            this.head = p.next;
            p.next = null;
            return p;
        }
        const result = this.reverse(p.next);
        result.next = p;
        p.next = null;
        return p;
    }
    clone() {
        const list = new List();
        const result = deepClone(this);
        list.head = result.head;
        list.tail = result.tail;
        return list;
    }
}