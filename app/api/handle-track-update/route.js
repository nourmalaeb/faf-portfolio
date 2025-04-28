// /Users/nourmalaeb/Dev/personal/friends/faf-portfolio/app/api/handle-track-update/route.js
import { createClient } from '@sanity/client';
// Import parseWebStream for handling URL fetching
import { parseWebStream } from 'music-metadata';
import { NextResponse } from 'next/server';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook';

// --- Configuration ---
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN; // Needs write access
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

// --- Environment Variable Validation ---
if (!SANITY_WEBHOOK_SECRET) {
  console.error('FATAL: Missing SANITY_WEBHOOK_SECRET environment variable.');
  throw new Error('Missing SANITY_WEBHOOK_SECRET environment variable.');
}
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
  console.warn(
    'WARN: Missing one or more of SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN environment variables.'
  );
}

// --- Sanity Client Initialization ---
const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-04-06',
  useCdn: false,
});

// --- Helper Functions ---

// Updated function to get audio duration using fetch and parseWebStream
async function getAudioDuration(audioUrl) {
  if (!audioUrl) {
    console.warn('getAudioDuration called with no URL.');
    return null;
  }
  try {
    // 1. Fetch the audio file URL
    const response = await fetch(audioUrl);

    // 2. Check if the fetch was successful
    if (!response.ok) {
      console.error(
        `Error fetching audio URL ${audioUrl}: Status ${response.status}`
      );
      return null;
    }

    // 3. Ensure the response body exists
    if (!response.body) {
      console.error(`No response body found for URL ${audioUrl}`);
      return null;
    }

    // 4. Parse the metadata from the web stream (response.body)
    // We might need to pass the Content-Type header as a hint if available
    const contentType = response.headers.get('content-type') || undefined;
    const contentLengthHeader = response.headers.get('content-length');
    const size = contentLengthHeader
      ? parseInt(contentLengthHeader, 10)
      : undefined;

    const metadata = await parseWebStream(response.body, {
      mimeType: contentType,
      size,
    });

    // 5. Return the rounded duration
    return metadata?.format?.duration
      ? Math.round(metadata.format.duration)
      : null;
  } catch (error) {
    // Catch errors from fetch() or parseWebStream()
    console.error(`Error processing metadata for ${audioUrl}:`, error.message);
    // Log the full error in development for more details
    if (process.env.NODE_ENV === 'development') {
      console.error(error);
    }
    return null;
  }
}

// --- Main Handler (POST for App Router) ---
// No need for `export const config = { api: { bodyParser: false } };` in App Router

export async function POST(req) {
  let requestBodyString;
  try {
    // 1. Read the raw request body using req.text() for signature verification
    requestBodyString = await req.text();
    console.log(
      'Raw Request Body String received (length):',
      requestBodyString.length
    );
  } catch (error) {
    console.error('Error reading request body with req.text():', error);
    return NextResponse.json(
      { message: 'Internal Server Error: Could not read request body' },
      { status: 500 }
    );
  }

  // 2. Get the signature header
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) {
    console.error('Unauthorized: Missing signature header.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // 3. Verify Signature using the library
  let isValid = false;
  try {
    // Ensure the secret is valid before calling
    if (!SANITY_WEBHOOK_SECRET) {
      throw new Error('SANITY_WEBHOOK_SECRET is missing internally.');
    }
    isValid = await isValidSignature(
      requestBodyString,
      signature,
      SANITY_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Error during signature verification:', error);
    isValid = false;
  }

  if (!isValid) {
    console.warn('Unauthorized: Invalid webhook signature received.');
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  console.log('Webhook signature verified successfully.');

  // 4. Parse the body *after* verification
  let body; // This 'body' will contain the full document content
  try {
    if (!requestBodyString) {
      throw new Error('Request body string is empty after verification.');
    }
    body = JSON.parse(requestBodyString);
  } catch (error) {
    console.error('Error parsing request body JSON:', error);
    return NextResponse.json(
      { message: 'Bad Request: Invalid JSON format' },
      { status: 400 }
    );
  }

  // 5. Extract Document ID directly from the document content
  const projectIdWithPotentialDraft = body?._id;
  const documentType = body?._type;

  console.log('Extracted Document ID:', projectIdWithPotentialDraft);
  console.log('Extracted Document Type:', documentType);

  // Check if the ID is present and if the document type is 'project'
  if (!projectIdWithPotentialDraft || documentType !== 'project') {
    console.log(
      `Ignoring webhook: Document type (${documentType}) is not 'project' or ID (${projectIdWithPotentialDraft}) is missing/invalid.`
    );
    return NextResponse.json(
      { message: 'Ignoring non-project document or invalid ID' },
      { status: 200 }
    );
  }

  // Prepare ID for fetching (remove 'drafts.' prefix)
  const projectIdForFetch = projectIdWithPotentialDraft.replace(
    /^drafts\./,
    ''
  );
  console.log(
    `Processing update for project: ${projectIdForFetch} (Source ID: ${projectIdWithPotentialDraft})`
  );

  try {
    // 6. Use the document data received in the webhook body
    const projectData = body;

    // Validate if tracks exist
    if (!projectData.tracks || projectData.tracks.length === 0) {
      console.log(
        `No tracks found in received project data for ${projectIdForFetch}.`
      );
      return NextResponse.json(
        { message: 'No tracks found in project data.' },
        { status: 200 }
      );
    }

    // 7. Process Each Track
    let updatesMade = 0;
    const patch = sanityClient.patch(projectIdWithPotentialDraft);

    // Fetch asset URLs
    const assetIds = projectData.tracks
      .map(track => track?.asset?.asset?._ref) // Path based on audioTrack.js schema
      .filter(Boolean);

    if (assetIds.length === 0) {
      console.log(
        `No valid audio asset references in tracks for project ${projectIdForFetch}.`
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

    // Process tracks to get durations and queue patches
    const trackUpdatePromises = projectData.tracks.map(async track => {
      const trackKey = track._key;
      const assetRef = track?.asset?.asset?._ref;
      const currentDuration = track.duration;

      if (!trackKey || !assetRef) {
        console.warn(
          `Skipping track (missing _key or asset._ref) in project ${projectIdForFetch}: Key=${trackKey}, Ref=${assetRef}`
        );
        return;
      }

      const audioUrl = assetUrlMap.get(assetRef);
      if (!audioUrl) {
        console.warn(
          `Could not find URL for asset ${assetRef} (track ${trackKey}, project ${projectIdForFetch}).`
        );
        return;
      }

      // Use the updated getAudioDuration function
      const newDuration = await getAudioDuration(audioUrl);
      if (newDuration == null) {
        console.warn(
          `Could not extract duration for ${audioUrl} (track ${trackKey}, project ${projectIdForFetch}).`
        );
        return;
      }

      if (currentDuration !== newDuration) {
        console.log(
          `Queueing duration update for track ${trackKey} in ${projectIdWithPotentialDraft}: ${currentDuration} -> ${newDuration}`
        );
        patch.set({ [`tracks[_key=="${trackKey}"].duration`]: newDuration });
        updatesMade++;
      } else {
        console.log(
          `Duration for track ${trackKey} in ${projectIdForFetch} is already up-to-date (${newDuration}).`
        );
      }
    });

    await Promise.all(trackUpdatePromises);

    // 8. Commit the Patch Transaction if changes were queued
    if (updatesMade > 0) {
      await patch.commit({
        // Optional: Add conditions like ifRevisionID if needed
        // ifRevisionID: projectData._rev
      });
      console.log(
        `Successfully committed patches for ${updatesMade} track(s) in project ${projectIdWithPotentialDraft}.`
      );
      return NextResponse.json(
        {
          message: `Duration updated successfully for ${updatesMade} track(s).`,
        },
        { status: 200 }
      );
    } else {
      console.log(
        `No duration updates needed for project ${projectIdForFetch}.`
      );
      return NextResponse.json(
        { message: 'All track durations were already up-to-date.' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(
      `Error processing project ${projectIdWithPotentialDraft}:`,
      error
    );
    if (error.response && error.response.body) {
      console.error(
        'Sanity client error details:',
        JSON.stringify(error.response.body, null, 2)
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error processing webhook' },
      { status: 500 }
    );
  }
}
