"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface SearchableSelectOption {
  value: string
  label: string
}

interface SearchableSelectProps
  extends Omit<
    React.ComponentProps<"button">,
    "value" | "onChange" | "children"
  > {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  icon?: React.ReactNode
}

// Ignora mayúsculas y tildes para que "perez" encuentre "Pérez"
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()

// Cada palabra buscada debe estar en la etiqueta, sin importar el orden
const filterByLabel = (_value: string, search: string, keywords?: string[]) => {
  const label = normalize(keywords?.join(" ") ?? "")
  const terms = normalize(search).split(/\s+/).filter(Boolean)
  return terms.every((term) => label.includes(term)) ? 1 : 0
}

/**
 * Select con buscador (combobox). Misma API que <Select> de shadcn:
 * recibe `value` / `onValueChange` con strings, pero las opciones van en `options`.
 */
function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados.",
  icon,
  className,
  disabled,
  ...props
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const selected = options.find((option) => option.value === value)

  const handleSelect = (nextValue: string) => {
    setOpen(false)
    // Igual que <Select>: solo notifica si el valor realmente cambió
    if (nextValue !== value) onValueChange?.(nextValue)
  }

  return (
    // modal: permite hacer scroll con la rueda cuando se usa dentro de Dialog/Sheet
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          data-slot="searchable-select-trigger"
          data-placeholder={selected ? undefined : ""}
          disabled={disabled}
          className={cn(
            "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
            className
          )}
          {...props}
        >
          <span className="flex min-w-0 items-center gap-2">
            {icon}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <ChevronDownIcon className="opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
      >
        <Command filter={filterByLabel}>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  // value único (id) para el resaltado; la búsqueda usa la etiqueta
                  value={option.value}
                  keywords={[option.label]}
                  onSelect={() => handleSelect(option.value)}
                >
                  {option.label}
                  <CheckIcon
                    className={cn(
                      "ml-auto",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { SearchableSelect }
export type { SearchableSelectOption, SearchableSelectProps }
