<script lang="ts">
	import LineStepper from '$lib/components/line-stepper.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let recordState: 'blank' | 'recording' | 'recorded' | 'uploaded' = 'blank';
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let audioBlob: Blob | null = null;
	let audioUrl: string = '';
	let fileInput: HTMLInputElement;

	async function startRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = () => {
				audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				audioUrl = URL.createObjectURL(audioBlob);
				recordState = 'recorded';
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			recordState = 'recording';
		} catch (err) {
			console.error('Error accessing microphone:', err);
			alert('Unable to access microphone');
		}
	}

	function stopRecording() {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
		}
	}

	function uploadFile() {
		fileInput.click();
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			audioBlob = file;
			audioUrl = URL.createObjectURL(file);
			recordState = 'uploaded';
		}
	}

	function resetRecording() {
		recordState = 'blank';
		audioBlob = null;
		audioUrl = '';
		if (fileInput) {
			fileInput.value = '';
		}
	}

	function handleSubmit() {
		if (!audioBlob) return;
		console.log('Voice submitted:', audioBlob);
		// Dispatch event to parent
		dispatch('complete', { audioBlob, audioUrl });
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="card w-full max-w-2xl">
		<div class="card-body flex justify-between">
			<!-- Stepper -->
			<div class="mb-6 flex justify-center">
				<LineStepper stepCurrent={7} stepCount={7} />
			</div>

			<div class="mb-6 text-center">
				<h2 class="mb-4 text-2xl font-bold">Record your voice</h2>
				<p class="mb-4 text-gray-600">Please read the following passage:</p>
				<div class="mx-auto max-w-lg rounded-lg bg-gray-50 p-4">
					<p class="text-justify font-serif text-base text-gray-700">
						"Far out in the uncharted backwaters of the unfashionable end of the western spiral arm
						of the Galaxy lies a small unregarded yellow sun. Orbiting this at a distance of roughly
						ninety-two million miles is an utterly insignificant little blue green planet whose
						ape-descended life forms are so amazingly primitive that they still think digital
						watches are a pretty neat idea."
					</p>
				</div>
			</div>

			<div class="flex grow flex-col items-center justify-center gap-4">
				<!-- Audio Visualization/Status -->
				<div class="mb-4 flex w-full items-center justify-center">
					{#if recordState === 'recording'}
						<div class="flex items-center gap-2">
							<div class="h-3 w-3 animate-pulse rounded-full bg-red-600"></div>
							<div class="text-sm font-medium text-gray-700">Recording</div>
						</div>
					{:else if recordState === 'recorded' || recordState === 'uploaded'}
						<div class="w-full max-w-md">
							<audio controls class="w-full" src={audioUrl}></audio>
						</div>
					{/if}
				</div>

				<!-- Button Controls -->
				<div class="flex w-full max-w-xs flex-col items-center gap-2">
					{#if recordState === 'blank'}
						<button class="btn btn-primary w-full" on:click={startRecording}>
							Start Recording
						</button>
						<div class="mt-1 flex w-full gap-3">
							<button class="btn btn-ghost w-full text-base" on:click={uploadFile}>
								Upload Audio File
							</button>
						</div>
					{:else if recordState === 'recording'}
						<button
							class="btn btn-primary w-full bg-red-600 hover:bg-red-700"
							on:click={stopRecording}
						>
							Stop Recording
						</button>
					{:else if recordState === 'recorded'}
						<button class="btn btn-primary w-full" on:click={startRecording}> Record Again </button>
						<button class="btn btn-ghost w-full" on:click={resetRecording}>
							Remove Recording
						</button>
					{:else if recordState === 'uploaded'}
						<button class="btn btn-ghost w-full" on:click={resetRecording}> Remove Audio </button>
					{/if}
				</div>
			</div>

			<!-- Note to listen before submitting -->
			{#if recordState === 'recorded' || recordState === 'uploaded'}
				<div class="mb-4 text-center">
					<p class="text-sm text-balance text-gray-600">
						🎙️ Please listen to your recording above before submitting to ensure the quality is
						good.
					</p>
				</div>
			{/if}

			<div class="card-actions flex w-full items-end justify-center gap-4 md:justify-end">
				<button
					class="btn btn-primary grow md:grow-0"
					disabled={recordState === 'blank' || recordState === 'recording'}
					on:click={handleSubmit}
				>
					Submit
				</button>
			</div>
		</div>
	</div>

	<!-- Hidden file input -->
	<input
		bind:this={fileInput}
		type="file"
		accept="audio/*"
		class="hidden"
		on:change={handleFileSelect}
	/>
</div>

<style>
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}
</style>
