import styles from './DeveloperCard.module.css';

export function SkillBadge({ name, level = 'Core' }) {
  return (
    <li className={styles.badge}>
      {name} <span className={styles.level}>({level})</span>
    </li>
  );
}