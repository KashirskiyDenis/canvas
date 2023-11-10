'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let inputImage = document.getElementById('inputImage');
	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d');
	
	function changeInput() {
		let image = new Image();
		image.onload = draw;
		image.onerror = () => {
			console.log('Error loading')
		};
		image.src = URL.createObjectURL(this.files[0]);
	}
	
	function draw() {
		let canvas = document.getElementById('canvas');
		canvas.width = this.width;
		canvas.height = this.height;
		ctx.drawImage(this, 0,0);		
	}
	
	function getCanvasColor(event) {
		let target = event.currentTarget
		let shiftX = event.clientX - target.getBoundingClientRect().left;
		let shiftY = event.clientY - target.getBoundingClientRect().top;
		let pixel = ctx.getImageData(shiftX, shiftY, 1, 1);
		let data = pixel.data;
		let rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
		console.log(rgba);
	}
	
	inputImage.addEventListener('change', changeInput);
	canvas.addEventListener('click', getCanvasColor);
});	