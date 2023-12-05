'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let inputImage = document.getElementById('inputImage');
	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d', {
		willReadFrequently: true,
	});
	let array;
	let arrayData;
	
	function changeInput() {
		let image = new Image();
		image.onload = draw;
		image.onerror = () => {
			console.log('Error loading')
		};
		if (this.files[0])
			image.src = URL.createObjectURL(this.files[0]);
	}
	
	function draw() {
		let gcd = GCD(this.width, this.height);
		// canvas.width = this.width / gcd * 390;
		// canvas.height = this.height / gcd * 390;
		canvas.width = 390;
		canvas.height = this.height * 390 / this.width;
		ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
		
		console.time('Execution Time');
		arrayData = loadImageToArray(ctx.getImageData(0, 0, 390, canvas.height));
		console.timeEnd('Execution Time');
		
		array = [];
		for (let i = 0; i <= canvas.width; i++) {
			array[i] = [];
			for (let j = 0; j <= canvas.height; j++)
			array[i][j] = 0;
		}
	}
	
	let loadImageToArray = (imageData) => {
		let array = [];
		let index = imageData.width * 4;
		let startIndex = 0;
		let endIndex = index;
		for (let i = 0; i < imageData.height; i++) {
			array[i] = [];
			let tmpArray = imageData.data.subarray(startIndex, endIndex);
			let tmpIndex = 0;
			for (let j = 0; j < tmpArray.length; j += 4) {
				array[i][tmpIndex] = tmpArray.subarray(j, j + 4);
				tmpIndex++;
			}
			startIndex = endIndex;
			endIndex += index;
		}
		return array;
	};
	
	let toImageData = (array, width, height) => {
		let imageData = new ImageData(width, height);
		
	};
	
	function GCD(a, b) {
		while (true) {
			if (a == b)
				break;
			else if (a > b)
				a = a - b;
			else 
				b = b - a;
		}
		return a;
	}
	
	function compare(data1, data2) {
		let R = (data1[0] - data2[0]) ** 2;
		let G = (data1[1] - data2[1]) ** 2;
		let B = (data1[2] - data2[2]) ** 2;
		let a = Math.sqrt(R + G + B);
		return a < 25 ? true : false;	
	}
	
	function getCanvasColor(event) {
		let target = event.currentTarget
		let shiftX = ~~(event.clientX - target.getBoundingClientRect().left);
		let shiftY = ~~(event.clientY - target.getBoundingClientRect().top);
		
		console.log({x: shiftX, y: shiftY});
		
		let pixel = ctx.getImageData(shiftX, shiftY, 1, 1);
		console.log(pixel);
		let fillColor = ctx.getImageData(shiftX, shiftY, 1, 1);
		console.time('Execution Time');
		// fillXOR(shiftX, shiftY, pixel, fillColor);
		console.timeEnd('Execution Time');
	}
	
	function fillXOR(x, y, fg, fc) {
		fc.data[0] = 0;
		fc.data[1] = 255;
		fc.data[2] = 0;
		fc.data[3] = 255; 
		
		const neighbors = [
			{ dx: 0, dy: -1 },
			{ dx: 0, dy: 1 },
			{ dx: -1, dy: 0 },
			{ dx: 1, dy: 0 }
		];
		
		let stack = [{ x, y }];
		array[x][y] = 1;
		
		while (stack.length) {
			let { x: currentX, y: currentY } = stack.pop();
			ctx.putImageData(fc, currentX, currentY);
		
			for (let neighbor of neighbors) {
				let newX = currentX + neighbor.dx;
				let newY = currentY + neighbor.dy;
				
				if (
					newX >= 0 && newY >= 0 &&
					newX < canvas.width && newY < canvas.height &&
					array[newX][newY] !== 1 &&
					compare(ctx.getImageData(newX, newY, 1, 1).data, fg.data)
					) {
					stack.push({ x: newX, y: newY });
					array[newX][newY] = 1;
				}
			}
		}
	}

	inputImage.addEventListener('change', changeInput);
	canvas.addEventListener('click', getCanvasColor);
});	