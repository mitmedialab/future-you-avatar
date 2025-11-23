import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Replicate from 'replicate';
import { REPLICATE_API_TOKEN } from '$env/static/private';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const imageFile = formData.get('image') as File;

		if (!imageFile) {
			return json({ error: 'No image provided' }, { status: 400 });
		}

		// Initialize Replicate with token
		const replicate = new Replicate({
			auth: REPLICATE_API_TOKEN
		});

		// Upload user's photo to Replicate
		const uploadedFile = await replicate.files.create(imageFile);
		const uploadedImageUrl = uploadedFile.urls.get;

		console.log('Uploaded file URL:', uploadedImageUrl);

		// Run nanobanana to age the photo
		const agedOutput = await replicate.run('google/nano-banana', {
			input: {
				image_input: [uploadedImageUrl],
				prompt:
					'Change the person in the given image to a 50-year-old with wrinkles and grey hair that suit the age. Set the background to a dark, cozy room and dress the subject in comfortable, cozy clothing for a close-up front-facing portrait. Have the subject smile gently and adopt a relaxed posture.',
				aspect_ratio: '3:4',
				output_format: 'jpg'
			}
		});

		console.log('Nanobanana output:', agedOutput);

		// Handle different output formats for aged image
		let agedImageUrl: string;
		if (typeof agedOutput === 'string') {
			agedImageUrl = agedOutput;
		} else if (agedOutput && typeof agedOutput === 'object' && 'url' in agedOutput) {
			agedImageUrl = (agedOutput as any).url();
		} else if (Array.isArray(agedOutput) && agedOutput.length > 0) {
			agedImageUrl = agedOutput[0];
		} else {
			console.error('Unexpected aged output format:', agedOutput);
			throw new Error('Unexpected output format from nanobanana');
		}

		console.log('Aged image URL:', agedImageUrl);

		// Use pre-uploaded driving videos
		const listeningVideoUrl = 'https://iui26-bucket.futureyou.live/listening_final.mp4';
		const speakingVideoUrl = 'https://iui26-bucket.futureyou.live/speaking_final.mp4';

		console.log('Listening video URL:', listeningVideoUrl);
		console.log('Speaking video URL:', speakingVideoUrl);

		// Run LivePortrait for both videos in parallel
		const [listeningPortraitOutput, speakingPortraitOutput] = await Promise.all([
			replicate.run(
				'okaris/live-portrait:8be2edeab144ba0865f9fa84168f621ee417a2003db947802f900519f7c43300',
				{
					input: {
						vy_ratio: -0.01,
						source_image: agedImageUrl,
						driving_video: listeningVideoUrl,
						driving_smooth_observation_variance: 0.01
					}
				}
			),
			replicate.run(
				'okaris/live-portrait:8be2edeab144ba0865f9fa84168f621ee417a2003db947802f900519f7c43300',
				{
					input: {
						vy_ratio: -0.01,
						source_image: agedImageUrl,
						driving_video: speakingVideoUrl,
						driving_smooth_observation_variance: 0.01
					}
				}
			)
		]);

		console.log('LivePortrait listening output:', listeningPortraitOutput);
		console.log('LivePortrait speaking output:', speakingPortraitOutput);

		// Extract video URLs - handle both array and object formats
		let listeningVideoOutputUrl: string;
		let speakingVideoOutputUrl: string;

		// Listening output - check if array or object
		if (Array.isArray(listeningPortraitOutput)) {
			listeningVideoOutputUrl = (listeningPortraitOutput as any)[0].url();
		} else if ((listeningPortraitOutput as any).video) {
			listeningVideoOutputUrl = (listeningPortraitOutput as any).video.url();
		} else {
			throw new Error('Unexpected listening output format');
		}

		// Speaking output - check if array or object
		if (Array.isArray(speakingPortraitOutput)) {
			speakingVideoOutputUrl = (speakingPortraitOutput as any)[0].url();
		} else if ((speakingPortraitOutput as any).video) {
			speakingVideoOutputUrl = (speakingPortraitOutput as any).video.url();
		} else {
			throw new Error('Unexpected speaking output format');
		}

		console.log('Final listening video URL:', listeningVideoOutputUrl);
		console.log('Final speaking video URL:', speakingVideoOutputUrl);

		return json({
			agedPhoto: agedImageUrl,
			listeningVideo: listeningVideoOutputUrl,
			speakingVideo: speakingVideoOutputUrl
		});
	} catch (error) {
		console.error('Replicate error:', error);
		return json(
			{
				error: error instanceof Error ? error.message : 'Failed to process image'
			},
			{ status: 500 }
		);
	}
};
