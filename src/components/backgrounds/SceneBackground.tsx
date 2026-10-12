import React, { useEffect, useRef, useState } from 'react';
import { useSceneBackgrounds } from '../../lib/backgrounds/context';
import { SceneId } from '../../lib/backgrounds/types';

interface SceneBackgroundProps {
  sceneId: SceneId;
}

export const SceneBackground: React.FC<SceneBackgroundProps> = ({ sceneId }) => {
  const { getSceneSetting } = useSceneBackgrounds();
  const setting = getSceneSetting(sceneId);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasVideoError, setHasVideoError] = useState(false);

  const bgType = setting?.bgType || 'default';
  const mediaUrl = setting?.mediaUrl;
  const fallbackUrl = setting?.fallbackMediaUrl;
  const fit = setting?.fit || 'cover';
  const position = setting?.position || 'center';
  const overlayColor = setting?.overlayColor || '#000000';
  const overlayOpacity = setting?.overlayOpacity ?? 0;

  // Reset video error state when sceneId or mediaUrl changes
  useEffect(() => {
    setHasVideoError(false);
  }, [sceneId, mediaUrl]);

  // Video lifecycle management: autoplay, pause, and release on scene change
  useEffect(() => {
    if (bgType !== 'video' || !mediaUrl || hasVideoError) return;

    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {
        setHasVideoError(true);
      });
    }

    return () => {
      if (video) {
        video.pause();
        video.removeAttribute('src');
        video.load();
      }
    };
  }, [bgType, mediaUrl, sceneId, hasVideoError]);

  const objectStyle: React.CSSProperties = {
    objectFit: fit,
    objectPosition: position,
  };

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
      {/* 1. Video Background */}
      {bgType === 'video' && mediaUrl && !hasVideoError && (
        <video
          ref={videoRef}
          src={mediaUrl}
          poster={fallbackUrl || undefined}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setHasVideoError(true)}
          style={objectStyle}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* 2. Fallback Image if Video fails or if video fallback is active */}
      {bgType === 'video' && (hasVideoError || !mediaUrl) && fallbackUrl && (
        <img
          src={fallbackUrl}
          alt=""
          style={objectStyle}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      )}

      {/* 3. Image Background */}
      {bgType === 'image' && mediaUrl && (
        <img src={mediaUrl} alt="" style={objectStyle} className="absolute inset-0 w-full h-full pointer-events-none" />
      )}

      {/* 4. Existing Default Background */}
      {(bgType === 'default' ||
        (bgType === 'image' && !mediaUrl) ||
        (bgType === 'video' && hasVideoError && !fallbackUrl)) && (
        <>
          {sceneId === 'intro' ? (
            <img
              src="/assets/Cheerful-Mascot-Castle-Adventure.png"
              alt="Start up Hero Background"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 pointer-events-none" />
          )}
        </>
      )}

      {/* 5. Optional Color Overlay for Text Readability */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        />
      )}
    </div>
  );
};
