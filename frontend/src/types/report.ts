import { Domain } from "./domain";

export interface Report {
  id: string;
  studentId: string;
  domains: Domain[];
  rate: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
