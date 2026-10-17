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
  /**
   * Solo con búsqueda en el servidor (`onSearchChange`): la opción se filtra en el
   * cliente por su etiqueta. Es para opciones fijas como "Todos" o "Ninguno", que
   * el servidor no devuelve y no deben aparecer mientras se busca otra cosa.
   */
  localFilter?: boolean
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
  /**
   * Búsqueda en el servidor: se llama con el texto escrito (sin espacios a los
   * lados y con debounce) y con "" al cerrar el selector. Al definirla, `options`
   * se asume ya filtrado por el servidor y se desactiva el filtro local.
   */
  onSearchChange?: (search: string) => void
  /** Indica que se están cargando las opciones: se muestra `loadingText` si no hay ninguna */
  loading?: boolean
  loadingText?: string
  /** Milisegundos sin escribir antes de llamar a `onSearchChange` */
  searchDebounceMs?: number
}

// Ignora mayúsculas y tildes para que "perez" encuentre "Pérez"
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()

// Cada palabra buscada debe estar en la etiqueta, sin importar el orden
const matchesSearch = (label: string, search: string) => {
  const text = normalize(label)
  const terms = normalize(search).split(/\s+/).filter(Boolean)
  return terms.every((term) => text.includes(term))
}

const filterByLabel = (_value: string, search: string, keywords?: string[]) =>
  matchesSearch(keywords?.join(" ") ?? "", search) ? 1 : 0

const NO_HIGHLIGHT = { resultsKey: "", value: "" }

/**
 * Select con buscador (combobox). Misma API que <Select> de shadcn:
 * recibe `value` / `onValueChange` con strings, pero las opciones van en `options`.
 *
 * Por defecto filtra `options` en el cliente. Con `onSearchChange` delega la
 * búsqueda en el servidor: el padre vuelve a consultar el endpoint con el texto
 * recibido y entrega en `options` los resultados.
 */
function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyText = "Sin resultados.",
  icon,
  onSearchChange,
  loading = false,
  loadingText = "Buscando...",
  searchDebounceMs = 300,
  className,
  disabled,
  ...props
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const serverSearch = onSearchChange !== undefined

  // Al buscar en el servidor la opción elegida puede no estar en `options` (mientras se
  // escribe, o porque la lista sin filtrar es más corta y no la incluye); se recuerda
  // la última vista o elegida para que el botón conserve su etiqueta.
  const found = options.find((option) => option.value === value)
  const [remembered, setRemembered] = React.useState(found)
  if (
    found &&
    (found.value !== remembered?.value || found.label !== remembered.label)
  ) {
    setRemembered(found)
  }
  const selected = found ?? (remembered?.value === value ? remembered : undefined)

  // Las opciones del servidor se muestran tal cual; solo se filtran las fijas
  const visibleOptions = serverSearch
    ? options.filter(
        (option) => !option.localFilter || matchesSearch(option.label, search)
      )
    : options

  // Con búsqueda en el servidor los ítems de cmdk se montan y desmontan al llegar los
  // resultados, y su resaltado puede quedar apuntando a un ítem que ya no existe: no se
  // resalta ninguno y Enter no selecciona nada. Por eso allí se controla el resaltado:
  // pertenece a un conjunto de resultados y, cuando estos cambian, vuelve al primero.
  const resultsKey = visibleOptions.map((option) => option.value).join("|")
  const [highlight, setHighlight] = React.useState(NO_HIGHLIGHT)
  const activeValue =
    highlight.resultsKey === resultsKey &&
    visibleOptions.some((option) => option.value === highlight.value)
      ? highlight.value
      : (visibleOptions[0]?.value ?? "")

  React.useEffect(() => () => clearTimeout(debounceRef.current), [])

  const handleSearchChange = (nextSearch: string) => {
    setSearch(nextSearch)
    if (!onSearchChange) return
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(
      () => onSearchChange(nextSearch.trim()),
      searchDebounceMs
    )
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      // El buscador se desmonta al cerrar: se descarta también la búsqueda del
      // padre para que al reabrir se vea la lista completa y no la última filtrada
      clearTimeout(debounceRef.current)
      setSearch("")
      setHighlight(NO_HIGHLIGHT)
      onSearchChange?.("")
    }
  }

  const handleSelect = (option: SearchableSelectOption) => {
    handleOpenChange(false)
    // Igual que <Select>: solo notifica si el valor realmente cambió
    if (option.value !== value) {
      setRemembered(option)
      onValueChange?.(option.value)
    }
  }

  return (
    // modal: permite hacer scroll con la rueda cuando se usa dentro de Dialog/Sheet
    <Popover open={open} onOpenChange={handleOpenChange} modal>
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
        <Command
          shouldFilter={!serverSearch}
          filter={filterByLabel}
          value={serverSearch ? activeValue : undefined}
          onValueChange={(nextValue) =>
            setHighlight({ resultsKey, value: nextValue })
          }
        >
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            {loading && visibleOptions.length === 0 ? (
              <div className="text-muted-foreground py-6 text-center text-sm">
                {loadingText}
              </div>
            ) : (
              <CommandEmpty>{emptyText}</CommandEmpty>
            )}
            <CommandGroup>
              {visibleOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  // value único (id) para el resaltado; la búsqueda usa la etiqueta
                  value={option.value}
                  keywords={[option.label]}
                  onSelect={() => handleSelect(option)}
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
