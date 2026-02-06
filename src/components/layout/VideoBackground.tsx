"use client";

export default function VideoBackground() {
  return (
    <div className="video-bg-wrapper">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="video-bg"
      >
        <source src="/video/fishing-village.mp4" type="video/mp4" />
      </video>
      {/* Dark overlay for contrast */}
      <div className="video-bg-overlay" />
    </div>
  );
}
