<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Background from '$lib/components/background.svelte';
	import HexagonAvatar from '$lib/components/HexagonAvatar.svelte';

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationId: number;
	let frequencyData: Uint8Array;
	let audioContext: AudioContext | null = null;
	let analyser: AnalyserNode | null = null;
	let source: MediaStreamAudioSourceNode | null = null;
	let stream: MediaStream | null = null;

	// Visualizer settings
	const width = 200;
	const height = 80;
	const barColor = 'hsl(245, 100%, 49%)';
	const barWidth = 3;
	const barGap = 1;

	// User profile data
	const userProfile = {
		name: 'Future You',
		avatar: '/image/profile.jpeg'
	};

	async function setupAudio() {
		try {
			stream = await navigator.mediaDevices.getUserMedia({ audio: true });

			// Clean up existing audio context if any
			if (audioContext) {
				audioContext.close();
			}

			// Create audio context and analyser
			audioContext = new AudioContext();
			analyser = audioContext.createAnalyser();
			analyser.fftSize = 2048;
			analyser.smoothingTimeConstant = 0.8;

			// Connect stream to analyser
			source = audioContext.createMediaStreamSource(stream);
			source.connect(analyser);

			// Start drawing
			draw();
		} catch (error) {
			console.error('Error accessing microphone:', error);
		}
	}

	function draw() {
		if (!ctx || !analyser) {
			animationId = requestAnimationFrame(draw);
			return;
		}

		// Initialize frequency data array if needed
		if (!frequencyData || frequencyData.length !== analyser.frequencyBinCount) {
			frequencyData = new Uint8Array(analyser.frequencyBinCount);
		}

		// Get frequency data from analyser
		analyser.getByteFrequencyData(frequencyData);

		// Clear canvas
		ctx.fillStyle = 'transparent';
		ctx.clearRect(0, 0, width, height);

		// Calculate number of bars that fit
		const totalBarWidth = barWidth + barGap;
		const barCount = Math.floor(width / totalBarWidth);

		// Calculate how many frequency bins to average per bar
		const step = Math.floor(frequencyData.length / barCount);

		// Draw bars
		ctx.fillStyle = barColor;

		for (let i = 0; i < barCount; i++) {
			// Average frequency data for this bar
			let sum = 0;
			for (let j = 0; j < step; j++) {
				const index = i * step + j;
				if (index < frequencyData.length) {
					sum += frequencyData[index];
				}
			}
			const average = sum / step;

			// Calculate bar height (0-255 -> 0-height)
			const barHeight = (average / 255) * height;

			// Draw bar centered vertically
			const x = i * totalBarWidth;
			const y = (height - barHeight) / 2;

			ctx.fillRect(x, y, barWidth, barHeight);
		}

		animationId = requestAnimationFrame(draw);
	}

	function cleanup() {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		if (audioContext) {
			audioContext.close();
		}
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
		}
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = width;
		canvas.height = height;

		setupAudio();

		return cleanup;
	});

	onDestroy(cleanup);
</script>

<Background />

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="h-[100svh] w-full rounded-lg bg-white">
		<div class="card-body">
			<!-- Profile Section -->
			<div class="my-6 text-center">
				<div class="relative mb-4 inline-block">
					<HexagonAvatar src={userProfile.avatar} size="xxl" />
				</div>

				<h2 class="mb-2 text-2xl font-bold">{userProfile.name}</h2>
			</div>

			<!-- FFT Audio Visualizer -->
			<div class="mb-6">
				<!-- <canvas
					bind:this={canvas}
					width="100"
					height="80"
					class="h-16 w-full border border-neutral-800"
				></canvas> -->
			</div>

			<!-- Call Controls -->
			<div class="card-actions justify-center gap-4">
				<button class="btn btn-primary h-12 min-h-12 rounded-full border-0 p-0 text-white">
					👋 Good Bye
				</button>
			</div>
		</div>
	</div>
</div>
