import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ELEVENLABS_API_KEY } from '$env/static/private';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { voiceId, systemPrompt, questionnaireData, prolificPid } = await request.json();

		if (!voiceId || !systemPrompt || !questionnaireData) {
			return json(
				{ error: 'Voice ID, system prompt, and questionnaire data are required' },
				{ status: 400 }
			);
		}

		const client = new ElevenLabsClient({
			apiKey: ELEVENLABS_API_KEY
		});

		// Format questionnaire data
		const questionnaireText = Object.entries(questionnaireData)
			.filter(([_, value]) => value && String(value).trim() !== '')
			.map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
			.join('\n');

		const agentSystemPrompt = `You are speaking as the user's future self from 30 years in the future (2055), looking back on your life. Keep responses conversational, warm, and personal - speak in first person past tense as if sharing memories with your younger self. Draw from the life highlights and slice-of-life moments in your memory to make the conversation feel authentic and reflective.

${questionnaireText}

${systemPrompt}

IMPORTANT: Respond in EXACT 1-2 SHORT, **brief**, and **simple** sentences maximum. Don't explain everything - just share one small thought or memory at a time, as if you chatting with a friend. Let the conversation breathe.

Good example: "I remember that hackathon in 2023 so clearly. That's actually where everything changed for me."

Bad example: [long paragraph explaining everything]`;

		const result = await client.conversationalAi.agents.create({
			name: prolificPid ? `iui26_${prolificPid}` : 'Future You Agent',
			conversationConfig: {
				agent: {
					prompt: {
						prompt: agentSystemPrompt,
						llm: 'claude-sonnet-4@20250514',
						temperature: 1
					},
					firstMessage: `Hi there! I'm you from the future. I'm here to share what I've learned from the path you're on right now. Feel free to ask about anything!`
				},
				tts: {
					voiceId: voiceId
				},
				turn: {
					turnTimeout: 20
				}
			}
		});

		console.log('Agent created:', result);

		return json({
			success: true,
			agentId: result.agentId || result.agent_id
		});
	} catch (error) {
		console.error('Agent creation error:', error);
		return json(
			{
				error: error instanceof Error ? error.message : 'Failed to create agent'
			},
			{ status: 500 }
		);
	}
};
