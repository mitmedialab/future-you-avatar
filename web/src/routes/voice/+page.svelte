<script lang="ts">
	let recordBtn: HTMLButtonElement;
	let stopRecordBtn: HTMLButtonElement;
	let recordAgainBtn: HTMLButtonElement;
	let audioPlayback: HTMLAudioElement;
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let audioBlob: Blob | null = null;
	let isProcessing = false;
	let voiceId: string | null = null;
	let errorMessage: string = '';
	let successMessage: string = '';

	async function startRecording() {
		try {
			const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(audioStream);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = () => {
				audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				audioPlayback.src = URL.createObjectURL(audioBlob);
				audioPlayback.classList.remove('hidden');
				recordAgainBtn.classList.remove('hidden');
				stopRecordBtn.classList.add('hidden');
				recordBtn.classList.add('hidden');

				audioStream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			recordBtn.classList.add('hidden');
			stopRecordBtn.classList.remove('hidden');
		} catch (err) {
			errorMessage = 'Error accessing microphone: ' + (err as Error).message;
		}
	}

	function stopRecording() {
		if (mediaRecorder && mediaRecorder.state !== 'inactive') {
			mediaRecorder.stop();
		}
	}

	function recordAgain() {
		audioBlob = null;
		voiceId = null;
		successMessage = '';
		errorMessage = '';
		audioPlayback.classList.add('hidden');
		recordAgainBtn.classList.add('hidden');
		recordBtn.classList.remove('hidden');
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			audioBlob = file;
			audioPlayback.src = URL.createObjectURL(file);
			audioPlayback.classList.remove('hidden');
			recordAgainBtn.classList.remove('hidden');
			recordBtn.classList.add('hidden');
			stopRecordBtn.classList.add('hidden');
		}
	}

	async function submitVoice() {
		if (!audioBlob) return;

		isProcessing = true;
		errorMessage = '';
		successMessage = '';
		voiceId = null;

		try {
			const formData = new FormData();
			formData.append('audio', audioBlob, 'recording.webm');
			formData.append('name', 'My Voice Clone');
			formData.append('description', 'Voice clone created from recording');

			const response = await fetch('/api/voice-clone', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();
			console.log('Voice clone response:', result);
			console.log('Full result object:', JSON.stringify(result, null, 2));

			if (response.ok && result.voiceId) {
				voiceId = result.voiceId;
				successMessage = 'Voice clone created successfully!';
			} else {
				errorMessage = result.error || 'Failed to create voice clone';
			}
		} catch (err) {
			errorMessage = 'Error: ' + (err as Error).message;
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="flex min-h-screen flex-col gap-6 bg-gray-50 p-8">
	<div class="mx-auto w-full max-w-2xl">
		<h1 class="mb-2 text-center text-3xl font-bold">Voice Clone</h1>
		<p class="mb-6 text-center text-gray-600">
			Record your voice to create a personalized voice clone
		</p>

		<!-- Voice Recording Section -->
		<div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">🎙️ Record Your Voice</h2>
			<p class="mb-4 font-serif text-sm text-gray-700">
				Please read the following passage clearly:
			</p>
			<p class="mb-6 rounded-md bg-gray-50 p-4 font-serif text-sm italic">
				"Far out in the uncharted backwaters of the unfashionable end of the western spiral arm of
				the Galaxy lies a small unregarded yellow sun. Orbiting this at a distance of roughly
				ninety-two million miles is an utterly insignificant little blue green planet whose
				ape-descended life forms are so amazingly primitive that they still think digital watches
				are a pretty neat idea."
			</p>

			<!-- Audio Playback -->
			<audio bind:this={audioPlayback} controls class="mb-4 hidden w-full"></audio>

			<!-- Recording Controls -->
			<div class="mb-4 grid grid-cols-2 gap-3">
				<button
					bind:this={recordBtn}
					on:click={startRecording}
					class="rounded-md bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700"
				>
					Record Voice
				</button>
				<label
					class="cursor-pointer rounded-md bg-neutral-900 px-4 py-2 text-center text-white hover:bg-neutral-700"
				>
					Upload File
					<input type="file" accept="audio/*" on:change={handleFileUpload} class="hidden" />
				</label>
				<button
					bind:this={stopRecordBtn}
					on:click={stopRecording}
					class="col-span-2 hidden rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
				>
					Stop
				</button>
				<button
					bind:this={recordAgainBtn}
					on:click={recordAgain}
					class="col-span-2 hidden rounded-md bg-neutral-700 px-4 py-2 text-white hover:bg-neutral-600"
				>
					Record Again
				</button>
			</div>

			<!-- Submit Button -->
			<button
				on:click={submitVoice}
				disabled={!audioBlob || isProcessing}
				class="w-full rounded-md bg-indigo-800 px-4 py-3 text-lg text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{isProcessing ? 'Creating Voice Clone...' : 'Create Voice Clone'}
			</button>

			<!-- Success Message -->
			{#if successMessage}
				<div class="mt-4 rounded-md bg-green-100 p-3 text-center text-green-800">
					{successMessage}
					{#if voiceId}
						<div class="mt-2 rounded bg-green-50 p-2 font-mono text-sm">
							Voice ID: {voiceId}
						</div>
					{/if}
				</div>
			{/if}

			<!-- Error Message -->
			{#if errorMessage}
				<div class="mt-4 rounded-md bg-red-100 p-3 text-center text-red-800">
					{errorMessage}
				</div>
			{/if}
		</div>

		<!-- Info Section -->
		<div class="mt-6 rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
			<h3 class="mb-2 text-lg font-semibold">ℹ️ Tips for Best Results</h3>
			<ul class="list-inside list-disc space-y-1 text-sm text-gray-700">
				<li>Record in a quiet environment</li>
				<li>Speak clearly and naturally</li>
				<li>Read the passage at a comfortable pace</li>
				<li>Avoid background noise</li>
				<li>Use a good quality microphone if available</li>
			</ul>
		</div>
	</div>
</div>
