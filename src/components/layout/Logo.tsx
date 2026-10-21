import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

/**
 * The official DB Hub logo, cut from the supplied brand image without redrawing.
 * `badge` places it on its original white circle for dark backgrounds instead of recolouring it.
 */
export function Logo({
  variant = "plain",
  className,
  link = true,
}: {
  variant?: "plain" | "badge";
  className?: string;
  link?: boolean;
}) {
  const img = (
    <img src={logo} alt="DB Hub Cloth Store" width={221} height={185} className="h-full w-auto" />
  );
  const body =
    variant === "badge" ? (
      <span
        className={cn(
          "grid aspect-square h-20 place-items-center rounded-full bg-white p-3",
          className,
        )}
      >
        {img}
      </span>
    ) : (
      <span className={cn("block h-12 sm:h-14", className)}>{img}</span>
    );
  return link ? (
    <Link to="/" aria-label="DB Hub Cloth Store — home" className="inline-block shrink-0">
      {body}
    </Link>
  ) : (
    body
  );
}
