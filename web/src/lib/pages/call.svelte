<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Conversation } from '@elevenlabs/client';
	import HexagonAvatar from '$lib/components/HexagonAvatar.svelte';

	// Props
	interface Props {
		agentId?: string | null;
		avatar?: string;
		listeningVideo?: string | null;
		speakingVideo?: string | null;
		userName?: string;
		onComplete?: () => void;
	}

	let {
		agentId = null,
		avatar = '/image/profile.jpeg',
		listeningVideo = null,
		speakingVideo = null,
		userName = 'You',
		onComplete
	}: Props = $props();

	// ElevenLabs Conversation
	let conversation: any;
	let isSpeaking = $state(false);
	let audioAnalyser = $state<AnalyserNode | null>(null);
	let isMicMuted = $state(false);

	// Audio visualizer
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let animationId: number;
	let frequencyData: Uint8Array;

	// Visualizer settings
	const width = 200;
	const height = 80;
	const barColor = 'hsl(245, 100%, 49%)';
	const barWidth = 3;
	const barGap = 1;

	// Constants
	const SILENCE_THRESHOLD = 0.01;
	const SILENCE_TIMEOUT = 100;
	const MAX_SPEAKING_DURATION = 30000; // 30 seconds max before forcing unmute

	// Timers
	let speakingTimer: number;
	let maxSpeakingTimer: number;
	let callTimer: number;
	let goodbyeTimer: number;

	// Time tracking
	let time = $state('Connecting...');
	let callStartTime = 0;
	let showGoodbye = $state(false);
	let timerStarted = $state(false);

	// User profile data
	const userProfile = {
		name: `Future ${userName}`,
		avatar: avatar
	};

	// ============================================================================
	// Time Functions
	// ============================================================================

	function startTimer() {
		callStartTime = Date.now();
		callTimer = setInterval(() => {
			const elapsed = Math.floor((Date.now() - callStartTime) / 1000);
			const minutes = Math.floor(elapsed / 60);
			const seconds = elapsed % 60;
			time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
		}, 1000);

		// Show goodbye after 7 minutes
		goodbyeTimer = setTimeout(() => {
			showGoodbye = true;
		}, 420000);
	}

	// ============================================================================
	// Audio Detection
	// ============================================================================

	function setSpeakingState(speaking: boolean) {
		if (speaking) {
			isSpeaking = true;
			isMicMuted = true;
			if (conversation?.setMicMuted) {
				conversation.setMicMuted(true); // Mute mic
			}
			if (speakingTimer) clearTimeout(speakingTimer);

			// Set a maximum speaking duration to prevent permanent muting
			if (maxSpeakingTimer) clearTimeout(maxSpeakingTimer);
			maxSpeakingTimer = setTimeout(() => {
				console.warn('Max speaking duration reached, forcing unmute');
				isSpeaking = false;
				isMicMuted = false;
				if (conversation?.setMicMuted) {
					conversation.setMicMuted(false);
				}
			}, MAX_SPEAKING_DURATION);
		} else {
			speakingTimer = setTimeout(() => {
				isSpeaking = false;
				isMicMuted = false;
				if (conversation?.setMicMuted) {
					conversation.setMicMuted(false); // Unmute mic
				}
			}, SILENCE_TIMEOUT);

			// Clear the max speaking timer when silence is detected
			if (maxSpeakingTimer) clearTimeout(maxSpeakingTimer);
		}
	}

	function monitorAudioLevel() {
		if (!audioAnalyser) {
			requestAnimationFrame(monitorAudioLevel);
			return;
		}

		const frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
		audioAnalyser.getByteFrequencyData(frequencyData);

		const averageVolume =
			frequencyData.reduce((sum, value) => sum + value, 0) / frequencyData.length / 255;

		// Start timer when AI first speaks (audio detected)
		if (averageVolume > SILENCE_THRESHOLD && !timerStarted) {
			startTimer();
			timerStarted = true;
		}

		setSpeakingState(averageVolume > SILENCE_THRESHOLD);
		requestAnimationFrame(monitorAudioLevel);
	}

	// ============================================================================
	// Visualizer
	// ============================================================================

	function draw() {
		if (!ctx || !audioAnalyser) {
			animationId = requestAnimationFrame(draw);
			return;
		}

		// Initialize frequency data array if needed
		if (!frequencyData || frequencyData.length !== audioAnalyser.frequencyBinCount) {
			frequencyData = new Uint8Array(audioAnalyser.frequencyBinCount);
		}

		// Get frequency data from analyser
		audioAnalyser.getByteFrequencyData(frequencyData);

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

	// ============================================================================
	// Conversation Setup
	// ============================================================================

	function extractAudioAnalyser() {
		if (conversation.connection?.outputAnalyser) {
			audioAnalyser = conversation.connection.outputAnalyser;
		} else if (conversation.output?.analyser) {
			audioAnalyser = conversation.output.analyser;
		}

		if (audioAnalyser) {
			monitorAudioLevel();
			draw();
		}
	}

	async function initConversation() {
		if (!agentId) {
			console.error('No agent ID provided');
			return;
		}

		try {
			conversation = await Conversation.startSession({
				agentId: agentId,
				connectionType: 'webrtc',
				onMessage: (message) => console.log(message)
			});

			extractAudioAnalyser();
		} catch (error) {
			console.error('Failed to initialize conversation:', error);
		}
	}

	function cleanup() {
		if (animationId) {
			cancelAnimationFrame(animationId);
		}
		if (speakingTimer) {
			clearTimeout(speakingTimer);
		}
		if (maxSpeakingTimer) {
			clearTimeout(maxSpeakingTimer);
		}
		if (callTimer) {
			clearInterval(callTimer);
		}
		if (goodbyeTimer) {
			clearTimeout(goodbyeTimer);
		}
		if (conversation) {
			conversation.endSession?.();
		}
	}

	onMount(async () => {
		// Initialize canvas only if it exists
		if (canvas) {
			ctx = canvas.getContext('2d');
			if (ctx) {
				canvas.width = width;
				canvas.height = height;
			}
		}

		try {
			await initConversation();
		} catch (err) {
			console.error('Initialization error:', err);
		}

		return cleanup;
	});

	onDestroy(cleanup);
</script>

<div class="flex min-h-screen flex-col items-center justify-center">
	<div class="w-xl rounded-xl bg-white p-4">
		<div class="">
			<!-- Video Container with 3:4 aspect ratio -->
			<div class="relative aspect-[3/4] w-full overflow-hidden rounded-md">
				<!-- Speaking Video (base layer) -->
				{#if speakingVideo}
					<video
						src={speakingVideo}
						autoplay
						loop
						muted
						playsinline
						class="absolute inset-0 h-full w-full object-cover"
					></video>
				{:else}
					<div class="absolute inset-0 bg-gray-300"></div>
				{/if}

				<!-- Listening Video (overlay with opacity transition) -->
				{#if listeningVideo}
					<video
						src={listeningVideo}
						autoplay
						loop
						muted
						playsinline
						class="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
						style:opacity={isSpeaking ? 0 : 1}
					></video>
				{/if}
			</div>

			<!-- FFT Audio Visualizer -->

			<!-- Call Controls -->
			<div class="mt-4 flex items-center justify-between gap-8">
				<h4>{time}</h4>
				<div class="flex items-center justify-center gap-3">
					<canvas bind:this={canvas} class="h-10 w-48"></canvas>
					{#if showGoodbye}
						<button
							class="btn btn-primary h-10 min-h-10 rounded-full border-0 p-0 text-white"
							onclick={() => onComplete?.()}
						>
							👋 Good Bye
						</button>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<div class="mt-4 w-sm text-center text-xs text-balance text-neutral-500">
		Try refreshing your browser if the avatar isn’t connected after some time or encounter any
		issues.
	</div>
</div>
