import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const BASE_URL = "https://crm-demo.isarva.in/api/mobile";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    crm_role_type: number;
    status: number;
  };
}

export async function loginApi(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>("/login", {
    email,
    password,
  });
  return data;
}

export interface HighPriorityDeal {
  title: string;
  amount: number;
  organization: string;
  contact_person: string;
  stage: string;
}

export interface HighPriorityTask {
  title: string;
  lead_name?: string;
  due_date?: string;
  priority?: string;
}

export interface DashboardResponse {
  total_deals_value: string;
  active_deals_count: number;
  today_leads_count: number;
  high_leads_count: number;
  open_deals_count: number;
  pending_tasks_count: number;
  high_priority_deals: HighPriorityDeal[];
  high_priority_tasks: HighPriorityTask[];
}

export async function getDashboard(): Promise<DashboardResponse> {
  const { data } = await apiClient.get<DashboardResponse>("/dashboard");
  return data;
}

export interface LeadItem {
  id: number;
  title: string;
  company: string | null;
  customer_name: string | null;
  person_name: string | null;
  amount: number | null;
  status: string;
  label: "low" | "normal" | "high" | null;
  expected_close: string | null;
  description: string | null;
  lead_source: string | null;
  owner: string | null;
  assigned_name: string | null;
  created_at: string;
  phone: string | null;
  email: string | null;
}

export interface LeadsResponse {
  success: boolean;
  leads: {
    current_page: number;
    last_page: number;
    total: number;
    data: LeadItem[];
  };
}

export interface LeadsFilters {
  title?: string;
  status?: string;
  priority?: string;
  from_date?: string;
  to_date?: string;
  page?: number;
}

export async function getLeads(filters: LeadsFilters = {}): Promise<LeadsResponse> {
  const params: Record<string, string> = {
    title: filters.title ?? "",
    category: "",
    lead_source: "",
    status: filters.status ?? "",
    priority: filters.priority ?? "",
    owner: "",
    from_date: filters.from_date ?? "",
    to_date: filters.to_date ?? "",
    view: "",
    page: String(filters.page ?? 1),
  };
  const { data } = await apiClient.get<LeadsResponse>("/leads", { params });
  return data;
}
