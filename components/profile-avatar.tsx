/* eslint-disable @next/next/no-img-element */

export function ProfileAvatar({
  name,
  url,
  className = "",
}: {
  name: string;
  url?: string | null;
  className?: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "E";
  return (
    <span className={`profile-avatar ${url ? "has-photo" : ""} ${className}`.trim()}>
      {url ? <img src={url} alt={`${name}'s profile`} /> : initial}
    </span>
  );
}

