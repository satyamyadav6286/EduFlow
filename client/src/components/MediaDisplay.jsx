import React, { useState, useEffect } from 'react';
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
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="text-center">
            <p className="text-red-500">Failed to load {type}</p>
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
          url={src}
          width="100%"
          height="100%"
          controls
          onReady={handleVideoReady}
          onError={handleVideoError}
          className={`${!mediaReady ? 'invisible' : ''}`}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                crossOrigin: 'anonymous',
                preload: 'auto'
              }
            }
          }}
          {...videoProps}
        />
      )}
    </div>
  );
};

export default MediaDisplay; 