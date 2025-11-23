<script lang="ts">
	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let stream: MediaStream | null = null;
	let capturedBlob: Blob | null = null;
	let isCameraActive = false;
	let isProcessing = false;
	let agedImageUrl: string | null = null;
	let errorMessage: string = '';

	async function startCamera() {
		if (isCameraActive) {
			// Cancel camera
			if (stream) {
				stream.getTracks().forEach((track) => track.stop());
			}
			video.classList.add('hidden');
			isCameraActive = false;
			return;
		}

		try {
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'user' },
				audio: false
			});
			video.srcObject = stream;
			video.classList.remove('hidden');
			canvas.classList.add('hidden');
			isCameraActive = true;
		} catch (err) {
			errorMessage = 'Error accessing camera: ' + (err as Error).message;
		}
	}

	function capturePhoto() {
		if (!isCameraActive || !video) return;

		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const ctx = canvas.getContext('2d');
		if (ctx) {
			ctx.drawImage(video, 0, 0);
			canvas.toBlob(
				(blob) => {
					if (blob) {
						capturedBlob = blob;
						canvas.classList.remove('hidden');
						video.classList.add('hidden');

						if (stream) {
							stream.getTracks().forEach((track) => track.stop());
						}

						isCameraActive = false;
					}
				},
				'image/jpeg',
				0.9
			);
		}
	}

	function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			capturedBlob = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				canvas.width = 640;
				canvas.height = 640;
				const ctx = canvas.getContext('2d');
				const img = new Image();
				img.onload = () => {
					if (ctx) {
						// Calculate dimensions to maintain aspect ratio in a square
						const size = Math.min(img.width, img.height);
						const x = (img.width - size) / 2;
						const y = (img.height - size) / 2;
						ctx.drawImage(img, x, y, size, size, 0, 0, 640, 640);
						canvas.classList.remove('hidden');
					}
				};
				img.src = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	}

	function clearImage() {
		capturedBlob = null;
		canvas.classList.add('hidden');
		video.classList.add('hidden');
		agedImageUrl = null;
		errorMessage = '';
		if (stream) {
			stream.getTracks().forEach((track) => track.stop());
			stream = null;
		}
		isCameraActive = false;
	}

	async function submitImage() {
		if (!capturedBlob) return;

		isProcessing = true;
		errorMessage = '';
		agedImageUrl = null;

		try {
			const formData = new FormData();
			formData.append('image', capturedBlob, 'photo.jpg');

			const response = await fetch('/api/age', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			console.log(result);

			if (response.ok && result.output) {
				agedImageUrl = result.output;
			} else {
				errorMessage = result.error || 'Failed to process image';
			}
		} catch (err) {
			errorMessage = 'Error: ' + (err as Error).message;
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="flex min-h-screen flex-col gap-6 bg-gray-50 p-8">
	<div class="mx-auto w-full max-w-4xl">
		<h1 class="mb-2 text-center text-3xl font-bold">Future Self Portrait</h1>
		<p class="mb-6 text-center text-gray-600">
			Upload or capture your photo to see yourself at age 50
		</p>

		<!-- Image Upload Section -->
		<div class="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
			<h2 class="mb-4 text-xl font-semibold">📸 Your Photo</h2>
			<p class="mb-4 text-sm text-gray-700">
				Please ensure: <strong>(1) 💡 good lighting</strong>, <strong>(2) 😀 face forward</strong>,
				and <strong>(3) ⬛ plain background</strong>
			</p>

			<!-- Image Preview -->
			<div
				class="relative mb-4 aspect-square w-full overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
			>
				<video bind:this={video} autoplay class="hidden h-full w-full object-cover"></video>
				<canvas bind:this={canvas} class="hidden h-full w-full object-cover"></canvas>
				{#if !capturedBlob && !isCameraActive}
					<div class="flex h-full items-center justify-center text-gray-400">No image</div>
				{/if}
				{#if capturedBlob}
					<button
						on:click={clearImage}
						class="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-600"
					>
						×
					</button>
				{/if}
			</div>

			<!-- Camera/File Controls -->
			<div class="mb-4 grid grid-cols-2 gap-3">
				<button
					on:click={isCameraActive ? capturePhoto : startCamera}
					class="rounded-md bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-700"
				>
					{isCameraActive ? 'Capture' : 'Take Photo'}
				</button>
				<label
					class="cursor-pointer rounded-md bg-neutral-900 px-4 py-2 text-center text-white hover:bg-neutral-700"
				>
					Choose File
					<input type="file" accept="image/*" on:change={handleFileUpload} class="hidden" />
				</label>
			</div>

			<!-- Submit Button -->
			<button
				on:click={submitImage}
				disabled={!capturedBlob || isProcessing}
				class="w-full rounded-md bg-indigo-800 px-4 py-3 text-lg text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{isProcessing ? 'Processing...' : 'Generate Future Self'}
			</button>

			<!-- Error Message -->
			{#if errorMessage}
				<div class="mt-4 rounded-md bg-red-100 p-3 text-center text-red-800">
					{errorMessage}
				</div>
			{/if}
		</div>

		<!-- Result Section -->
		{#if agedImageUrl}
			<div class="mt-6 rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-xl font-semibold">✨ Your Future Self at 50</h2>
				<img src={agedImageUrl} alt="Aged portrait" class="w-full rounded-lg" />
			</div>
		{/if}
	</div>
</div>
