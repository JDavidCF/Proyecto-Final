import styles from './LowerLandingStarfield.module.css';

const stars = Array.from({ length: 72 }, (_, index) => {
  const size = index % 11 === 0 ? 3 : 2;

  return {
    left: `${(index * 37 + 13) % 100}%`,
    top: `${(index * 53 + 19) % 100}%`,
    width: `${size}px`,
    height: `${size}px`,
    animationDuration: `${(2.8 + (index % 7) * 0.46).toFixed(2)}s`,
    animationDelay: `-${((index * 0.29) % 4).toFixed(2)}s`,
  };
});

export function LowerLandingStarfield() {
  return (
    <div className={styles.starfield} aria-hidden="true">
      {stars.map((style, index) => (
        <span key={index} className={styles.star} style={style} />
      ))}
    </div>
  );
}
