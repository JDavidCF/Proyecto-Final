import { useLocation } from 'react-router-dom';
import styles from './BoxAssemblyAnimation.module.css';

const boxClasses = [
  styles.box0,
  styles.box1,
  styles.box2,
  styles.box3,
  styles.box4,
  styles.box5,
  styles.box6,
  styles.box7,
];

export function BoxAssemblyAnimation() {
  const { pathname } = useLocation();
  const side = pathname.startsWith('/app') ? 'right' : 'left';

  return (
    <div className={styles.viewport} data-side={side} aria-hidden="true">
      <div className={styles.loader}>
        <div className={styles.ground}>
          <div />
        </div>
        {boxClasses.map((boxClass, index) => (
          <div key={index} className={`${styles.box} ${boxClass}`}>
            <div />
          </div>
        ))}
      </div>
    </div>
  );
}
