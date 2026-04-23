import { LeadItem } from "@/services/api";

let _selectedLead: LeadItem | null = null;

export function setSelectedLead(lead: LeadItem) {
  _selectedLead = lead;
}

export function getSelectedLead(): LeadItem | null {
  return _selectedLead;
}
