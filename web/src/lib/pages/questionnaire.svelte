<script lang="ts">
	import LineStepper from '$lib/components/line-stepper.svelte';
	import { createEventDispatcher, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	let currentStep = 1;
	let formData: Record<string, string | number> = {};

	// Load from localStorage on mount
	onMount(() => {
		const saved = localStorage.getItem('questionnaire-data');
		if (saved) {
			formData = JSON.parse(saved);
		}
	});

	// Save to localStorage
	function saveToLocalStorage() {
		console.log('SAVE!');
		localStorage.setItem('questionnaire-data', JSON.stringify(formData));
	}

	// Check if all required fields are filled
	function validateCurrentStep() {
		const currentStepData = steps[currentStep - 1];
		const emptyFields: string[] = [];

		for (const question of currentStepData.questions) {
			const value = formData[question.id];
			if (!value || (typeof value === 'string' && value.trim() === '')) {
				emptyFields.push(question.question);
			}
		}

		if (emptyFields.length > 0) {
			alert('Please make sure to answer all the questions');
			return false;
		}
		return true;
	}

	function autofill() {
		formData = {
			name: 'Alex Johnson',
			place: 'Seattle, Washington',
			age: '24',
			pronoun: 'they/them',
			people_in_life: 'My mentor Dr. Sarah Chen, my best friend Maya, my parents John and Linda',
			proud:
				"I led a team project that developed an AI-powered accessibility tool for visually impaired students, which is now used in 5 universities. It was incredibly rewarding to see the positive impact on students' lives.",
			low_point:
				'During my junior year, I failed a major Computer Science course and doubted my abilities. I was at MIT, surrounded by brilliant peers, and felt like an imposter. This moment taught me the importance of asking for help and persistence.',
			turning_point:
				'At a hackathon in 2023, I met a startup founder who offered me an internship. This experience showed me how technology can solve real-world problems and shifted my focus from pure academia to applied AI for social good.',
			biggest_challenge:
				"Balancing my passion for AI research with the practical need to build financially sustainable solutions. I've been working on open-source projects but struggle to monetize them while keeping them accessible.",
			life_project:
				'Building an AI platform that makes advanced machine learning tools accessible to non-technical educators and social workers. I decided on this after seeing how technology could help underserved communities during my volunteer work.',
			career:
				'AI Research Scientist focusing on ethical AI and accessibility, possibly leading my own research lab or startup',
			professional_accomplish:
				"I hope to be a tenured professor at a research university, running a lab focused on AI for social good. I'm still actively teaching and mentoring, working about 50 hours a week, splitting time between my lab and collaborative projects with NGOs worldwide.",
			financial_accomplish:
				"I want to have saved enough to own a comfortable home and support my research without constant grant pressure. My income comes from a mix of university salary, consulting, and royalties from AI tools I've developed.",
			where_to_live:
				"I'd like to live in a mid-size college town with a strong tech community and access to nature - somewhere like Boulder, Colorado or Ann Arbor, Michigan.",
			daily_life:
				"I see myself hiking on weekends, playing piano in the evenings, and hosting dinner parties where we discuss technology ethics. I'd also be mentoring students and contributing to open-source AI projects in my spare time."
		};
	}

	const steps = [
		{
			title: 'Tell us a bit about yourself.',
			questions: [
				{
					id: 'name',
					question: 'What is your name?',
					type: 'text',
					placeholder: ''
				},
				{
					id: 'place',
					question: 'Where are you from?',
					type: 'text',
					placeholder: ''
				},
				{
					id: 'age',
					question: 'How old are you?',
					type: 'number',
					placeholder: ''
				},
				{
					id: 'pronoun',
					question: 'What are your pronouns?',
					type: 'text',
					placeholder: ''
				}
			]
		},
		{
			title: 'Answer the following questions about your present self.',
			questions: [
				{
					id: 'people_in_life',
					icon: '💼',
					question:
						'Who are the most important people in your life or people you think you will frequently interact with in the future?',
					subText:
						'Please indicate their role and name (e.g. my professor Dr. Smith, my mentor Sarah)',
					type: 'text',
					placeholder: ''
				},
				{
					id: 'proud',
					icon: '🏆',
					question: 'What is one thing you are proud of in your life',
					subText:
						'Please describe a professional achievement, project, or moment in your career that stands out as an especially positive experience and why.',
					type: 'text'
				},
				{
					id: 'low_point',
					icon: '😔',
					question: 'Describe a significant low point in your life.',
					subText:
						'Include the event, workplace, people involved, your thoughts and emotions, and why you believe this moment was particularly difficult and what it reveals about your professional growth?',
					type: 'text'
				},
				{
					id: 'turning_point',
					icon: '🪧',
					question: 'Describe a turning point in your life.',
					subText:
						'Include what happened, when and where it occurred, and who was involved? How did this event impact your career path and what does it reveal about your professional development?',
					type: 'textarea'
				}
			]
		},
		{
			title: "Now, let's think about the future.",
			questions: [
				{
					id: 'biggest_challenge',
					icon: '🏔️',
					question: 'What is a life challenge you would like to overcome?',
					subText: [
						'How did this life challenge or problem develop?',
						'How did you address or deal with this life challenge or problem?',
						'What is the significance of this challenge or problem in your professional development?'
					],
					type: 'textarea'
				},
				{
					id: 'life_project',
					icon: '🖼️',
					question: "What is a life goal you're working towards?",
					subText:
						"How did you decide on this goal, how do you see it developing, and why do you think it's important for you and/or others?",
					type: 'textarea'
				},
				{
					id: 'career',
					icon: '🧑‍🚀',
					question: 'What do you hope your career will be?',
					type: 'text'
				}
			]
		},
		{
			title: 'Try to imagine yourself in 30 years.',
			questions: [
				{
					id: 'professional_accomplish',
					icon: '🧓',
					question: 'Describe your ideal professional lifestyle.',
					subText: [
						'E.g., what you hope to have accomplished professionally',
						'Are you retired or still working',
						'How many hours you work',
						'Where you work',
						'Whether you joined an existing organization or started your own, etc.'
					],
					type: 'textarea',
					placeholder:
						'I would like to be a full time high school biology teacher in Boston. I am very excited to teach kids and help them learn new things about the natural world.'
				},
				{
					id: 'financial_accomplish',
					icon: '💰',
					question: 'Describe your ideal financial situation.',
					subText: [
						'E.g., what you use your money for',
						'How much saving you plan to do',
						'Your sources of income, etc'
					],
					type: 'textarea',
					placeholder:
						'I would like to have enough savings to buy a house with a beautiful garden and wonderful vacations oversea once a year.'
				}
			]
		},
		{
			title: 'Try to imagine yourself in 30 years.',
			questions: [
				{
					id: 'where_to_live',
					icon: '🗺️',
					question: 'Where do you hope to live in 30 years?',
					type: 'textarea',
					placeholder:
						'I would like to live in an urban area with a nice neighborhood not far from my workplace.'
				},
				{
					id: 'daily_life',
					icon: '🏡',
					question: 'What would your daily life look like?',
					subText: [
						'What hobbies do you think you will have?',
						'What are some things you would do in your spare time?'
					],
					type: 'textarea'
				}
			]
		}
	];

	function goNext() {
		// Validate current step before proceeding
		if (!validateCurrentStep()) {
			return;
		}

		if (currentStep < steps.length) {
			currentStep++;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else {
			// Handle completion - dispatch event to parent
			console.log('Form completed:', formData);
			dispatch('complete', formData);
		}
	}

	function goBack() {
		if (currentStep > 1) {
			currentStep--;
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="card w-full max-w-2xl">
		<div class="card-body questionnaire-page">
			<!-- Stepper -->
			<div class="mb-6 flex justify-center">
				<LineStepper stepCurrent={currentStep} stepCount={steps.length} />
			</div>

			<!-- Current Step -->
			{#if steps[currentStep - 1]}
				{@const step = steps[currentStep - 1]}
				<h2 class="questionnaire-page-title mb-6 text-2xl">{step.title}</h2>

				{#each step.questions as question}
					<div class="questionnaire-group">
						{#if question.icon}
							<div class="question-icon">{question.icon}</div>
						{/if}

						<label for={question.id}>
							<div class="question-main">{question.question}</div>
							{#if question.subText}
								<div class="question-sub">
									{#if Array.isArray(question.subText)}
										<ul>
											{#each question.subText as item}
												<li>{item}</li>
											{/each}
										</ul>
									{:else}
										{question.subText}
									{/if}
								</div>
							{/if}
						</label>

						{#if question.type === 'textarea'}
							<textarea
								id={question.id}
								class="textarea textarea-bordered"
								placeholder={question.placeholder || ''}
								rows={3}
								bind:value={formData[question.id]}
								onblur={saveToLocalStorage}
							></textarea>
						{:else if question.type === 'number'}
							<input
								id={question.id}
								type="number"
								class="input input-bordered"
								placeholder={question.placeholder || ''}
								bind:value={formData[question.id]}
								onblur={saveToLocalStorage}
							/>
						{:else}
							<input
								id={question.id}
								type="text"
								class="input input-bordered"
								placeholder={question.placeholder || ''}
								bind:value={formData[question.id]}
								onblur={saveToLocalStorage}
							/>
						{/if}
					</div>
				{/each}
			{/if}

			<!-- Navigation -->
			<div class="card-actions flex w-full items-end justify-center gap-4 md:justify-end">
				<button class="btn btn-ghost" onclick={goBack} disabled={currentStep === 1}> Back </button>
				<button class="btn btn-primary" onclick={goNext}>
					{currentStep === steps.length ? 'Complete' : 'Next'}
				</button>
			</div>
		</div>
	</div>
</div>

<!-- Debug Autofill Button -->
<!-- <button
	type="button"
	onclick={autofill}
	class="fixed right-4 bottom-4 rounded-full bg-gray-800 px-4 py-2 text-sm text-white shadow-lg hover:bg-gray-700"
>
	Autofill (Debug)
</button> -->
