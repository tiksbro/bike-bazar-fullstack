
function VehiclePhoto({ photo, width = 800, alt, className = '', eager = false }) {
  const resizedUrl = photo.url.replace('/upload/', `/upload/w_${width},c_limit,q_auto,f_auto/`)

  return (
    <img
      src={resizedUrl}
      alt={alt}
      // "lazy" = only download the photo when it scrolls near the screen.
      loading={eager ? 'eager' : 'lazy'}
      className={`w-full h-full object-cover ${className}`}
    />
  )
}

export default VehiclePhoto
