import { Report } from "@/types/report";
import MOCK_DOMAINS from "./domain";

const MOCK_REPORT: Report = {
  id: "report1",
  studentId: "student1",
  domains: [MOCK_DOMAINS[0]],
  rate: 80,
  notes: "Student has shown significant improvement in communication skills.",
  createdAt: new Date("2024-01-15T10:00:00Z"),
  updatedAt: new Date("2024-02-20T15:30:00Z"),
};

const MOCK_REPORTS: Report[] = Array(10)
  .fill(MOCK_REPORT)
  .map((report, index) => ({
    ...report,
    id: `report${index + 1}`,
    studentId: `student${index + 1}`,
  }));

export default MOCK_REPORTS;
