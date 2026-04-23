import React, { createContext, useCallback, useContext, useState } from "react";
import { leads as initialLeads, deals as initialDeals, tasks as initialTasks, Lead, Deal, Task } from "@/data/sampleData";

interface AppContextType {
  leads: Lead[];
  deals: Deal[];
  tasks: Task[];
  addLead: (lead: Omit<Lead, "id">) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  addDeal: (deal: Omit<Deal, "id">) => void;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => void;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  const addLead = useCallback((lead: Omit<Lead, "id">) => {
    const newLead = { ...lead, id: generateId() };
    setLeads(prev => [newLead, ...prev]);
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLead = useCallback((id: string) => {
    setLeads(prev => prev.filter(l => l.id !== id));
  }, []);

  const addDeal = useCallback((deal: Omit<Deal, "id">) => {
    const newDeal = { ...deal, id: generateId() };
    setDeals(prev => [newDeal, ...prev]);
  }, []);

  const updateDeal = useCallback((id: string, updates: Partial<Deal>) => {
    setDeals(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
  }, []);

  const deleteDeal = useCallback((id: string) => {
    setDeals(prev => prev.filter(d => d.id !== id));
  }, []);

  const addTask = useCallback((task: Omit<Task, "id">) => {
    const newTask = { ...task, id: generateId() };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const toggleTask = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      leads, deals, tasks,
      addLead, updateLead, deleteLead,
      addDeal, updateDeal, deleteDeal,
      addTask, updateTask, toggleTask, deleteTask,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
