<script>
	export let stepCurrent = 1;
	export let stepCount = 5;
</script>

<div class="line-stepper">
	{#each Array(stepCount) as _, i}
		<div class="line-step {i < stepCurrent ? 'line-step-active' : ''}"></div>
	{/each}
</div>

<style>
	.line-stepper {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: stretch;
		margin: 0;
		gap: 0.5rem;
		height: 4px;
		width: 100%;
	}

	.line-step {
		flex-grow: 1;
		border-radius: 999px;
		background-color: rgba(0, 0, 0, 0.1);
		min-width: 20px;
	}

	.line-step.line-step-active {
		background-color: #d600b5;
	}
</style>
