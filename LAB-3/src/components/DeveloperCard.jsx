import { Fragment, useState } from 'react';
import { SkillBadge } from './SkillBadge.jsx';
import styles from './DeveloperCard.module.css';

function getInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(-2)
    .join('')
    .toUpperCase();
}

export function DeveloperCard({
  fullName = 'Ngo Quang Nhiem',
  role = 'Software Engineering Student • UIT',
  avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240',
  metrics = { commits: 512, labs: 3, a11yScore: 100 },
  skills = [
    { id: 'sk-1', name: 'React 19', level: 'Core' },
    { id: 'sk-2', name: 'Semantic HTML', level: 'Core' },
    { id: 'sk-3', name: 'Web Audio API', level: 'Awareness' },
  ],
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <article className={styles.card} aria-labelledby="dev-heading">
      <header className={styles.header}>
        {imgFailed ? (
          <span className={styles.initials} aria-hidden="true">
            {getInitials(fullName)}
          </span>
        ) : (
          <img
            className={styles.avatar}
            src={avatarUrl}
            alt={fullName}
            width="64"
            height="64"
            onError={() => setImgFailed(true)}
          />
        )}
        <hgroup>
          <h2 id="dev-heading">{fullName}</h2>
          <p>{role}</p>
        </hgroup>
      </header>

      <dl className={styles.metrics}>
        {Object.entries(metrics).map(([key, value]) => (
          <Fragment key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </Fragment>
        ))}
      </dl>

      <ul className={styles.skills} aria-label="Engineered Skills">
        {skills.map((s) => (
          <SkillBadge key={s.id} name={s.name} level={s.level} />
        ))}
      </ul>
    </article>
  );
}