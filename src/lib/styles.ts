// Presets de classe compartilhados entre componentes.
//
// Aqui ficam COMBINAÇÕES de utilitários Tailwind que se repetem em vários
// componentes (estados de foco, inválido, desabilitado, etc.) — não tokens de
// design. Os tokens de cor/spacing continuam em `src/styles.css` (fonte única
// dos valores); estes presets só evitam o drift de classes copiadas entre
// arquivos.
//
// Use sempre via `cn(...)`, concatenando como qualquer outra string de classe:
//
//   className={cn(focusRing, ariaInvalid, disabledControl, '...locais', className)}
//
// Como entram no `cn` (tailwind-merge), o consumidor continua conseguindo
// sobrescrever qualquer utilitário pelo `className`, e a ordem entre presets
// não afeta o resultado (são grupos de utilitários sem conflito entre si).

/** Anel de foco padrão dos controles (button, input, checkbox, select, ...). */
export const focusRing =
  'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]'

/** Estado inválido via `aria-invalid`: borda e anel destrutivos (com dark). */
export const ariaInvalid =
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40'

/** Desabilitado para controles interativos. */
export const disabledControl = 'disabled:cursor-not-allowed disabled:opacity-50'

/** Proteções para ícones SVG embutidos (não capturam ponteiro, não encolhem,
 *  tamanho padrão quando o consumidor não define um `size-*`). */
export const svgIcon =
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"

/** Backdrop escurecido dos overlays modais (Dialog/AlertDialog). */
export const overlayClass =
  'fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0'

/**
 * Superfície central de um modal (Dialog/AlertDialog): posicionamento,
 * borda/sombra, animação de entrada/saída e largura por `size` (dirigida pelo
 * atributo `data-size` no próprio elemento). O nome do `group/...` fica a cargo
 * de cada componente (ex.: `group/dialog-content`), pois os filhos referenciam
 * esse nome em `group-data-[size=...]`.
 */
export const modalSurface =
  'fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[size=sm]:max-w-xs data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[size=default]:sm:max-w-lg'
