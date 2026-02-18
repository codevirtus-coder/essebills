export type AgentCategory = {
  id: string;
  label: string;
  icon: string;
  agentRate: number;
};

export const INITIAL_CATEGORIES: AgentCategory[] = [
  { id: "util", label: "Utility Payments", icon: "bolt", agentRate: 2.5 },
  { id: "air", label: "Airtime", icon: "cell_tower", agentRate: 5.0 },
  { id: "net", label: "Internet", icon: "wifi", agentRate: 3.0 },
  { id: "fees", label: "School Fees", icon: "school", agentRate: 2.0 },
];

