import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ELEVENLABS_API_KEY } from '$env/static/private';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { language } from '@elevenlabs/elevenlabs-js/api/resources/dubbing/resources/resource';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const audioFile = formData.get('audio') as File;
		const name = (formData.get('name') as string) || 'JOHN';
		const description = (formData.get('description') as string) || 'Voice clone from recording';

		if (!audioFile) {
			return json({ error: 'No audio file provided' }, { status: 400 });
		}

		// Initialize ElevenLabs client
		const client = new ElevenLabsClient({
			apiKey: ELEVENLABS_API_KEY
		});

		// Convert File to the format expected by the SDK
		const audioBuffer = await audioFile.arrayBuffer();
		const audioBlob = new Blob([audioBuffer], { type: audioFile.type });

		// Create voice clone using official SDK
		const result = await client.voices.ivc.create({
			name: name,
			files: [audioBlob],
			description: description,
			remove_background_noise: false,
			labels: JSON.stringify({ language: 'en' })
		});

		console.log('Voice clone created:', result);

		return json({
			success: true,
			voiceId: result.voiceId || result.voice_id,
			requiresVerification: result.requiresVerification || result.requires_verification
		});
	} catch (error) {
		console.error('Voice clone error:', error);
		return json(
			{
				error: error instanceof Error ? error.message : 'Failed to create voice clone'
			},
			{ status: 500 }
		);
	}
};
