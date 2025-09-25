export type Role = "admin" | "engineer" | "manager";
export type Status = "active" | "inactive";

export interface Employee {
  id: number;
  name: string;
  email: string;
  role: Role;
  status: Status;
  createdAt: string;
}

export interface Training {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

export interface Assignment {
  id: number;
  employeeId: number;
  trainingId: number;
}
