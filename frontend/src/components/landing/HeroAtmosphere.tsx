import styles from './HeroAtmosphere.module.css';

const starClasses = [
  styles.starOne,
  styles.starTwo,
  styles.starThree,
  styles.starFour,
  styles.starFive,
  styles.starSix,
  styles.starSeven,
];

export function HeroAtmosphere() {
  return (
    <div className={styles.atmosphere} aria-hidden="true">
      <div className={styles.sectionBanner}>
        <div className={styles.curvedCornerStar}>
          <span className={styles.cornerBottomLeft} />
          <span className={styles.cornerBottomRight} />
          <span className={styles.cornerTopLeft} />
          <span className={styles.cornerTopRight} />
        </div>
        {starClasses.map((className, index) => (
          <span key={index} className={`${styles.star} ${className}`}>
            ✦
          </span>
        ))}
      </div>
    </div>
  );
}
