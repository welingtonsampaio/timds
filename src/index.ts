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
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
export { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
export {
  Select,
  SelectContent,
  SelectEmpty,
  SelectGroup,
  SelectItem,
  SelectList,
  SelectLoading,
  type SelectOption,
  type SelectProps,
  SelectRoot,
  SelectSearch,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
} from '@/components/ui/select'
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
// Utilitários
export { cn } from '@/lib/utils'
