/** Small count bubble for header icons; re-keyed so it pops each time the count changes. */
export function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      key={count}
      aria-hidden="true"
      className="bag-pop absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground ring-2 ring-background"
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
