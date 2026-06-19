// Estilos compilados do design system (tokens + utilitários usados pelos componentes).
// Disponíveis também via import "timds/styles.css".
import './styles.css'

// Componentes
export { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
export {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar'
export { Badge, badgeVariants } from '@/components/ui/badge'
export { Button, type ButtonProps, buttonVariants } from '@/components/ui/button'
export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
} from '@/components/ui/button-group'
export { Calendar, CalendarDayButton } from '@/components/ui/calendar'
export {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
export {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
export {
  Checkbox,
  CheckboxGroup,
  CheckboxGroupItem,
  type CheckboxGroupItemProps,
  type CheckboxGroupProps,
  type CheckboxProps,
  checkboxVariants,
} from '@/components/ui/checkbox'
export {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
export { DatePicker, type DatePickerProps } from '@/components/ui/date-picker'
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
export { Input } from '@/components/ui/input'
export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from '@/components/ui/input-group'
export {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp'
export {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
  itemVariants,
} from '@/components/ui/item'
export {
  getPaginationRange,
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  type PaginationMode,
  PaginationNext,
  PaginationPrevious,
  type PaginationRangeItem,
  type PaginationRangeOptions,
  PaginationShort,
  type PaginationShortLabels,
  type PaginationShortProps,
} from '@/components/ui/pagination'
export {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
export { Progress, progressVariants } from '@/components/ui/progress'
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
export {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectItem,
  SelectList,
  SelectLoading,
  type SelectMessages,
  type SelectOption,
  type SelectProps,
  SelectRoot,
  SelectSearch,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
} from '@/components/ui/select'
export { Separator } from '@/components/ui/separator'
export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  sidebarMenuButtonVariants,
  useSidebar,
} from '@/components/ui/sidebar'
export { Skeleton } from '@/components/ui/skeleton'
export {
  rangeVariants as sliderRangeVariants,
  Slider,
  type SliderProps,
  thumbVariants as sliderThumbVariants,
} from '@/components/ui/slider'
export { Toaster, type ToasterProps, toast } from '@/components/ui/sonner'
export { Spinner } from '@/components/ui/spinner'
export {
  Switch,
  type SwitchProps,
  switchVariants,
} from '@/components/ui/switch'
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  tabsListVariants,
} from '@/components/ui/tabs'
export { Textarea } from '@/components/ui/textarea'
export { Toggle, toggleVariants } from '@/components/ui/toggle'
export { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
// Utilitários
export { cn } from '@/lib/utils'
