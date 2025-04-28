import React, { useState, useCallback, useRef } from 'react';
import { Stack, Box, Text, Button, Flex } from '@sanity/ui';
import { Upload, Trash2, FileAudio } from 'lucide-react';

import { createClient } from '@sanity/client';
// import { basename } from 'path';
// import { createReadStream } from 'fs';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
});

const AudioTrackWithDuration = React.forwardRef((props, ref) => {
  const { value, onChange, readOnly, onFocus, onBlur } = props;

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const formatDuration = seconds => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const remainingSeconds = Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0');
    return `${minutes}:${remainingSeconds}`;
  };

  const handleFileChange = useCallback(
    async event => {
      const file = event.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setUploadProgress(0);

      try {
        const asset = await client.assets.upload('file', file, {
          contentType: file.type,
          filename: file.name,
          onProgress: progress => setUploadProgress(progress.percent * 100),
        });

        console.log('potato', event);

        const audioUrl = asset.url;

        const getAudioDuration = url =>
          new Promise(resolve => {
            const audio = new Audio();
            audio.addEventListener('loadedmetadata', () =>
              resolve(audio.duration)
            );
            audio.src = url;
          });

        const duration = await getAudioDuration(audioUrl);

        const nextValue = [
          ...(value || []),
          {
            _type: 'audioTrack',
            asset: { _type: 'reference', _ref: asset._id },
            title: file.name,
            duration,
          },
        ];

        onChange({ patch: { [props.path.segments[0]]: nextValue } });
      } catch (error) {
        console.error('Error uploading audio:', error);
      } finally {
        setUploading(false);
        setDragOver(false);
      }
    },
    [onChange, props.path, client.assets, value]
  );

  const handleRemoveTrack = useCallback(
    index => {
      const nextValue = (value || []).filter((_, i) => i !== index);
      onChange({ patch: { [props.path.segments[0]]: nextValue } });
    },
    [onChange, props.path, value]
  );

  const handleDragEnter = event => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = event => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
  };

  const handleDragOver = event => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = event => {
    event.preventDefault();
    event.stopPropagation();
    setDragOver(false);
    if (event.dataTransfer.files?.length) {
      handleFileChange({ target: { files: event.dataTransfer.files } });
    }
  };

  return (
    <Stack space={3}>
      <Box
        ref={ref}
        onFocus={onFocus}
        onBlur={onBlur}
        className={dragOver ? 'drag-over' : ''}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          borderWidth: '2px',
          borderStyle: 'dashed',
          borderRadius: '6px',
          borderColor: dragOver ? '#14b8a6' : '#d1d5db',
          padding: '24px',
          textAlign: 'center',
          cursor: 'pointer',
          position: 'relative',
          backgroundColor: dragOver ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
          transition: 'border-color 0.2s, background-color 0.2s',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            cursor: 'pointer',
          }}
        >
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ width: '100%', height: '100%' }}
            disabled={readOnly || uploading}
            aria-describedby="file-upload-help"
          />
        </div>
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap={2}
          style={{ pointerEvents: 'none' }}
        >
          <Upload
            size={48}
            color={dragOver ? '#14b8a6' : '#6b7280'}
            style={{ transition: 'color 0.2s' }}
          />
          <Text size={2} muted>
            Drag and drop audio file, or click to select
          </Text>
          <Text size={1} muted id="file-upload-help">
            Only audio files are allowed
          </Text>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={readOnly || uploading}
            style={{ pointerEvents: 'auto' }}
          >
            Choose File
          </Button>
        </Flex>
      </Box>

      {uploading && (
        <Box padding={2}>
          <Text size={1} muted>
            Uploading... {Math.round(uploadProgress)}%
          </Text>
          <Box
            style={{
              backgroundColor: '#e5e7eb',
              borderRadius: '4px',
              height: '8px',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                backgroundColor: '#10b981',
                height: '100%',
                borderRadius: '4px',
                width: `${uploadProgress}%`,
                transition: 'width 0.2s ease-out',
              }}
            />
          </Box>
        </Box>
      )}
      {value?.length > 0 && (
        <Stack space={3}>
          <Text size={2} weight="semibold">
            Tracklist
          </Text>
          {value.map((track, index) => (
            <Box
              key={index}
              padding={3}
              border
              borderRadius={2}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Flex gap={2} align="center">
                <FileAudio size={20} />
                <Stack space={1}>
                  <Text size={2}>
                    {track.title || track.asset?.originalFilename}
                  </Text>
                  {track.duration && (
                    <Text size={1} muted>
                      Duration: {formatDuration(track.duration)}
                    </Text>
                  )}
                </Stack>
              </Flex>
              <Button
                tone="critical"
                text="Remove"
                onClick={() => handleRemoveTrack(index)}
                icon={Trash2}
                padding="0.5rem"
              />
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
});

export default AudioTrackWithDuration;
