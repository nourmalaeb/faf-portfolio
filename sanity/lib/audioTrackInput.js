import { useEffect, useRef, useState, useCallback } from "react";
import { useClient, set, setIfMissing } from "sanity";
import { getFileAsset } from "@sanity/asset-utils";
import { Stack, Text, Flex, Button } from "@sanity/ui";
import { projectId, dataset } from "../env";

const API_VERSION = "2025-04-06";

export const formatDuration = (seconds) => {
  if (typeof seconds !== "number") return null;
  const total = Math.round(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

export function readDuration(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "metadata";
    audio.addEventListener(
      "loadedmetadata",
      () => resolve(Number.isFinite(audio.duration) ? audio.duration : null),
      { once: true },
    );
    audio.addEventListener("error", () => reject(new Error("Could not load audio")), {
      once: true,
    });
    audio.src = url;
  });
}

const titleFromFilename = (name) =>
  name
    ?.replace(/\.[^.]+$/, "")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || null;

export function AudioTrackInput(props) {
  const client = useClient({ apiVersion: API_VERSION });
  const assetRef = props.value?.asset?.asset?._ref;
  const [duration, setDurationState] = useState(null);
  const [status, setStatus] = useState(null);
  const [busy, setBusy] = useState(false);
  const handled = useRef(null);

  const propsRef = useRef(props);
  propsRef.current = props;

  const sync = useCallback(
    async (ref, { force = false } = {}) => {
      if (!ref) return;
      setBusy(true);
      try {
        const asset = await client.fetch(
          '*[_id == $id][0]{originalFilename, "duration": opt.faf.duration}',
          { id: ref },
        );

        if (!propsRef.current.value?.title) {
          const title = titleFromFilename(asset?.originalFilename);
          if (title) {
            propsRef.current.onChange([setIfMissing({}), set(title, ["title"])]);
          }
        }

        if (!force && typeof asset?.duration === "number") {
          setDurationState(asset.duration);
          setStatus(null);
          return;
        }

        setStatus("Reading duration…");
        const { url } = getFileAsset(ref, { projectId, dataset });
        const seconds = await readDuration(`${url}?t=${Date.now()}`);

        if (seconds == null) {
          setStatus("Could not read duration from this file");
          return;
        }

        const rounded = Math.round(seconds);
        await client
          .patch(ref)
          .setIfMissing({ opt: {} })
          .set({ "opt.faf.duration": rounded })
          .commit();

        setDurationState(rounded);
        setStatus(null);
      } catch (err) {
        console.error("Track metadata failed", err);
        setStatus("Could not read duration");
      } finally {
        setBusy(false);
      }
    },
    [client],
  );

  useEffect(() => {
    if (!assetRef) {
      setDurationState(null);
      return;
    }
    if (handled.current === assetRef) return;
    handled.current = assetRef;
    sync(assetRef);
  }, [assetRef, sync]);

  return (
    <Stack gap={3}>
      {props.renderDefault(props)}
      <Flex align="center" gap={3}>
        {duration != null && (
          <Text size={1} muted>
            Duration: {formatDuration(duration)}
          </Text>
        )}
        {status && (
          <Text size={1} muted>
            {status}
          </Text>
        )}
        {assetRef && (
          <Button
            mode="bleed"
            fontSize={1}
            padding={2}
            text="Recalculate"
            disabled={busy}
            onClick={() => sync(assetRef, { force: true })}
          />
        )}
      </Flex>
    </Stack>
  );
}
