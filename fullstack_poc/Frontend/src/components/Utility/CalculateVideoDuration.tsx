{
  /**
   * CalculateVideoDuration dynamically calculates and displays the duration of a video from its URL.
   * It renders the duration in seconds or minutes (e.g., "45 secs", "2.30 mins") based on metadata.
   */
}
import React, { useCallback, useEffect, useState } from 'react';

function CalculateVideoDuration({ videoUrl }: { videoUrl: string }) {
  const [videoTimeDisplay, setVideoTimeDisplay] = useState<string | null>(null);

  const fetchVideoDuration = useCallback(() => {
    const tempVideo = document.createElement('video');
    tempVideo.src = videoUrl;

    tempVideo.onloadedmetadata = () => {
      const duration = Math.floor(tempVideo.duration);

      if (!isNaN(duration)) {
        if (duration < 60) {
          setVideoTimeDisplay(`${duration} secs`);
        } else {
          const minutes = Math.floor(duration / 60);
          const seconds = duration % 60;
          setVideoTimeDisplay(`${minutes}.${seconds} mins`);
        }
      } else {
        setVideoTimeDisplay(null);
      }

      tempVideo.remove();
    };
  }, [videoUrl]);

  useEffect(() => {
    fetchVideoDuration();
  }, [fetchVideoDuration]);

  return <span>{videoTimeDisplay !== null ? videoTimeDisplay : '0 secs'}</span>;
}

export default CalculateVideoDuration;
