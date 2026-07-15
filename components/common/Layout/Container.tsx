import cn from "classnames";

export function Container({ children, className }: any) {
  return (
    <div
      className={cn("w-full max-w-7xl mx-auto px-12", "md:px-32", className)}
    >
      {children}
    </div>
  );
}
