<script lang="ts">
	interface Props {
		onNext: () => void;
		prolificPid?: string | null;
	}

	let { onNext, prolificPid = null }: Props = $props();
	let surveyPassword = $state('');

	function handleNext() {
		if (surveyPassword === 'thankyou2025') {
			onNext();
		} else {
			alert('Incorrect password. Please check the survey for the correct password.');
		}
	}
</script>

<div class="flex h-[100svh] w-full grow flex-col items-center justify-center self-center">
	<div class="flex h-full w-full max-w-[800px] grow flex-col items-stretch justify-center">
		<iframe
			src={`https://mit.co1.qualtrics.com/jfe/form/SV_eKX1T3tCTAP1k7s?user_id=${prolificPid || '[userId]'}&cond=avatar`}
			frameborder="0"
			class="grow"
			title="Post-study Survey"
		>
			Loading…
		</iframe>

		<div class="flex flex-col gap-4 bg-white p-4">
			<div class="form-control flex w-full flex-col gap-2">
				<label for="post-survey-password"
					>Enter password from the end of the post-study survey above.</label
				>
				<input
					type="text"
					placeholder=""
					id="post-survey-password"
					class="input input-bordered"
					bind:value={surveyPassword}
				/>
			</div>
			<div class="card-actions flex w-full items-end justify-center gap-4 md:justify-end">
				<button
					class="btn btn-primary grow md:grow-0"
					disabled={surveyPassword !== 'thankyou2025'}
					onclick={handleNext}>Complete Study</button
				>
			</div>
		</div>
	</div>
</div>
