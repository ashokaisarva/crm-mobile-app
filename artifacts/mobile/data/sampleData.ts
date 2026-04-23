export interface Lead {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  status: "New" | "Contacted" | "Qualified" | "Lost";
  lastContact: string;
  value: number;
  notes: string;
}

export interface Deal {
  id: string;
  name: string;
  company: string;
  value: number;
  stage: "New" | "Qualified" | "Proposal" | "Won" | "Lost";
  closeDate: string;
  leadId: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: "High" | "Medium" | "Low";
  completed: boolean;
  leadName?: string;
  leadId?: string;
}

export interface Contact {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  role: string;
}

export const leads: Lead[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    company: "Tech Solutions Inc",
    phone: "+1 555-0101",
    email: "sarah@techsolutions.com",
    status: "Qualified",
    lastContact: "2026-04-15",
    value: 45000,
    notes: "Interested in enterprise package. Follow up on Q2 budget approval.",
  },
  {
    id: "2",
    name: "Michael Chen",
    company: "Bright Innovations",
    phone: "+1 555-0102",
    email: "mchen@brightinno.com",
    status: "New",
    lastContact: "2026-04-16",
    value: 12000,
    notes: "Referral from existing client. Needs demo.",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    company: "Global Ventures",
    phone: "+1 555-0103",
    email: "emily@globalventures.com",
    status: "Contacted",
    lastContact: "2026-04-10",
    value: 28000,
    notes: "Sent proposal. Waiting for decision from board.",
  },
  {
    id: "4",
    name: "David Park",
    company: "Peak Performance Co",
    phone: "+1 555-0104",
    email: "david@peakperform.com",
    status: "Lost",
    lastContact: "2026-03-28",
    value: 8500,
    notes: "Went with competitor due to pricing.",
  },
  {
    id: "5",
    name: "Lisa Thompson",
    company: "Nexus Digital",
    phone: "+1 555-0105",
    email: "lisa@nexusdigital.com",
    status: "Qualified",
    lastContact: "2026-04-17",
    value: 67000,
    notes: "Hot lead! Needs proposal by end of week.",
  },
  {
    id: "6",
    name: "James Wilson",
    company: "Apex Corp",
    phone: "+1 555-0106",
    email: "jwilson@apexcorp.com",
    status: "New",
    lastContact: "2026-04-17",
    value: 15000,
    notes: "Found us via LinkedIn.",
  },
];

export const deals: Deal[] = [
  {
    id: "1",
    name: "Tech Solutions Enterprise",
    company: "Tech Solutions Inc",
    value: 45000,
    stage: "Proposal",
    closeDate: "2026-05-15",
    leadId: "1",
  },
  {
    id: "2",
    name: "Bright Innovations Starter",
    company: "Bright Innovations",
    value: 12000,
    stage: "New",
    closeDate: "2026-06-01",
    leadId: "2",
  },
  {
    id: "3",
    name: "Global Ventures Package",
    company: "Global Ventures",
    value: 28000,
    stage: "Qualified",
    closeDate: "2026-05-30",
    leadId: "3",
  },
  {
    id: "4",
    name: "Nexus Digital Pro",
    company: "Nexus Digital",
    value: 67000,
    stage: "Qualified",
    closeDate: "2026-04-30",
    leadId: "5",
  },
  {
    id: "5",
    name: "Apex Corp Basic",
    company: "Apex Corp",
    value: 15000,
    stage: "New",
    closeDate: "2026-06-15",
    leadId: "6",
  },
  {
    id: "6",
    name: "RetailMax Suite",
    company: "RetailMax Ltd",
    value: 32000,
    stage: "Won",
    closeDate: "2026-04-01",
    leadId: "1",
  },
  {
    id: "7",
    name: "DataFlow Premium",
    company: "DataFlow Corp",
    value: 19500,
    stage: "Lost",
    closeDate: "2026-03-20",
    leadId: "4",
  },
];

export const tasks: Task[] = [
  {
    id: "1",
    title: "Send proposal to Lisa Thompson",
    description: "Prepare and send the enterprise proposal for Nexus Digital.",
    dueDate: "2026-04-18",
    priority: "High",
    completed: false,
    leadName: "Lisa Thompson",
    leadId: "5",
  },
  {
    id: "2",
    title: "Follow up with Sarah Johnson",
    description: "Check on Q2 budget approval status.",
    dueDate: "2026-04-19",
    priority: "High",
    completed: false,
    leadName: "Sarah Johnson",
    leadId: "1",
  },
  {
    id: "3",
    title: "Schedule demo with Michael Chen",
    description: "Book product demo call for Bright Innovations.",
    dueDate: "2026-04-20",
    priority: "Medium",
    completed: false,
    leadName: "Michael Chen",
    leadId: "2",
  },
  {
    id: "4",
    title: "Update CRM records",
    description: "Clean up and update all lead contact info.",
    dueDate: "2026-04-15",
    priority: "Low",
    completed: true,
  },
  {
    id: "5",
    title: "Call Emily Rodriguez",
    description: "Follow up on board decision for Global Ventures.",
    dueDate: "2026-04-16",
    priority: "High",
    completed: false,
    leadName: "Emily Rodriguez",
    leadId: "3",
  },
  {
    id: "6",
    title: "Prepare Q2 sales report",
    description: "Compile monthly metrics and pipeline overview.",
    dueDate: "2026-04-30",
    priority: "Medium",
    completed: false,
  },
];

export const contacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    company: "Tech Solutions Inc",
    phone: "+1 555-0101",
    email: "sarah@techsolutions.com",
    role: "VP of Technology",
  },
  {
    id: "2",
    name: "Michael Chen",
    company: "Bright Innovations",
    phone: "+1 555-0102",
    email: "mchen@brightinno.com",
    role: "CEO",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    company: "Global Ventures",
    phone: "+1 555-0103",
    email: "emily@globalventures.com",
    role: "Director of Operations",
  },
  {
    id: "4",
    name: "Lisa Thompson",
    company: "Nexus Digital",
    phone: "+1 555-0105",
    email: "lisa@nexusdigital.com",
    role: "CTO",
  },
];
