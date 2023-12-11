'use strict';

document.addEventListener('DOMContentLoaded', function () {
	let inputImage = document.getElementById('inputImage');
	let canvas = document.getElementById('canvas');
	let ctx = canvas.getContext('2d', {
		willReadFrequently: true,
	});
	let arrayChecked;
	let arrayData;
	let imageData;
	
	function changeInput() {
		let image = new Image();
		image.onload = draw;
		image.onerror = () => {
			console.log('Error loading')
		};
		if (this.files[0]) {
			image.src = URL.createObjectURL(this.files[0]);
		}
	}
	
	function draw() {
		canvas.width = 390;
		canvas.height = this.height * 390 / this.width;
		ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
		
		console.time('to2DArray');
		to2DArray(ctx.getImageData(0, 0, canvas.width, canvas.height));
		console.timeEnd('to2DArray');

		checkArray(arrayData, canvas.width, canvas.height);
		clearArrayChecked();
	}
	
	let clearArrayChecked = () => {
		arrayChecked = [];
		for (let i = 0; i <= canvas.width; i++) {
			arrayChecked[i] = [];
			for (let j = 0; j <= canvas.height; j++)
				arrayChecked[i][j] = 0;
		}		
	};
	
	let checkArray = (array, width, height) => {
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				if (array[i][j].length != 4) {
					console.log({i: i, j: j});
					return;
				}
			}
		}
	};
	
	let to2DArray = (imageData) => {
		let { width, height, data } = imageData;
		arrayData = [];
		let dataIndex = 0;
		
		for (let i = 0; i < height; i++) {
			let row = [];
			for (let j = 0; j < width; j++) {
				row[j] = data.subarray(dataIndex, dataIndex + 4);
				dataIndex += 4;
			}
			arrayData[i] = row;
		}
	};
	
	let toImageData = (array, width, height) => {
		imageData = new ImageData(width, height);
		let index = 0;
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				imageData.data[index] = array[i][j][0];
				imageData.data[index + 1] = array[i][j][1];
				imageData.data[index + 2] = array[i][j][2];
				imageData.data[index + 3] = array[i][j][3];
				index += 4;
			}
		}		
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
		
		// console.log({x: shiftX, y: shiftY});

		let pixel = ctx.getImageData(shiftX, shiftY, 1, 1);
			
		// console.time('fillXORCanvas');
		// fillXORCanvas(shiftX, shiftY, pixel, canvas.width, canvas.height);
		// fillXORCanvas(0, 0, pixel, canvas.width, canvas.height);
		// console.timeEnd('fillXORCanvas');
		
		console.time('fillXORArray');
		fillXORArray(shiftX, shiftY, pixel, canvas.width, canvas.height);
		// fillXORArray(0, 0, pixel, canvas.width, canvas.height);
		toImageData(arrayData, canvas.width, canvas.height);
		ctx.putImageData(imageData, 0, 0);
		console.timeEnd('fillXORArray');

		clearArrayChecked();
	}
	
	function fillXORCanvas(x, y, fg, width, height) {
		const dataArray = new Uint8ClampedArray([0, 255, 0, 255])
		const fillColor = new ImageData(dataArray, 1, 1);
		const neighbors = [
			{ dx: 0, dy: -1 },
			{ dx: 0, dy: 1 },
			{ dx: -1, dy: 0 },
			{ dx: 1, dy: 0 }
		];
		
		let stack = [{ x, y }];
		arrayChecked[x][y] = 1;
		
		while (stack.length) {
			let { x: currentX, y: currentY } = stack.pop();
			ctx.putImageData(fillColor, currentX, currentY);
			
			for (let neighbor of neighbors) {
				let newX = currentX + neighbor.dx;
				let newY = currentY + neighbor.dy;
				
				if (
					newX >= 0 && newY >= 0 &&
					newX < width && newY < height &&
					arrayChecked[newX][newY] !== 1 &&
					compare(ctx.getImageData(newX, newY, 1, 1).data, fg.data)
					) {
					stack.push({ x: newX, y: newY });
					arrayChecked[newX][newY] = 1;
				}
			}
		}
	}
	
	function fillXORArray(x, y, fg, width, height) {
		const fillColor = new Uint8ClampedArray([0, 255, 0, 255]);
		const neighbors = [
			{ dx: 0, dy: -1 },
			{ dx: 0, dy: 1 },
			{ dx: -1, dy: 0 },
			{ dx: 1, dy: 0 }
		];
		
		let stack = [{ x, y }];
		arrayChecked[x][y] = 1;
		
		while (stack.length) {
			let { x: currentX, y: currentY } = stack.pop();
			arrayData[currentY][currentX].set(fillColor);
			
			for (let neighbor of neighbors) {
				let newX = currentX + neighbor.dx;
				let newY = currentY + neighbor.dy;
				
				if (newX >= 0 && newY >= 0 &&
					newX < width && newY < height &&
					arrayChecked[newX][newY] !== 1 &&
					compare(arrayData[newY][newX], fg.data)
					) {
					stack.push({ x: newX, y: newY });
					arrayChecked[newX][newY] = 1;
				}
			}
		}
	}
	
	inputImage.addEventListener('change', changeInput);
	canvas.addEventListener('click', getCanvasColor);
});	