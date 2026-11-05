import { cn } from "@/lib/utils";
import {
  CircleCheck,
  CircleX,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

type InlineNoticeVariant = "info" | "warning" | "success" | "error";

const VARIANTS: Record<
  InlineNoticeVariant,
  { icon: LucideIcon; className: string }
> = {
  info: {
    icon: Info,
    className: "border-primary/30 bg-primary/10 [&>svg]:text-primary",
  },
  warning: {
    icon: TriangleAlert,
    className:
      "border-amber-500/40 bg-amber-500/10 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
  },
  success: {
    icon: CircleCheck,
    className: "border-success/30 bg-success/10 [&>svg]:text-success",
  },
  error: {
    icon: CircleX,
    className: "border-destructive/30 bg-destructive/10 [&>svg]:text-destructive",
  },
};

interface InlineNoticeProps {
  variant?: InlineNoticeVariant;
  title: string;
  children?: ReactNode;
  // Reemplaza el icono del variante (p. ej. un spinner mientras se espera algo)
  icon?: ReactNode;
  className?: string;
}

// Aviso en línea con icono, título y detalle opcional
const InlineNotice = ({
  variant = "info",
  title,
  children,
  icon,
  className,
}: InlineNoticeProps) => {
  const { icon: Icon, className: variantClassName } = VARIANTS[variant];

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-2 rounded-md border p-3 text-sm",
        variantClassName,
        className,
      )}
    >
      {icon ?? <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />}
      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="font-medium">{title}</p>
        {children && (
          <div className="text-xs text-muted-foreground break-words">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default InlineNotice;
