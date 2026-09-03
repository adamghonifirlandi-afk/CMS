import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-[22px] w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary border-primary/20",
        secondary:
          "bg-secondary text-secondary-foreground border-secondary",
        destructive:
          "bg-destructive/15 text-destructive border-destructive/20",
        outline:
          "border-border text-muted-foreground bg-transparent",
        ghost:
          "text-muted-foreground bg-transparent",
        link: "text-primary underline-offset-4 hover:underline",
        /* ── Semantic status badges ── */
        active:
          "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        published:
          "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
        draft:
          "bg-amber-500/15 text-amber-400 border-amber-500/25",
        pending:
          "bg-sky-500/15 text-sky-400 border-sky-500/25",
        archived:
          "bg-muted text-muted-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
