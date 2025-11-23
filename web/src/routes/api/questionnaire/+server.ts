import Anthropic from '@anthropic-ai/sdk';
import type { RequestHandler } from './$types';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import { json } from '@sveltejs/kit';

const anthropic = new Anthropic({
	apiKey: ANTHROPIC_API_KEY
});

export const POST: RequestHandler = async ({ request }) => {
	try {
		console.log('Questionnaire endpoint called');
		const profile: Record<string, string> = await request.json();
		console.log('Received profile:', profile);

		// Create profile text for Claude (filter out empty values)
		const profileText = Object.entries(profile)
			.filter(([_, value]) => value && String(value).trim() !== '')
			.map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
			.join('\n');
		console.log('Profile text:', profileText);

		console.log('Starting Anthropic API calls...');
		// Generate both in parallel
		const [msg, sliceOfLifeMsg] = await Promise.all([
		anthropic.messages.create({
			model: 'claude-sonnet-4-5',
			max_tokens: 1500,
			messages: [
				{
					role: 'user',
					content: `You are helping generate a life summary and highlights for a person looking back from the year 2055 (30 years in the future from 2025). Here is their profile:

${profileText}

Based on this profile, first write a 2-sentence summary of the next 30 years (2025-2055), then generate exactly 5 meaningful life highlights that this person experienced. You are writing AS this person in 2055, looking back on the past 30 years. Be very specific and relate them to their goals, background, aspirations, and the people/places mentioned above.

Format exactly like this:

[2 SHORT sentences summarizing the journey of the next 30 years. Keep each sentence brief and simple. Make it personal, warm, and reflective. Write in first person past tense. Don't try to fit everything in - just capture the essence.]

1. [Specific Title] (Year or Age Range)
I [first-person past tense description in 1-2 sentences describing the moment and its significance].

2. [Specific Title] (Year or Age Range)
I [first-person past tense description in 1-2 sentences describing the moment and its significance].

Continue for all 5 highlights.

Requirements:
- The summary should capture the essence of the next 30 years journey
- Mix professional achievements, personal milestones, and hobby/passion moments across the 30-year period
- Use specific names of people mentioned in their profile
- Reference specific places they mentioned
- Make it feel personal and believable, not generic
- Each highlight should feel like a real, meaningful moment in their life
- Distribute highlights across 2025-2055 with realistic year ranges or ages
- Write in first person past tense ("I achieved...", "I met...", "I created...")
- Make the highlights feel like reflections from someone in 2055 looking back

Return the summary followed by the 5 formatted highlights, nothing else.`
				}
			]
		}),
		anthropic.messages.create({
			model: 'claude-sonnet-4-5',
			max_tokens: 1000,
			messages: [
				{
					role: 'user',
					content: `You are writing 3 fun slice-of-life moments for this person in 2055, looking back on small, quirky, personal moments from the past 30 years. Here is their profile:

${profileText}

Generate exactly 3 fun, personal, slice-of-life moments that capture their personality, hobbies, and quirks. These should be warm, specific, and relatable moments - NOT major achievements.

Format each moment like this:

1. [Catchy Title]
"[First-person narrative in their voice, 1-2 sentences. Make it conversational, include specific details, show their personality.]"

2. [Catchy Title]
"[First-person narrative in their voice, 1-2 sentences.]"

Continue for all 3 moments.

Requirements:
- Write in a conversational, warm first-person voice
- Include specific details from their hobbies, interests, and daily life
- Show their personality and quirks
- Make moments feel real and relatable, not dramatic
- Reference people and places from their profile naturally
- Add humor or self-reflection where appropriate
- These are small moments that stick in memory, not achievements

Return only the 5 formatted moments with the header "Fun Slice-of-Life Moments", nothing else.`
				}
			]
		})
	]);
	console.log('Anthropic API calls completed');

	const highlightsText =
		msg.content[0].type === 'text' ? msg.content[0].text : 'Unable to generate highlights';

	const sliceOfLifeText =
		sliceOfLifeMsg.content[0].type === 'text'
			? sliceOfLifeMsg.content[0].text
			: 'Unable to generate slice-of-life moments';

	console.log('Generated summary and highlights:', highlightsText);
	console.log('Generated slice-of-life:', sliceOfLifeText);

	// Combine highlights (with summary) and slice of life for memory
	const memory = `${highlightsText}\n\n${sliceOfLifeText}`;
	console.log('Returning success response');

	return json({ success: true, memory });
	} catch (error) {
		console.error('Questionnaire endpoint error:', error);
		console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
		console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
		return json({ 
			success: false, 
			error: error instanceof Error ? error.message : 'Unknown error occurred' 
		}, { status: 500 });
	}
};
