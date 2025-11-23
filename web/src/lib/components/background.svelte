<script>
	import * as TWEEN from '@tweenjs/tween.js';
	import { onMount } from 'svelte';

	let SCREEN_WIDTH;
	let SCREEN_HEIGHT;
	let STARS_QUANTITY = 100;
	let MAX_FRAME_RATE = 60;

	let canvas;
	let context;
	let stars;
	let warpFlag = 0;
	let warpLocus = { value: 1 };
	let tickerFlag = 1;
	let starsLoopInterval;
	let i;

	onMount(() => {
		SCREEN_WIDTH = window.innerWidth;
		SCREEN_HEIGHT = window.innerHeight;

		if (!canvas) {
			console.error('Canvas element not found');
			return;
		}

		context = canvas.getContext('2d');
		canvas.width = SCREEN_WIDTH;
		canvas.height = SCREEN_HEIGHT;

		window.addEventListener('resize', function (event) {
			SCREEN_WIDTH = window.innerWidth;
			SCREEN_HEIGHT = window.innerHeight;
			canvas.width = SCREEN_WIDTH;
			canvas.height = SCREEN_HEIGHT;
			starsInit();
			// createStars();
		});

		// Canvas is working! Removing test rectangle

		starsInit();
		animate();
	});

	function starsInit() {
		createStars();
		clearInterval(starsLoopInterval);
		starsLoopInterval = setInterval(starsLoop, 1000 / MAX_FRAME_RATE);
	}

	function createStars() {
		stars = [];

		for (i = 0; i < STARS_QUANTITY; i++) {
			let rdmx = Math.random() * (SCREEN_WIDTH - 10) + 5;
			let rdmy = Math.random() * (SCREEN_HEIGHT - 5) + 2.5;

			let rdmvx = (rdmx - SCREEN_WIDTH / 2) / 1000;
			let rdmvy = (rdmy - SCREEN_HEIGHT / 2) / 1000;

			let star = {
				radius: Math.random() * 4 + 0.25,
				ix: rdmx,
				iy: rdmy,
				x: rdmx,
				y: rdmy,
				vx: rdmvx,
				vy: rdmvy
			};
			stars.push(star);
		}
	}

	function starsLoop() {
		// Guard clause to prevent null canvas access
		if (!canvas || !context) {
			return;
		}

		//////////////////// Canvas setup with transparency effect of last frame

		// Capture the existing content
		let imageData = context.getImageData(0, 0, canvas.width, canvas.height);

		// Clear the canvas
		context.clearRect(0, 0, canvas.width, canvas.height);

		// Set the globalAlpha to 0.5
		context.globalAlpha = 1 - warpLocus.value;

		// Create a temporary canvas to draw the image data with transparency
		let tempCanvas = document.createElement('canvas');
		let tempContext = tempCanvas.getContext('2d');
		tempCanvas.width = canvas.width;
		tempCanvas.height = canvas.height;
		tempContext.putImageData(imageData, 0, 0);

		// Draw the image data from the temporary canvas back to the main canvas
		context.drawImage(tempCanvas, 0, 0);

		// Reset globalAlpha to 1.0
		context.globalAlpha = 1.0;

		//////////////////// Start drawing frame

		for (i = 0; i < STARS_QUANTITY; i++) {
			let st = stars[i];
			let lp = { x: st.x, y: st.y };

			st.x += st.vx;
			st.y += st.vy;

			context.strokeStyle = 'rgb(255,255,255)';
			context.lineWidth = st.radius * 2;
			context.lineCap = 'round';
			context.lineJoin = 'round';

			context.beginPath();
			context.moveTo(lp.x, lp.y);
			context.lineTo(st.x, st.y);
			context.closePath();
			context.stroke();
			context.fill();

			if (st.x > SCREEN_WIDTH + 10 || st.x < 0) {
				st.x = SCREEN_WIDTH / 2;
				st.y = SCREEN_HEIGHT / 2;
			}
			if (st.y > SCREEN_HEIGHT + 10 || st.y < 0) {
				st.x = SCREEN_WIDTH / 2;
				st.y = SCREEN_HEIGHT / 2;
			}
		}
	}

	function warp(warp_status) {
		warpFlag = warp_status;
		//console.log(warpFlag);
		//console.log(warp_status);

		TWEEN.removeAll();

		if (warpFlag == 1) {
			warpFlag = 0;
			for (i = 0; i < STARS_QUANTITY; i++) {
				let vxValue = (stars[i].x - SCREEN_WIDTH / 2) / 50; //speed
				let vyValue = (stars[i].y - SCREEN_HEIGHT / 2) / 50; //speed
				new TWEEN.Tween(stars[i])
					.to({ vx: vxValue }, 2000)
					.easing(TWEEN.Easing.Circular.In)
					.start();
				new TWEEN.Tween(stars[i])
					.to({ vy: vyValue }, 2000)
					.easing(TWEEN.Easing.Circular.In)
					.start();
				new TWEEN.Tween(warpLocus)
					.to({ value: 0.03 }, 0.1)
					.easing(TWEEN.Easing.Circular.In)
					.start();
			}
		} else {
			//console.log("no-warp");
			warpFlag = 0;
			for (i = 0; i < STARS_QUANTITY; i++) {
				let vxValue = (stars[i].x - SCREEN_WIDTH / 2) / 1000;
				let vyValue = (stars[i].y - SCREEN_HEIGHT / 2) / 1000;
				new TWEEN.Tween(stars[i])
					.to({ vx: vxValue }, 5000)
					.easing(TWEEN.Easing.Circular.Out)
					.start();
				new TWEEN.Tween(stars[i])
					.to({ vy: vyValue }, 5000)
					.easing(TWEEN.Easing.Circular.Out)
					.start();
				new TWEEN.Tween(warpLocus)
					.to({ value: 0.3 }, 5000)
					.easing(TWEEN.Easing.Circular.Out)
					.start();
			}
		}
	}

	function animate() {
		requestAnimationFrame(animate);
		TWEEN.update();
	}
</script>

<div class="gradient-bg fixed inset-0 -z-10 h-screen w-screen">
	<canvas bind:this={canvas} class="h-full w-full"></canvas>
</div>

<style>
	.gradient-bg {
		background:
			radial-gradient(circle, #ffff 0%, #fff0 40%),
			radial-gradient(
				99% 110.25% at 100% 84.32%,
				rgba(11, 1, 254, 0.15) 0%,
				rgba(10, 1, 254, 0) 100%
			),
			radial-gradient(
				56.18% 59.98% at 0% 14.33%,
				rgba(247, 1, 213, 0.2) 0%,
				rgba(247, 1, 213, 0) 100%
			),
			#faf1fe;
		background-attachment: fixed;
	}
</style>
