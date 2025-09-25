// AssignmentsPage.tsx
import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Types
type Employee = { id: number; name: string };
type Training = { id: number; title: string };
type Assignment = {
  id: string;
  employee: Employee | null;
  training: Training | null;
  assignedAt: string;
};

// Hooks
function useEmployees() {
  return useQuery<Employee[], Error>({
    queryKey: ["employees"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/employees");
      if (!res.ok) throw new Error("Failed to fetch employees");
      return (await res.json()) as Employee[];
    },
  });
}
function useTrainings() {
  return useQuery<Training[], Error>({
    queryKey: ["trainings"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/trainings");
      if (!res.ok) throw new Error("Failed to fetch trainings");
      return (await res.json()) as Training[];
    },
  });
}
function useAssignments() {
  return useQuery<any[], Error>({
    queryKey: ["assignments"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/assignments");
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return (await res.json()) as any[];
    },
  });
}

// Component
export default function AssignmentsPage() {
  const { t } = useTranslation();

  const { data: employees } = useEmployees();
  const { data: trainings } = useTrainings();
  const { data: rawAssignments, refetch } = useAssignments();

  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [selectedTrainings, setSelectedTrainings] = React.useState<Training[]>(
    []
  );

  // DB’den gelen raw assignmentları frontend modeline dönüştür
  const assignments: Assignment[] = React.useMemo(() => {
    if (!rawAssignments || !employees || !trainings) return [];

    return rawAssignments.map((a) => {
      const employee = employees.find((e) => e.id === a.employeeId) ?? null;
      const training = trainings.find((t) => t.id === a.trainingId) ?? null;

      return {
        id: a.id,
        employee,
        training,
        assignedAt: a.assignedAt ?? new Date().toISOString(),
      };
    });
  }, [rawAssignments, employees, trainings]);

  const assignTrainings = async () => {
    if (!selectedEmployee || selectedTrainings.length === 0) return;

    // ✅ Bugünün tarihini ISO değil yyyy-MM-dd formatında al
    const today = new Date().toISOString().substring(0, 10);

    for (const training of selectedTrainings) {
      await fetch("http://localhost:3001/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          trainingId: training.id,
          assignedAt: today, // ✅ sadece tarih kaydediliyor
        }),
      });
    }

    await refetch();
    setSelectedEmployee(null);
    setSelectedTrainings([]);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">{t("translation.assignments")}</h2>

      <div className="flex gap-2 mb-3">
        <Dropdown
          value={selectedEmployee}
          options={employees ?? []}
          onChange={(e: any) => setSelectedEmployee(e.value)}
          optionLabel="name"
          placeholder={t("translation.choosePerson")}
        />
        <MultiSelect
          value={selectedTrainings}
          options={trainings ?? []}
          onChange={(e: any) => setSelectedTrainings(e.value)}
          optionLabel="title"
          placeholder={t("translation.chooseTrainings")}
        />
        <Button label={t("translation.assign")} onClick={assignTrainings} />
      </div>

      <DataTable value={assignments}>
        <Column field="employee.name" header={t("translation.employee")} />
        <Column field="training.title" header={t("translation.training")} />
        <Column
          field="assignedAt"
          header={t("translation.assignedAt")}
          body={(row) => row.assignedAt?.substring(0, 10)}
        />
      </DataTable>
    </div>
  );
}
