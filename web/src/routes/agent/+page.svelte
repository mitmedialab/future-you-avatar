<script lang="ts">
	import { onMount } from 'svelte';

	let agentId: string | null = null;
	let loading = true;
	let error: string | null = null;

	async function createAgent() {
		try {
			const response = await fetch('/api/agent', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});
			
			const result = await response.json();
			
			if (result.success) {
				agentId = result.agentId;
				console.log('Agent created successfully:', agentId);
			} else {
				error = result.error || 'Failed to create agent';
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Network error';
			console.error('Error creating agent:', err);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		createAgent();
	});
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-4">
	<div class="text-center">
		<h1 class="mb-4 text-4xl font-bold">Agent Page</h1>
		
		{#if loading}
			<p class="text-lg text-gray-600">Creating ElevenLabs agent...</p>
		{:else if error}
			<p class="text-lg text-red-600">Error: {error}</p>
		{:else if agentId}
			<p class="text-lg text-green-600">Agent created successfully!</p>
			<p class="text-sm text-gray-500 mt-2">Agent ID: {agentId}</p>
		{/if}
	</div>
</div>