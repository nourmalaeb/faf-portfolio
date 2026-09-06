// sanity/lib/durationSweepTool.jsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";
import { getFileAsset } from "@sanity/asset-utils";
import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Select,
  Spinner,
  Stack,
  Text,
  TextInput,
} from "@sanity/ui";
import { projectId, dataset } from "../env";
import { formatDuration, readDuration } from "./audioTrackInput";

const API_VERSION = "2025-04-06";

const formatBytes = (bytes) =>
  typeof bytes === "number" ? `${(bytes / 1024 / 1024).toFixed(2)} MB` : "—";

const ASSETS_QUERY = `*[_type == "sanity.fileAsset" && string::startsWith(mimeType, "audio/")]
  | order(originalFilename asc) [0...500]{
    _id, originalFilename, size, "duration": opt.faf.duration
  }`;

export function DurationSweepTool() {
  const client = useClient({ apiVersion: API_VERSION });
  const [assets, setAssets] = useState(null);
  const [pending, setPending] = useState({});
  const [sort, setSort] = useState("name");
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setAssets(await client.fetch(ASSETS_QUERY));
  }, [client]);

  useEffect(() => {
    load();
  }, [load]);

  const recalc = useCallback(
    async (asset) => {
      setPending((p) => ({ ...p, [asset._id]: "working" }));
      try {
        const { url } = getFileAsset(asset._id, { projectId, dataset });
        const seconds = await readDuration(`${url}?t=${Date.now()}`);
        if (seconds == null) throw new Error("No duration in file");

        const rounded = Math.round(seconds);
        await client
          .patch(asset._id)
          .setIfMissing({ opt: {} })
          .set({ "opt.faf.duration": rounded })
          .commit();

        setAssets((list) =>
          list.map((a) => (a._id === asset._id ? { ...a, duration: rounded } : a)),
        );
        setPending((p) => ({ ...p, [asset._id]: null }));
      } catch (err) {
        console.error(asset.originalFilename, err);
        setPending((p) => ({ ...p, [asset._id]: err.message }));
      }
    },
    [client],
  );

  const sweep = useCallback(
    async (force) => {
      setBusy(true);
      const targets = (assets ?? []).filter((a) => force || a.duration == null);
      for (const asset of targets) {
        await recalc(asset);
      }
      setBusy(false);
    },
    [assets, recalc],
  );

  const visible = useMemo(() => {
    const list = (assets ?? []).filter((a) =>
      a.originalFilename?.toLowerCase().includes(filter.toLowerCase()),
    );
    const sorters = {
      name: (a, b) => (a.originalFilename ?? "").localeCompare(b.originalFilename ?? ""),
      duration: (a, b) => (b.duration ?? -1) - (a.duration ?? -1),
      size: (a, b) => (b.size ?? 0) - (a.size ?? 0),
      missing: (a, b) => (a.duration == null ? -1 : 1) - (b.duration == null ? -1 : 1),
    };
    return [...list].sort(sorters[sort]);
  }, [assets, filter, sort]);

  const missing = (assets ?? []).filter((a) => a.duration == null).length;

  if (!assets) {
    return (
      <Flex align="center" justify="center" padding={6}>
        <Spinner muted />
      </Flex>
    );
  }

  return (
    <Container width={2} padding={4}>
      <Stack gap={4}>
        <Flex align="center" gap={2}>
          <Button
            text={`Fill in ${missing} missing`}
            disabled={busy || missing === 0}
            onClick={() => sweep(false)}
          />
          <Button
            text="Recalculate all"
            tone="caution"
            mode="ghost"
            disabled={busy}
            onClick={() => sweep(true)}
          />
          <Box flex={1} />
          <Text size={1} muted>
            {assets.length} audio {assets.length === 1 ? "file" : "files"}
          </Text>
        </Flex>

        <Flex gap={2}>
          <Box flex={1}>
            <TextInput
              placeholder="Filter by filename"
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value)}
            />
          </Box>
          <Select value={sort} onChange={(e) => setSort(e.currentTarget.value)}>
            <option value="name">Filename</option>
            <option value="duration">Longest first</option>
            <option value="size">Largest first</option>
            <option value="missing">Missing first</option>
          </Select>
        </Flex>

        <Stack gap={1}>
          {visible.map((asset) => {
            const state = pending[asset._id];
            return (
              <Card
                key={asset._id}
                padding={3}
                radius={2}
                tone={asset.duration == null ? "caution" : "transparent"}
              >
                <Flex align="center" gap={3}>
                  <Box flex={1}>
                    <Text size={1} textOverflow="ellipsis">
                      {asset.originalFilename}
                    </Text>
                  </Box>
                  <Text size={1} muted style={{ minWidth: 70, textAlign: "right" }}>
                    {formatBytes(asset.size)}
                  </Text>
                  <Text size={1} muted style={{ minWidth: 60, textAlign: "right" }}>
                    {state === "working"
                      ? "…"
                      : state
                        ? state
                        : (formatDuration(asset.duration) ?? "—")}
                  </Text>
                  <Button
                    mode="bleed"
                    fontSize={1}
                    padding={2}
                    text="Recalc"
                    disabled={busy || state === "working"}
                    onClick={() => recalc(asset)}
                  />
                </Flex>
              </Card>
            );
          })}
        </Stack>
      </Stack>
    </Container>
  );
}
