import gaussBlur from "./gaussBlur";
/**
     * 用于返回高斯模糊图片的base64格式，返回的是一个promise对象
     * @param {*} imageUrl	图片的url
     * @param {*} width		画入canvas画板的宽度,决定图片的模糊程度
     */
export default function (imageUrl, width = 100) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    image.src = imageUrl;
    return new Promise(resolve => {
        image.onload = () => {
            canvas.width = width;		//canvas画板的宽度
            canvas.height = width / image.width * image.height;		//画板的高度自适应图片
            ctx.drawImage(image, 0, 0, image.width, image.height,0,0,canvas.width,canvas.height);
            let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            imageData = gaussBlur(imageData,200);
            ctx.putImageData(imageData, 0, 0);
            const newImage = canvas.toDataURL();
            resolve(newImage);        //返回模糊后的图片的base64格式
        }
    })
}