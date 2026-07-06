import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-zinc-500 sm:mb-6 sm:text-sm">
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {index > 0 && <span aria-hidden="true" className="text-zinc-600">/</span>}
              {isLast || !item.href ? (
                <span className="text-zinc-300">{item.label}</span>
              ) : (
                <Link href={item.href} className="hover:text-emerald-400">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
