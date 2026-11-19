import './spaceWallpaper.css';

export function SpaceWallpaper() {
  return (
    <div aria-hidden="true" className="sn-space-wallpaper">
      <span className="sn-space-wallpaper__stars sn-space-wallpaper__stars--far" />
      <span className="sn-space-wallpaper__stars sn-space-wallpaper__stars--middle" />
      <span className="sn-space-wallpaper__stars sn-space-wallpaper__stars--near" />
      <div className="sn-space-wallpaper__twinkles">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    </div>
  );
}
