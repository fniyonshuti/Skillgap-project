export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}) {
  const variantClass =
    variant === "secondary"
      ? "secondary-button"
      : variant === "text"
      ? "text-button"
      : "primary-button";

  return (
    <button className={`${variantClass} ${className}`.trim()} type={type} {...props}>
      {children}
    </button>
  );
}
