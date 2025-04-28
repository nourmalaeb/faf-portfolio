// /Users/nourmalaeb/Dev/personal/friends/faf-portfolio/app/api/handle-track-update/route.js
import { createClient } from '@sanity/client';
import * as musicMetadata from 'music-metadata';
import crypto from 'crypto';
import { NextResponse } from 'next/server'; // Use NextResponse for convenience

// --- Configuration ---
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN; // Needs write access
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

// Basic validation for environment variables
if (
  !SANITY_PROJECT_ID ||
  !SANITY_DATASET ||
  !SANITY_API_TOKEN ||
  !SANITY_WEBHOOK_SECRET
) {
  console.error('Missing required Sanity environment variables');
  // In a real app, you might throw an error during build or startup
  // For a serverless function, returning an error response is appropriate
  // Note: This check runs at deployment/startup time, not per-request
}

const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-04-06',
  useCdn: false, // Essential for write operations
});

// --- Helper Functions ---

// Function to verify the webhook signature (Important for security!)
async function verifyWebhookSignature(req) {
  const signature = req.headers.get('sanity-signature');
  if (!signature) {
    console.error('Missing sanity-signature header');
    return { isValid: false, body: null };
  }

  try {
    const requestBodyArrayBuffer = await req.arrayBuffer();
    const requestBodyBuffer = Buffer.from(requestBodyArrayBuffer);

    const computedSignature = crypto
      .createHmac('sha256', SANITY_WEBHOOK_SECRET)
      .update(requestBodyBuffer)
      .digest('hex');

    if (signature !== computedSignature) {
      console.error('Invalid webhook signature');
      return { isValid: false, body: null };
    }

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
    const metadata = await musicMetadata.fetchFromUrl(audioUrl);
    // Round duration to avoid potential floating point comparison issues
    return metadata?.format?.duration
      ? Math.round(metadata.format.duration)
      : null;
  } catch (error) {
    console.error(`Error fetching metadata for ${audioUrl}:`, error.message);
    return null;
  }
}

// --- Main Handler (POST for App Router) ---
export async function POST(req) {
  // 1. Verify Signature
  const { isValid, body } = await verifyWebhookSignature(req);
  if (!isValid) {
    console.log('Webhook signature verification failed');
    return NextResponse.json(
      { message: 'Unauthorized: Invalid signature' },
      { status: 401 }
    );
  }

  // 2. Process Payload - Expecting a Project Document ID
  const projectId = body?.ids?.updated?.[0] || body?.ids?.created?.[0]; // Get the ID of the updated/created document

  // Check if it's a project document (adjust if your project IDs have a different prefix or none)
  if (!projectId || !projectId.startsWith('project.')) {
    console.log(
      'Webhook received for non-project document or missing ID:',
      projectId
    );
    return NextResponse.json(
      { message: 'Ignoring non-project document or missing ID' },
      { status: 200 } // Acknowledge receipt but take no action
    );
  }

  console.log(`Processing update for project: ${projectId}`);

  try {
    // 3. Fetch the Project Document from Sanity
    // Select only the fields needed: _id and the tracks array with asset refs and current duration
    const projectData = await sanityClient.fetch(
      `*[_id == $projectId][0]{
        _id,
        "tracks": tracks[]{ _key, asset, duration }
      }`,
      { projectId }
    );

    if (!projectData) {
      console.log(`Project document ${projectId} not found.`);
      return NextResponse.json(
        { message: 'Project document not found' },
        { status: 404 }
      );
    }

    if (!projectData.tracks || projectData.tracks.length === 0) {
      console.log(`No tracks found in project ${projectId}.`);
      return NextResponse.json(
        { message: 'No tracks found in project, skipping.' },
        { status: 200 }
      );
    }

    // 4. Process Each Track in the Project
    let updatesMade = 0;
    const patch = sanityClient.patch(projectId); // Start a patch transaction for the project

    // Fetch all referenced audio assets in one go for efficiency
    const assetIds = projectData.tracks
      .map(track => track?.asset?._ref)
      .filter(Boolean); // Get valid asset refs

    if (assetIds.length === 0) {
      console.log(
        `No valid audio asset references found in tracks for project ${projectId}.`
      );
      return NextResponse.json(
        { message: 'No audio assets to process.' },
        { status: 200 }
      );
    }

    const assets = await sanityClient.fetch(`*[_id in $assetIds]{ _id, url }`, {
      assetIds,
    });
    const assetUrlMap = new Map(assets.map(asset => [asset._id, asset.url]));

    for (const track of projectData.tracks) {
      const trackKey = track._key; // Unique key for this item in the array
      const assetRef = track?.asset?._ref;
      const currentDuration = track.duration; // Existing duration in Sanity

      if (!trackKey || !assetRef) {
        console.log(
          `Skipping track (missing key or asset ref) in project ${projectId}:`,
          track
        );
        continue; // Skip if essential data is missing
      }

      const audioUrl = assetUrlMap.get(assetRef);

      if (!audioUrl) {
        console.log(
          `Could not retrieve audio URL for asset ${assetRef} in track ${trackKey} of project ${projectId}`
        );
        continue; // Skip this track if URL is missing
      }

      // 5. Get the duration
      const newDuration = await getAudioDuration(audioUrl);

      if (newDuration == null) {
        // Checks for null or undefined
        console.log(
          `Could not extract duration for ${audioUrl} (track ${trackKey}, project ${projectId})`
        );
        continue; // Skip if duration couldn't be extracted
      }

      // 6. Add to Patch if Duration Changed
      // Compare rounded new duration with existing duration
      if (currentDuration !== newDuration) {
        console.log(
          `Updating duration for track ${trackKey} in project ${projectId} from ${currentDuration} to ${newDuration}`
        );
        // Use the path syntax to target the duration field of the specific track object
        patch.set({ [`tracks[_key=="${trackKey}"].duration`]: newDuration });
        updatesMade++;
      } else {
        console.log(
          `Duration for track ${trackKey} in project ${projectId} is already up-to-date (${newDuration}).`
        );
      }
    } // End of track loop

    // 7. Commit the Patch if changes were made
    if (updatesMade > 0) {
      await patch.commit();
      console.log(
        `Successfully patched ${updatesMade} track(s) in project ${projectId}.`
      );
      return NextResponse.json(
        {
          message: `Duration updated successfully for ${updatesMade} track(s).`,
        },
        { status: 200 }
      );
    } else {
      console.log(`No duration updates needed for project ${projectId}.`);
      return NextResponse.json(
        { message: 'All track durations already up-to-date.' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(`Error processing webhook for project ${projectId}:`, error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
