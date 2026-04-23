import React from "react";
import type { LucideIcon, LucideProps } from "lucide-react-native";
import {
  AlertCircle,
  ArrowDownCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  Bell,
  Briefcase,
  Calendar,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Home,
  Info,
  Lock,
  Mail,
  Menu,
  MessageCircle,
  Move,
  Phone,
  Plus,
  PlusSquare,
  Search,
  Star,
  Trash2,
  TrendingUp,
  User,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react-native";

const ICONS: Record<string, LucideIcon> = {
  "alert-circle": AlertCircle,
  "arrow-down-circle": ArrowDownCircle,
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  award: Award,
  bell: Bell,
  briefcase: Briefcase,
  calendar: Calendar,
  check: Check,
  "check-circle": CheckCircle,
  "check-square": CheckSquare,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  clock: Clock,
  eye: Eye,
  "eye-off": EyeOff,
  home: Home,
  info: Info,
  lock: Lock,
  mail: Mail,
  menu: Menu,
  "message-circle": MessageCircle,
  move: Move,
  phone: Phone,
  plus: Plus,
  "plus-square": PlusSquare,
  search: Search,
  star: Star,
  "trash-2": Trash2,
  "trending-up": TrendingUp,
  user: User,
  "user-plus": UserPlus,
  users: Users,
  x: X,
  zap: Zap,
};

interface IconProps extends LucideProps {
  name: string;
}

export function Icon({ name, size = 24, color = "#000000", ...rest }: IconProps) {
  const LucideIcon = ICONS[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} color={String(color)} {...rest} />;
}
