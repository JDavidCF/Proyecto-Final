import styles from './AmbientOrbField.module.css';

export type AmbientOrbScene = 'landing' | 'dashboard';

interface AmbientOrbFieldProps {
  scene: AmbientOrbScene;
}

export function AmbientOrbField({ scene }: AmbientOrbFieldProps) {
  const count = scene === 'landing' ? 5 : 3;

  return (
    <div className={styles.field} data-scene={scene} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <span key={index} className={styles.orb} />
      ))}
    </div>
  );
}
