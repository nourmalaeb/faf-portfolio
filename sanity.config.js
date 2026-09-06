"use client";

import { OkHandIcon } from "@sanity/icons/OkHand";

/**
 * This configuration is used to for the Sanity Studio that’s mounted on the `/app/admin/[[...tool]]/page.jsx` route
 */

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { media } from "sanity-plugin-media";

// Go to https://www.sanity.io/docs/api-versioning to learn how API versioning works
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schema } from "./sanity/schemaTypes";
import { structure } from "./sanity/structure";
import { slugOnSave } from "./sanity/lib/actions";
import { CustomNavbar } from "./sanity/lib/navBar";
import { DurationSweepTool } from "./sanity/lib/durationSweepTool";

export default defineConfig({
  basePath: "/admin",
  projectId,
  dataset,
  // Add and edit the content schema in the './sanity/schemaTypes' folder
  schema,
  document: {
    actions: (prev) =>
      prev.map((originalAction) =>
        originalAction.action === "publish" ? slugOnSave(originalAction) : originalAction,
      ),
  },
  studio: {
    components: {
      navbar: CustomNavbar,
    },
  },
  plugins: [
    structureTool({ structure }),
    // Vision is for querying with GROQ from inside the Studio
    // https://www.sanity.io/docs/the-vision-plugin
    visionTool({ defaultApiVersion: apiVersion }),
    media(),
  ],
  tools: (prev) => [
    ...prev,
    { name: "durations", title: "Durations", component: DurationSweepTool },
  ],
  title: `Firas Abou Fakher CMS`,
  icon: OkHandIcon,
});
