import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';

const MediaDisplay = ({ 
  type, // 'image' or 'video'
  src,
  alt = 'Media content',
  className = '',
  fallbackImage = 'https://via.placeholder.com/300x200?text=No+Image',
  videoProps = {},
  imageProps = {}
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [mediaReady, setMediaReady] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    if (src) {
      setIsLoading(true);
      setHasError(false);
      setMediaReady(false);
    }
  }, [src]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setMediaReady(true);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleVideoReady = () => {
    setIsLoading(false);
    setMediaReady(true);
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('Video failed to load:', src);
  };

  // Function to reload video if it fails
  const retryVideoLoad = () => {
    if (playerRef.current) {
      setHasError(false);
      setIsLoading(true);
      // Force reload the player
      playerRef.current.forceUpdate();
    }
  };

  if (!src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <img 
          src={fallbackImage} 
          alt="No content available" 
          className="object-cover w-full h-full"
        />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <p className="text-red-500 mb-2">Failed to load {type}</p>
            <button 
              onClick={retryVideoLoad}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mb-4"
            >
              Retry
            </button>
            <img 
              src={fallbackImage} 
              alt="Media loading failed" 
              className="object-contain max-w-full max-h-full"
            />
          </div>
        </div>
      )}

      {type === 'image' && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`object-cover w-full h-full ${!mediaReady ? 'hidden' : ''}`}
          {...imageProps}
        />
      )}

      {type === 'video' && !hasError && (
        <ReactPlayer
          ref={playerRef}
          url={src}
          width="100%"
          height="100%"
          controls={true}
          playing={false} // Ensure video doesn't autoplay
          onReady={handleVideoReady}
          onError={handleVideoError}
          className={`${!mediaReady ? 'invisible' : ''}`}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                crossOrigin: 'anonymous',
                preload: 'metadata', // Only preload metadata for faster loading
              },
              forceVideo: true, // Force using HTML5 video element
            }
          }}
          {...videoProps}
        />
      )}
    </div>
  );
};

export default MediaDisplay; 