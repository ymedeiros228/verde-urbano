import { cn } from '@/lib/utils/cn';

interface ProfileHeaderProps {
  name: string;
  email?: string | null;
  roleLabel?: string;
  className?: string;
}

function initials(name: string) {
  return name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export function ProfileHeader({
  name,
  email,
  roleLabel,
  className,
}: ProfileHeaderProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-folha to-rio font-display text-xl font-semibold text-white shadow-soft"
        aria-hidden
      >
        {initials(name || email || 'VU')}
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-xl font-semibold text-folha">
          {name}
        </p>
        {email && (
          <p className="truncate text-sm text-tinta-muted">{email}</p>
        )}
        {roleLabel && (
          <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-folha-light">
            {roleLabel}
          </p>
        )}
      </div>
    </div>
  );
}
