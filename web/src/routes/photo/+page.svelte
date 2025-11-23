<script lang="ts">
	import Photo from '$lib/pages/photo.svelte';

	let photoData: { imageData: string; imageFile: File | null } | null = null;
	let agedPhotoUrl: string | null = null;
	let listeningVideoUrl: string | null = null;
	let speakingVideoUrl: string | null = null;
	let isProcessing = $state(false);
	let error = $state<string | null>(null);

	async function handlePhotoComplete(event: CustomEvent) {
		photoData = event.detail;
		console.log('Photo completed:', photoData);

		if (!photoData?.imageFile) {
			console.log('No image file provided');
			return;
		}

		isProcessing = true;
		error = null;

		try {
			const formData = new FormData();
			formData.append('image', photoData.imageFile);

			console.log('Sending photo to API...');
			const response = await fetch('/api/age', { method: 'POST', body: formData });
			const result = await response.json();

			if (response.ok) {
				agedPhotoUrl = result.agedPhoto;
				listeningVideoUrl = result.listeningVideo;
				speakingVideoUrl = result.speakingVideo;
				console.log('Success!');
				console.log('Aged photo:', agedPhotoUrl);
				console.log('Listening video:', listeningVideoUrl);
				console.log('Speaking video:', speakingVideoUrl);
			} else {
				error = result.error || 'Failed to process image';
				console.error('API error:', error);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to process image';
			console.error('Processing error:', err);
		} finally {
			isProcessing = false;
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	{#if !photoData}
		<Photo on:complete={handlePhotoComplete} />
	{:else}
		<div class="flex min-h-screen flex-col items-center justify-center p-4">
			<div class="w-full max-w-4xl rounded-xl bg-white p-8 shadow-lg">
				<h1 class="mb-6 text-3xl font-bold">Photo Processing Test</h1>

				{#if isProcessing}
					<div class="mb-6 text-center">
						<div class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
						<p class="text-lg text-gray-600">Processing your photo...</p>
						<p class="text-sm text-gray-500">This may take 1-2 minutes</p>
					</div>
				{/if}

				{#if error}
					<div class="mb-6 rounded-lg bg-red-50 p-4">
						<p class="font-semibold text-red-700">Error:</p>
						<p class="text-red-600">{error}</p>
					</div>
				{/if}

				{#if agedPhotoUrl || listeningVideoUrl || speakingVideoUrl}
					<div class="space-y-6">
						<h2 class="text-2xl font-bold text-green-600">✓ Results</h2>

						{#if agedPhotoUrl}
							<div>
								<h3 class="mb-2 text-lg font-semibold">Aged Photo (3:4)</h3>
								<img src={agedPhotoUrl} alt="Aged" class="rounded-lg shadow-md" style="max-width: 400px;" />
								<p class="mt-2 break-all text-xs text-gray-500">{agedPhotoUrl}</p>
							</div>
						{:else if isProcessing}
							<div class="flex items-center gap-2">
								<span class="text-gray-400">⏳</span>
								<span class="text-gray-600">Generating aged photo...</span>
							</div>
						{/if}

						{#if listeningVideoUrl}
							<div>
								<h3 class="mb-2 text-lg font-semibold">Listening Video</h3>
								<video src={listeningVideoUrl} controls class="rounded-lg shadow-md" style="max-width: 400px;"></video>
								<p class="mt-2 break-all text-xs text-gray-500">{listeningVideoUrl}</p>
							</div>
						{:else if isProcessing}
							<div class="flex items-center gap-2">
								<span class="text-gray-400">⏳</span>
								<span class="text-gray-600">Generating listening video...</span>
							</div>
						{/if}

						{#if speakingVideoUrl}
							<div>
								<h3 class="mb-2 text-lg font-semibold">Speaking Video</h3>
								<video src={speakingVideoUrl} controls class="rounded-lg shadow-md" style="max-width: 400px;"></video>
								<p class="mt-2 break-all text-xs text-gray-500">{speakingVideoUrl}</p>
							</div>
						{:else if isProcessing}
							<div class="flex items-center gap-2">
								<span class="text-gray-400">⏳</span>
								<span class="text-gray-600">Generating speaking video...</span>
							</div>
						{/if}
					</div>
				{/if}

				<div class="mt-8">
					<button
						class="btn btn-primary"
						onclick={() => {
							photoData = null;
							agedPhotoUrl = null;
							listeningVideoUrl = null;
							speakingVideoUrl = null;
							error = null;
						}}
					>
						Upload Another Photo
					</button>
				</div>
			</div>
		</div>
	{/if}
</div>
