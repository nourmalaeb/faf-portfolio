import { AudioTrackInput, formatDuration } from "../lib/audioTrackInput";

export default {
  name: "audioTrack",
  title: "Audio Track",
  type: "object",
  components: { input: AudioTrackInput },
  fields: [
    {
      name: "asset",
      title: "Audio file",
      type: "file",
      options: { accept: "audio/*" },
      validation: (rule) => rule.required(),
    },
    {
      name: "title",
      title: "Track title",
      type: "string",
      validation: (rule) => rule.required(),
    },
  ],
  preview: {
    select: {
      title: "title",
      duration: "asset.asset.opt.faf.duration",
    },
    prepare: ({ title, duration }) => ({
      title: title || "Untitled track",
      subtitle: formatDuration(duration) ?? "Duration unknown",
    }),
  },
};
