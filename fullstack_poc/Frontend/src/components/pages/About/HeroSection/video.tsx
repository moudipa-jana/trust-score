function Video() {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      className="about-hero-video relative "
    >
      <source width="500" src="/images/about/about.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

export default Video;
