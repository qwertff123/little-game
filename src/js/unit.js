export default class Unit {
    constructor(option) {
        this.width = option.width;
        this.height = option.height;
        this.ctx = option.ctx;
        this.src = option.src;
        this.offsetX = null;
        this.offsetY = null;
    }
    /**
     * 用于渲染单位
     */
    render(offsetX,offsetY) {
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        return new Promise(resolve => {
            this.image = new Image();
            this.image.onload = () => {
                this.imgWidth = this.image.width;
                this.imgHeight = this.image.height;
                this.ctx.drawImage(this.image, 0, 0, this.imgWidth, this.imgHeight, this.offsetX, this.offsetY, this.width, this.height);
                resolve();
            }
            this.image.src = this.src;
        })
    }

    clone(offsetX, offsetY) {
        this.ctx.drawImage(this.image, 0, 0, this.imgWidth, this.imgHeight, offsetX, offsetY, this.width, this.height);
    }
    /**
     * 单位移动
     * @param {*} direction 为一个数组[X,Y]
     */
    move(direction) {
        const width = this.width,
            height = this.height;
        this.ctx.clearRect(this.offsetX, this.offsetY, width, height);
        this.offsetX += direction[0] * width;
        this.offsetY += direction[1] * height;
        this.clone(this.offsetX,this.offsetY)
    }
}