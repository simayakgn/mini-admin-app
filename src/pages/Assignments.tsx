// AssignmentsPage.tsx
import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { MultiSelect } from "primereact/multiselect";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Toast } from "primereact/toast";
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
  const toastRef = React.useRef<Toast>(null);

  const { data: employees } = useEmployees();
  const { data: trainings } = useTrainings();
  const { data: rawAssignments, refetch } = useAssignments();

  // Yeni atama state'leri
  const [selectedEmployee, setSelectedEmployee] =
    React.useState<Employee | null>(null);
  const [selectedTrainings, setSelectedTrainings] = React.useState<Training[]>(
    []
  );

  // Düzenleme & Silme state'leri
  const [editingAssignment, setEditingAssignment] =
    React.useState<Assignment | null>(null);
  const [showEditDialog, setShowEditDialog] = React.useState(false);

  const [deletingAssignment, setDeletingAssignment] =
    React.useState<Assignment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  // DB’den gelen raw assignmentları frontend modeline dönüştür
  const assignments: Assignment[] = React.useMemo(() => {
    if (!rawAssignments || !employees || !trainings) return [];

    return rawAssignments.map((a) => {
      const employee =
        a.employee ?? employees.find((e) => e.id === a.employeeId) ?? null;
      const training =
        a.training ?? trainings.find((t) => t.id === a.trainingId) ?? null;

      return {
        id: a.id,
        employee,
        training,
        assignedAt: a.assignedAt ?? new Date().toISOString(),
      };
    });
  }, [rawAssignments, employees, trainings]);

  // Ekleme
  const assignTrainings = async () => {
    if (!selectedEmployee || selectedTrainings.length === 0) return;

    const today = new Date().toISOString().substring(0, 10);

    for (const training of selectedTrainings) {
      await fetch("http://localhost:3001/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          trainingId: training.id,
          assignedAt: today,
        }),
      });
    }

    await refetch();
    setSelectedEmployee(null);
    setSelectedTrainings([]);
    toastRef.current?.show({
      severity: "success",
      summary: "Başarılı",
      detail: "Atama başarıyla eklendi!",
      life: 3000,
    });
  };

  // Silme
  const confirmDelete = (assignment: Assignment) => {
    setDeletingAssignment(assignment);
    setShowDeleteDialog(true);
  };

  const deleteAssignment = async () => {
    if (!deletingAssignment) return;

    await fetch(`http://localhost:3001/assignments/${deletingAssignment.id}`, {
      method: "DELETE",
    });

    setShowDeleteDialog(false);
    setDeletingAssignment(null);
    await refetch();
    toastRef.current?.show({
      severity: "warn",
      summary: "Silindi",
      detail: "Atama başarıyla silindi!",
      life: 3000,
    });
  };

  // Düzenleme
  const saveEditedAssignment = async () => {
    if (!editingAssignment?.employee || !editingAssignment?.training) return;

    await fetch(`http://localhost:3001/assignments/${editingAssignment.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: editingAssignment.employee.id,
        trainingId: editingAssignment.training.id,
        assignedAt: editingAssignment.assignedAt.substring(0, 10),
      }),
    });

    setShowEditDialog(false);
    setEditingAssignment(null);
    await refetch();
    toastRef.current?.show({
      severity: "info",
      summary: "Güncellendi",
      detail: "Atama başarıyla güncellendi!",
      life: 3000,
    });
  };

  return (
    <div className="p-4">
      <Toast ref={toastRef} />
      <h2 className="text-xl mb-4">{t("translation.assignments")}</h2>

      {/* Atama formu */}
      <div className="flex gap-2 mb-3">
        <Dropdown
          value={selectedEmployee}
          options={employees ?? []}
          onChange={(e: any) => setSelectedEmployee(e.value)}
          optionLabel="name"
          placeholder={t("translation.choosePerson")}
          style={{ marginLeft: "10px" }}
        />
        <MultiSelect
          value={selectedTrainings}
          options={trainings ?? []}
          onChange={(e: any) => setSelectedTrainings(e.value)}
          optionLabel="title"
          placeholder={t("translation.chooseTrainings")}
          style={{ marginLeft: "10px" }}
        />
        <Button
          label={t("translation.assign")}
          onClick={assignTrainings}
          style={{ marginLeft: "50px", height: "45px" }}
        />
      </div>

      {/* DataTable */}
      <DataTable value={assignments}>
        <Column field="employee.name" header={t("translation.employee")} />
        <Column field="training.title" header={t("translation.training")} />
        <Column
          field="assignedAt"
          header={t("translation.assignedAt")}
          body={(row) => row.assignedAt?.substring(0, 10)}
        />
        <Column
          header={t("translation.operations")}
          style={{ fontWeight: 800 }}
          body={(row: Assignment) => (
            <div className="flex gap-2">
              <Button
                label={t("translation.edit")}
                onClick={() => {
                  setEditingAssignment(row);
                  setShowEditDialog(true);
                }}
              />
              <Button
                label={t("translation.delete")}
                style={{ marginLeft: "25px" }}
                severity="danger"
                onClick={() => confirmDelete(row)}
              />
            </div>
          )}
        />
      </DataTable>

      {/* Düzenleme Dialogu */}
      <Dialog
        header="Atamayı Düzenle"
        visible={showEditDialog}
        style={{ width: "30vw" }}
        onHide={() => setShowEditDialog(false)}
      >
        <div className="flex flex-col gap-3">
          <Dropdown
            value={editingAssignment?.employee || null}
            options={employees ?? []}
            onChange={(e) =>
              setEditingAssignment((prev) =>
                prev ? { ...prev, employee: e.value } : null
              )
            }
            optionLabel="name"
            placeholder="Personel Seç"
          />
          <Dropdown
            value={editingAssignment?.training || null}
            options={trainings ?? []}
            onChange={(e) =>
              setEditingAssignment((prev) =>
                prev ? { ...prev, training: e.value } : null
              )
            }
            optionLabel="title"
            placeholder="Eğitim Seç"
          />
          <Button label="Kaydet" onClick={saveEditedAssignment} />
        </div>
      </Dialog>

      {/* Silme Onay Dialogu */}
      <Dialog
        header="Silme Onayı"
        visible={showDeleteDialog}
        style={{ width: "25vw" }}
        onHide={() => setShowDeleteDialog(false)}
      >
        <p>
          <strong>{deletingAssignment?.employee?.name}</strong> kaydını silmek
          istiyor musunuz?
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button
            label="İptal"
            onClick={() => setShowDeleteDialog(false)}
            className="p-button-text"
          />
          <Button label="Sil" severity="danger" onClick={deleteAssignment} />
        </div>
      </Dialog>
    </div>
  );
}
