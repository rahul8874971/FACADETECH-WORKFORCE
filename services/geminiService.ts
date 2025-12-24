
import { GoogleGenAI, Type } from "@google/genai";
import { AttendanceEntry, AdvanceEntry, Employee, Project } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function auditLogs(
  attendance: AttendanceEntry[],
  advances: AdvanceEntry[],
  employees: Employee[],
  projects: Project[]
) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `
      Act as a construction company auditor for FACADE TECH.
      Review these logs for duplicate entries, anomalies, or suspicious patterns.
      Duplicate entries are multiple logs for the same employee on the same date for the same project.
      Anomalies include excessive overtime (> 4 hours daily) or unusually large advances.

      Employees: ${JSON.stringify(employees)}
      Projects: ${JSON.stringify(projects)}
      Attendance: ${JSON.stringify(attendance)}
      Advances: ${JSON.stringify(advances)}
    `,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          findings: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING, description: "low, medium, high" },
                type: { type: Type.STRING, description: "Duplicate, Anomaly, or Insight" },
                description: { type: Type.STRING },
                affectedEntryIds: { 
                  type: Type.ARRAY, 
                  items: { type: Type.STRING } 
                }
              },
              required: ["severity", "type", "description"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["findings", "summary"]
      }
    }
  });

  return JSON.parse(response.text);
}
