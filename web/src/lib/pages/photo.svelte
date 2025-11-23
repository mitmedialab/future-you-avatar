<script lang="ts">
	import LineStepper from '$lib/components/line-stepper.svelte';
	import HexagonAvatar from '$lib/components/HexagonAvatar.svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let uploadState: 'blank' | 'browsed' | 'camera' | 'taken' = 'blank';
	let videoElement: HTMLVideoElement;
	let canvasElement: HTMLCanvasElement;
	let fileInput: HTMLInputElement;
	let uploadedImageSrc = '';
	let uploadedFile: File | null = null;

	function startCamera() {
		uploadState = 'camera';
		navigator.mediaDevices
			.getUserMedia({ video: true })
			.then((stream) => {
				if (videoElement) {
					videoElement.srcObject = stream;
				}
			})
			.catch((err) => {
				console.error('Error accessing camera:', err);
				alert('Unable to access camera');
				resetUpload();
			});
	}

	function browsePhotos() {
		fileInput.click();
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			uploadedFile = file;
			const reader = new FileReader();
			reader.onload = (e) => {
				uploadedImageSrc = e.target?.result as string;
				uploadState = 'browsed';
			};
			reader.readAsDataURL(file);
		}
	}

	function takePhoto() {
		if (!canvasElement || !videoElement) {
			console.error('Canvas or video element not found');
			return;
		}

		if (!videoElement.videoWidth || !videoElement.videoHeight) {
			console.error('Video dimensions not ready');
			return;
		}

		try {
			const context = canvasElement.getContext('2d');
			if (context) {
				canvasElement.width = videoElement.videoWidth;
				canvasElement.height = videoElement.videoHeight;
				context.drawImage(videoElement, 0, 0);

				uploadedImageSrc = canvasElement.toDataURL('image/jpeg', 0.8);

				// Convert canvas to blob/file
				canvasElement.toBlob(
					(blob) => {
						if (blob) {
							uploadedFile = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
						}
					},
					'image/jpeg',
					0.8
				);

				// Stop camera stream
				const stream = videoElement.srcObject as MediaStream;
				if (stream) {
					const tracks = stream.getTracks();
					tracks.forEach((track) => track.stop());
				}

				uploadState = 'taken';
			}
		} catch (err) {
			console.error('Error capturing photo:', err);
		}
	}

	function resetUpload() {
		uploadState = 'blank';
		uploadedImageSrc = '';
		uploadedFile = null;

		// Stop camera if running
		if (videoElement && videoElement.srcObject) {
			const stream = videoElement.srcObject as MediaStream;
			const tracks = stream.getTracks();
			tracks.forEach((track) => track.stop());
		}

		// Clear file input
		if (fileInput) {
			fileInput.value = '';
		}
	}

	async function handleSubmit() {
		if (!uploadedImageSrc) return;

		console.log('Photo submitted:', uploadedImageSrc.substring(0, 50) + '...');
		console.log('uploadedFile:', uploadedFile);

		// If no file (camera capture), convert base64 to file
		if (!uploadedFile && uploadedImageSrc) {
			const response = await fetch(uploadedImageSrc);
			const blob = await response.blob();
			uploadedFile = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
		}

		// Dispatch event to parent immediately
		dispatch('complete', { imageData: uploadedImageSrc, imageFile: uploadedFile });
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="card w-full max-w-2xl">
		<div class="card-body flex justify-between">
			<!-- Stepper -->
			<div class="mb-6 flex justify-center">
				<LineStepper stepCurrent={1} stepCount={7} />
			</div>

			<div class="mb-6 text-center">
				<h2 class="mb-4 text-2xl font-bold">Take a photo of you now</h2>

				<div class="inline-block rounded-lg">
					<div class="grid grid-cols-2 gap-2">
						<div class="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium">📸 Clear face</div>
						<div class="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium">💡 Well lit</div>
						<div class="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium">👤 Face only</div>
						<div class="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium">
							🚫 No accessories
						</div>
					</div>
				</div>
			</div>

			<div class="flex grow flex-col items-center justify-center gap-2">
				<!-- Fixed container with 3:4 aspect ratio (width:height) -->
				<div class="mb-4 flex w-64 items-center justify-center" style="height: 341px;">
					{#if uploadState === 'blank'}
						<div class="h-full w-full overflow-hidden rounded-lg">
							<img
								src="/image/profile.jpeg"
								alt="Profile placeholder"
								class="h-full w-full object-cover"
							/>
						</div>
					{:else if uploadState === 'browsed'}
						<div class="h-full w-full overflow-hidden rounded-lg">
							<img src={uploadedImageSrc} alt="Uploaded" class="h-full w-full object-cover" />
						</div>
					{:else if uploadState === 'camera'}
						<div class="h-full w-full overflow-hidden rounded-lg">
							<video
								bind:this={videoElement}
								class="h-full w-full object-cover"
								autoplay
								muted
								playsinline
							></video>
						</div>
					{:else if uploadState === 'taken'}
						<div class="h-full w-full overflow-hidden rounded-lg">
							<img src={uploadedImageSrc} alt="Captured" class="h-full w-full object-cover" />
						</div>
					{/if}
				</div>

				<!-- Fixed button area to prevent layout shift -->
				<div class="flex w-full max-w-xs flex-col items-center gap-2">
					{#if uploadState === 'blank'}
						<button class="btn btn-primary w-full" onclick={startCamera}>Use Camera</button>
						<div class="mt-1 flex w-full gap-3">
							<button class="btn btn-ghost w-full text-base" onclick={browsePhotos}
								>Browse Photos</button
							>
						</div>
					{:else if uploadState === 'browsed'}
						<button class="btn btn-ghost w-full" onclick={resetUpload}>Remove Photo</button>
					{:else if uploadState === 'camera'}
						<button class="btn btn-primary w-full" onclick={takePhoto}>Take Photo</button>
						<button class="btn btn-ghost w-full" onclick={resetUpload}>
							Cancel Taking Photo
						</button>
					{:else if uploadState === 'taken'}
						<button class="btn btn-primary w-full" onclick={startCamera}>Retake Photo</button>
						<button class="btn btn-ghost w-full" onclick={resetUpload}>Remove Photo</button>
					{/if}
				</div>
			</div>

			<div class="card-actions flex w-full items-end justify-center gap-4 md:justify-end">
				<button
					class="btn btn-primary grow md:grow-0"
					disabled={uploadState === 'blank'}
					onclick={handleSubmit}
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
		accept="image/*"
		class="hidden"
		onchange={handleFileSelect}
	/>

	<!-- Hidden canvas for photo capture -->
	<canvas bind:this={canvasElement} class="hidden" width="640" height="480"></canvas>
</div>
