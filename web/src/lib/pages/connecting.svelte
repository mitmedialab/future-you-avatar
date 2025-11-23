<script lang="ts">
	export let claudeMemory: string | null = null;
	export let agedPhotoUrl: string | null = null;
	export let listeningVideoUrl: string | null = null;
	export let speakingVideoUrl: string | null = null;
	export let voiceCloneId: string | null = null;
	export let agentId: string | null = null;

	$: allComplete =
		claudeMemory &&
		agedPhotoUrl &&
		listeningVideoUrl &&
		speakingVideoUrl &&
		voiceCloneId &&
		agentId;
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-4">
	<!-- Clock Animation -->
	<div class="mb-8 h-32 w-32">
		<img src="/image/clock-animated.svg" alt="Loading clock" class="h-full w-full" />
	</div>

	<div class="mb-8 text-center">
		<h1 class="mb-4 text-4xl font-bold">Connecting to Future You...</h1>
		<p class="text-lg text-gray-600">Please wait a moment</p>
		<p class="mt-2 text-sm text-gray-500">
			If you encounter an error, you can refresh the page without losing progress
		</p>
	</div>

	<!-- Processing Status -->
	<div class="flex flex-wrap justify-center gap-4">
		<div class="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1">
			<span class="text-gray-700">Memories</span>
			{#if claudeMemory}
				<span class="text-green-600">✓</span>
			{:else}
				<span class="text-gray-400">⏳</span>
			{/if}
		</div>

		<div class="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1">
			<span class="text-gray-700">Photo</span>
			{#if agedPhotoUrl}
				<span class="text-green-600">✓</span>
			{:else}
				<span class="text-gray-400">⏳</span>
			{/if}
		</div>

		<!-- <div class="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1">
			<span class="text-gray-700">Videos</span>
			{#if listeningVideoUrl && speakingVideoUrl}
				<span class="text-green-600">✓</span>
			{:else}
				<span class="text-gray-400">⏳</span>
			{/if}
		</div> -->

		<div class="flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1">
			<span class="text-gray-700">Voice</span>
			{#if voiceCloneId}
				<span class="text-green-600">✓</span>
			{:else}
				<span class="text-gray-400">⏳</span>
			{/if}
		</div>

		<!-- <div class="flex items-center justify-between">
			<span class="text-gray-700">Ready!</span>
			{#if agentId}
				<span class="text-green-600">✓</span>
			{:else if claudeMemory && agedPhotoUrl && voiceCloneId}
				<span class="text-blue-600">⚙️</span>
			{:else}
				<span class="text-gray-400">⏳</span>
			{/if}
		</div> -->

		<!-- {#if allComplete}
			<div class="mt-6 rounded-lg bg-green-50 p-4">
				<p class="font-semibold text-green-700">🎉 Future You is ready!</p>
			</div>
		{/if} -->
	</div>
</div>
