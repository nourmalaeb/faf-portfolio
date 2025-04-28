// api/handle-track-update.js
import { createClient } from '@sanity/client';
import * as musicMetadata from 'music-metadata';
import crypto from 'crypto';
import { buffer } from 'micro'; // micro is used by Vercel under the hood

// --- Configuration ---
// Get these from environment variables
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN; // Needs write access
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

if (
  !SANITY_PROJECT_ID ||
  !SANITY_DATASET ||
  !SANITY_API_TOKEN ||
  !SANITY_WEBHOOK_SECRET
) {
  console.error('Missing required Sanity environment variables');
  // Optionally throw an error or return a specific status in a real app
}

const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_TOKEN,
  useCdn: false, // Use false for write operations
});

// --- Helper Functions ---

// Function to verify the webhook signature (Important for security!)
async function verifyWebhookSignature(req) {
  const signature = req.headers['sanity-signature'];
  if (!signature) {
    console.error('Missing sanity-signature header');
    return false;
  }

  try {
    // Read the raw body buffer - crucial for signature verification
    const requestBody = await buffer(req);
    const computedSignature = crypto
      .createHmac('sha256', SANITY_WEBHOOK_SECRET)
      .update(requestBody) // Use the raw buffer
      .digest('hex');

    if (signature !== computedSignature) {
      console.error('Invalid webhook signature');
      return false;
    }
    // If signature is valid, return the parsed body (as JSON)
    return JSON.parse(requestBody.toString());
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Function to get audio duration
async function getAudioDuration(audioUrl) {
  if (!audioUrl) return null;
  try {
    // music-metadata can fetch metadata directly from a URL
    const metadata = await musicMetadata.fetchFromUrl(audioUrl);
    return metadata?.format?.duration ?? null; // duration is in seconds
  } catch (error) {
    console.error(`Error fetching metadata for ${audioUrl}:`, error.message);
    // Handle specific errors if needed (e.g., 404 Not Found)
    return null;
  }
}

// --- Main Handler ---
export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    console.log('Received non-POST request');
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // 2. Verify Signature and get body
  const body = await verifyWebhookSignature(req);
  if (!body) {
    console.log('Webhook signature verification failed');
    return res.status(401).json({ message: 'Unauthorized: Invalid signature' });
  }

  // 3. Process the webhook payload
  // The structure depends slightly on your webhook config, but usually contains document IDs
  const documentId = body?._id; // Get the ID of the changed document

  if (!documentId || !documentId.startsWith('audioTrack.')) {
    // Check if it's a track document
    console.log(
      'Webhook received for non-track document or missing ID:',
      documentId
    );
    return res
      .status(200)
      .json({ message: 'Ignoring non-track document or missing ID' });
  }

  console.log(`Processing update for document: ${documentId}`);

  try {
    // 4. Fetch the latest document data from Sanity (including the audio file URL)
    // Ensure your schema name is 'track' and the file field is 'audioFile'
    const currentTrackData = await sanityClient.getDocument(documentId);

    if (!currentTrackData) {
      console.log(`Document ${documentId} not found.`);
      return res.status(404).json({ message: 'Document not found' });
    }

    const audioAssetId = currentTrackData?.audioFile?.asset?._ref;
    if (!audioAssetId) {
      console.log(`No audio file asset reference found for ${documentId}`);
      return res
        .status(200)
        .json({ message: 'No audio file asset found, skipping.' });
    }

    // 5. Fetch the asset document to get the URL
    const audioAsset = await sanityClient.getDocument(audioAssetId);
    const audioUrl = audioAsset?.url;

    if (!audioUrl) {
      console.log(`Could not retrieve audio URL for asset ${audioAssetId}`);
      return res.status(404).json({ message: 'Audio asset URL not found' });
    }

    // 6. Get the duration
    const duration = await getAudioDuration(audioUrl);

    if (duration === null || duration === undefined) {
      console.log(`Could not extract duration for ${audioUrl}`);
      // Decide if you want to patch with null/0 or just skip
      return res
        .status(200)
        .json({ message: 'Could not extract duration, skipping patch.' });
    }

    console.log(`Extracted duration for ${documentId}: ${duration} seconds`);

    // 7. Patch the Sanity document with the duration
    // Only patch if the duration is different from the current value to avoid loops
    if (currentTrackData.duration !== duration) {
      await sanityClient
        .patch(documentId)
        .set({ duration: duration }) // Set the 'duration' field
        .commit();
      console.log(
        `Successfully patched ${documentId} with duration: ${duration}`
      );
      return res
        .status(200)
        .json({ message: 'Duration updated successfully', duration });
    } else {
      console.log(
        `Duration for ${documentId} is already up-to-date (${duration}). No patch needed.`
      );
      return res.status(200).json({ message: 'Duration already up-to-date.' });
    }
  } catch (error) {
    console.error(`Error processing webhook for ${documentId}:`, error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
