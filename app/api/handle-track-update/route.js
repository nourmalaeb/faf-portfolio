// api/handle-track-update.js
import { createClient } from '@sanity/client';
import * as musicMetadata from 'music-metadata';
import crypto from 'crypto';

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
  // req is a standard Request object
  const signature = req.headers.get('sanity-signature'); // Use .get() for Headers object
  if (!signature) {
    console.error('Missing sanity-signature header');
    return { isValid: false, body: null }; // Return an object for clarity
  }

  try {
    // Read the raw body as ArrayBuffer
    const requestBodyArrayBuffer = await req.arrayBuffer();
    // Convert ArrayBuffer to Node.js Buffer for crypto
    const requestBodyBuffer = Buffer.from(requestBodyArrayBuffer);

    const computedSignature = crypto
      .createHmac('sha256', SANITY_WEBHOOK_SECRET)
      .update(requestBodyBuffer) // Use the Node.js Buffer
      .digest('hex');

    if (signature !== computedSignature) {
      console.error('Invalid webhook signature');
      return { isValid: false, body: null };
    }

    // If signature is valid, parse the body (as JSON) from the buffer
    const parsedBody = JSON.parse(requestBodyBuffer.toString());
    return { isValid: true, body: parsedBody };
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return { isValid: false, body: null };
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
// Use POST function for App Router convention
export async function POST(req) {
  // 1. Signature Verification (Method check is implicit with POST export)
  const { isValid, body } = await verifyWebhookSignature(req);
  if (!isValid) {
    console.log('Webhook signature verification failed');
    // Use NextResponse for App Router responses
    return new Response(
      JSON.stringify({ message: 'Unauthorized: Invalid signature' }),
      { status: 401 }
    );
  }

  // 2. Process the webhook payload
  const documentId = body?._id;

  // Use NextResponse for responses
  if (!documentId || !documentId.startsWith('audioTrack.')) {
    // Check your schema type name
    console.log(
      'Webhook received for non-track document or missing ID:',
      documentId
    );
    return new Response(
      JSON.stringify({ message: 'Ignoring non-track document or missing ID' }),
      { status: 200 }
    );
  }

  console.log(`Processing update for document: ${documentId}`);

  try {
    // 3. Fetch the latest document data from Sanity
    const currentTrackData = await sanityClient.getDocument(documentId);

    if (!currentTrackData) {
      console.log(`Document ${documentId} not found.`);
      return new Response(JSON.stringify({ message: 'Document not found' }), {
        status: 404,
      });
    }

    const audioAssetId = currentTrackData?.audioFile?.asset?._ref;
    if (!audioAssetId) {
      console.log(`No audio file asset reference found for ${documentId}`);
      return new Response(
        JSON.stringify({ message: 'No audio file asset found, skipping.' }),
        { status: 200 }
      );
    }

    // 4. Fetch the asset document to get the URL
    const audioAsset = await sanityClient.getDocument(audioAssetId);
    const audioUrl = audioAsset?.url;

    if (!audioUrl) {
      console.log(`Could not retrieve audio URL for asset ${audioAssetId}`);
      return new Response(
        JSON.stringify({ message: 'Audio asset URL not found' }),
        { status: 404 }
      );
    }

    // 5. Get the duration
    const duration = await getAudioDuration(audioUrl);

    if (duration === null || duration === undefined) {
      console.log(`Could not extract duration for ${audioUrl}`);
      return new Response(
        JSON.stringify({
          message: 'Could not extract duration, skipping patch.',
        }),
        { status: 200 }
      );
    }

    console.log(`Extracted duration for ${documentId}: ${duration} seconds`);

    // 6. Patch the Sanity document
    if (currentTrackData.duration !== duration) {
      await sanityClient.patch(documentId).set({ duration: duration }).commit();
      console.log(
        `Successfully patched ${documentId} with duration: ${duration}`
      );
      return new Response(
        JSON.stringify({ message: 'Duration updated successfully', duration }),
        { status: 200 }
      );
    } else {
      console.log(
        `Duration for ${documentId} is already up-to-date (${duration}). No patch needed.`
      );
      return new Response(
        JSON.stringify({ message: 'Duration already up-to-date.' }),
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`Error processing webhook for ${documentId}:`, error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), {
      status: 500,
    });
  }
}
