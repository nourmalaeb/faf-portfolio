// /Users/nourmalaeb/Dev/personal/friends/faf-portfolio/app/api/handle-track-update/route.js
import { createClient } from '@sanity/client';
import * as musicMetadata from 'music-metadata';
// import crypto from 'crypto'; // Keep crypto if needed elsewhere, but not for signature verification now
import { NextResponse } from 'next/server';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@sanity/webhook'; // Import from the library

// --- Configuration ---
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN; // Needs write access
const SANITY_WEBHOOK_SECRET = process.env.SANITY_WEBHOOK_SECRET;

// Ensure the secret is loaded once
if (!SANITY_WEBHOOK_SECRET) {
  console.error('Missing SANITY_WEBHOOK_SECRET environment variable');
  // Throwing an error might be better here to prevent the function from running incorrectly
  throw new Error('Missing SANITY_WEBHOOK_SECRET environment variable');
}
// Other env var checks (optional, depends on how critical they are at startup)
if (!SANITY_PROJECT_ID || !SANITY_DATASET || !SANITY_API_TOKEN) {
  console.warn('Missing other Sanity environment variables');
}

const sanityClient = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  token: SANITY_API_TOKEN,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-04-06',
  useCdn: false, // Essential for write operations
});

// --- Helper Functions ---

// Function to read the raw request body (needed for signature verification)
// Adapted from @sanity/webhook README example
async function readRawBody(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  // Returns the raw buffer, which isValidSignature can sometimes handle directly,
  // but converting to utf8 string is generally safer and what the examples show.
  return Buffer.concat(chunks).toString('utf8');
}

// Function to get audio duration (remains the same)
async function getAudioDuration(audioUrl) {
  if (!audioUrl) return null;
  try {
    const metadata = await musicMetadata.fetchFromUrl(audioUrl);
    return metadata?.format?.duration
      ? Math.round(metadata.format.duration)
      : null;
  } catch (error) {
    console.error(`Error fetching metadata for ${audioUrl}:`, error.message);
    return null;
  }
}

// --- Main Handler (POST for App Router) ---

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  // 1. Read the raw body
  const requestBodyString = await readRawBody(req.body); // Use req.body directly with bodyParser: false

  // 2. Get the signature header
  const signature = req.headers.get(SIGNATURE_HEADER_NAME);
  if (!signature) {
    console.error('Missing signature header');
    return NextResponse.json(
      { message: 'Unauthorized: Missing signature' },
      { status: 401 }
    );
  }

  // 3. Verify Signature using the library
  let isValid = false;
  try {
    isValid = await isValidSignature(
      requestBodyString, // The raw body string
      signature, // The signature header
      SANITY_WEBHOOK_SECRET // Your secret
    );
  } catch (error) {
    console.error('Error verifying signature:', error);
    // Treat errors during verification as invalid signature
    isValid = false;
  }

  if (!isValid) {
    console.warn('Invalid webhook signature received.'); // Use warn level for failed attempts
    return NextResponse.json(
      { message: 'Unauthorized: Invalid signature' },
      { status: 401 }
    );
  }

  console.log('Webhook signature verified successfully.');

  // 4. Parse the body *after* verification
  let body;
  try {
    body = JSON.parse(requestBodyString);
  } catch (error) {
    console.error('Error parsing request body JSON:', error);
    return NextResponse.json(
      { message: 'Bad Request: Invalid JSON' },
      { status: 400 }
    );
  }

  // 5. Process Payload - Expecting a Project Document ID (draft or published)
  const projectIdWithPotentialDraft =
    body?.ids?.updated?.[0] || body?.ids?.created?.[0];

  // Check if the ID is missing or doesn't start with 'project.' or 'drafts.project.'
  if (
    !projectIdWithPotentialDraft ||
    !(
      projectIdWithPotentialDraft.startsWith('project.') ||
      projectIdWithPotentialDraft.startsWith('drafts.project.')
    )
  ) {
    console.log(
      'Webhook received for non-project document or missing/invalid ID:',
      projectIdWithPotentialDraft // Log the ID that was ignored
    );
    return NextResponse.json(
      { message: 'Ignoring non-project document or invalid ID format' }, // Updated message
      { status: 200 }
    );
  }

  // If the ID is valid (draft or published), remove the 'drafts.' prefix for fetching
  // This ID is used in the GROQ query to fetch the document data.
  // Fetching with the ID *without* 'drafts.' prefix usually gets the latest
  // version (published or draft) depending on your token permissions.
  const projectIdForFetch = projectIdWithPotentialDraft.replace(
    /^drafts\./,
    ''
  );

  console.log(
    `Processing update for project: ${projectIdForFetch} (Source ID: ${projectIdWithPotentialDraft})`
  ); // Log both

  try {
    // 6. Fetch the Project Document from Sanity
    // Fetch using the cleaned ID. The query *could* explicitly check for both
    // `_id == $projectIdForFetch || _id == $draftId` but fetching by the base ID
    // is often sufficient if your token has read access to drafts.
    const projectData = await sanityClient.fetch(
      `*[_id == $projectId][0]{
        _id,
        "tracks": tracks[]{ _key, asset, duration }
      }`,
      { projectId: projectIdForFetch } // Use the cleaned ID for the query
    );

    if (!projectData) {
      console.log(`Project document ${projectIdForFetch} not found.`);
      // It's possible the document was deleted right after the webhook triggered.
      // Return 200 as we successfully processed the webhook, just found no doc.
      return NextResponse.json(
        { message: 'Project document not found (possibly deleted)' },
        { status: 200 }
      );
    }

    if (!projectData.tracks || projectData.tracks.length === 0) {
      console.log(`No tracks found in project ${projectIdForFetch}.`);
      return NextResponse.json(
        { message: 'No tracks found in project, skipping.' },
        { status: 200 }
      );
    }

    // 7. Process Each Track in the Project
    let updatesMade = 0;
    // Patch the document using the *original* ID from the webhook payload
    // This ensures we patch the exact draft or published document that triggered the event.
    const patch = sanityClient.patch(projectIdWithPotentialDraft);

    const assetIds = projectData.tracks
      .map(track => track?.asset?._ref)
      .filter(Boolean);

    if (assetIds.length === 0) {
      console.log(
        `No valid audio asset references found in tracks for project ${projectIdForFetch}.`
      );
      return NextResponse.json(
        { message: 'No audio assets to process.' },
        { status: 200 }
      );
    }

    // Fetch all referenced audio assets in one go for efficiency
    const assets = await sanityClient.fetch(`*[_id in $assetIds]{ _id, url }`, {
      assetIds,
    });
    const assetUrlMap = new Map(assets.map(asset => [asset._id, asset.url]));

    for (const track of projectData.tracks) {
      const trackKey = track._key;
      const assetRef = track?.asset?._ref;
      const currentDuration = track.duration;

      if (!trackKey || !assetRef) {
        console.log(
          `Skipping track (missing key or asset ref) in project ${projectIdForFetch}:`,
          track
        );
        continue;
      }

      const audioUrl = assetUrlMap.get(assetRef);

      if (!audioUrl) {
        console.log(
          `Could not retrieve audio URL for asset ${assetRef} in track ${trackKey} of project ${projectIdForFetch}`
        );
        continue;
      }

      const newDuration = await getAudioDuration(audioUrl);

      if (newDuration == null) {
        console.log(
          `Could not extract duration for ${audioUrl} (track ${trackKey}, project ${projectIdForFetch})`
        );
        continue;
      }

      if (currentDuration !== newDuration) {
        console.log(
          `Updating duration for track ${trackKey} in project ${projectIdWithPotentialDraft} from ${currentDuration} to ${newDuration}` // Log with original ID
        );
        // Use the path syntax to target the duration field of the specific track object
        patch.set({ [`tracks[_key=="${trackKey}"].duration`]: newDuration });
        updatesMade++;
      } else {
        console.log(
          `Duration for track ${trackKey} in project ${projectIdForFetch} is already up-to-date (${newDuration}).`
        );
      }
    } // End of track loop

    // 8. Commit the Patch if changes were made
    if (updatesMade > 0) {
      await patch.commit(); // Commits changes to the document identified by projectIdWithPotentialDraft
      console.log(
        `Successfully patched ${updatesMade} track(s) in project ${projectIdWithPotentialDraft}.` // Log with original ID
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
        { message: 'All track durations already up-to-date.' },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error(
      `Error processing webhook for project ${projectIdWithPotentialDraft}:`,
      error
    ); // Log with original ID
    // Check if it's a Sanity client error vs other errors
    if (error.response && error.response.body) {
      console.error('Sanity client error details:', error.response.body);
    }
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
