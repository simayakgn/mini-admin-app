import React from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable, type DataTableStateEvent } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Toast } from "primereact/toast";

// Types
type Employee = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
};

//type EmployeesResponse = Employee[];

type UseEmployeesParams = {
  page: number;
  limit: number;
  sort?: string;
  order?: string;
  name?: string;
  role?: string;
};

// Hook
export function useEmployees(params: UseEmployeesParams) {
  const queryParams = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v ?? "")])
  ).toString();

  return useQuery<Employee[], Error>({
    queryKey: ["employees", params],
    queryFn: async (): Promise<Employee[]> => {
      const res = await fetch(`http://localhost:3001/employees?${queryParams}`);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data: Employee[] = await res.json();

      // ✅ id number olduğu için doğrudan id’ye göre sırala
      return data.sort((a, b) => b.id - a.id);
    },
    placeholderData: [], // ✅ v5’te doğru kullanım
  });
}
// utils-like fonksiyon
function getNextEmployeeId(employees: Employee[]): number {
  const ids = employees.map((e) => Number(e.id)).sort((a, b) => a - b);

  for (let i = 1; i <= ids.length + 1; i++) {
    if (!ids.includes(i)) return i;
  }
  return ids.length + 1;
}

// Component
export default function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const sort = searchParams.get("sort") || undefined;
  const order = searchParams.get("order") || undefined;
  const name = searchParams.get("name") || "";
  const role = searchParams.get("role") || "";
  const [nameFilter, setNameFilter] = React.useState(name);
  const [roleFilter, setRoleFilter] = React.useState(role);
  const toastRef = React.useRef<Toast>(null);

  const queryClient = useQueryClient();
  const { data, isLoading } = useEmployees({
    page,
    limit,
    sort,
    order,
    name,
    role,
  });

  const { t } = useTranslation();

  // --- Add Employee Dialog ---
  const [showDialog, setShowDialog] = React.useState(false);
  const [newEmployee, setNewEmployee] = React.useState<Employee>({
    id: 0,
    name: "",
    email: "",
    role: "",
    status: "",
  });
  const saveEmployee = async () => {
    try {
      // Mevcut çalışanları al
      const res = await fetch("http://localhost:3001/employees");
      const existingEmployees: Employee[] = await res.json();

      // Yeni id üret
      const newId = getNextEmployeeId(existingEmployees);

      await fetch("http://localhost:3001/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newId, // artık sıralı id
          name: newEmployee.name,
          email: newEmployee.email,
          role: newEmployee.role,
          status: newEmployee.status,
          createdAt: new Date().toISOString().substring(0, 10), // sadece yyyy-MM-dd
        }),
      });

      setShowDialog(false);
      setNewEmployee({ id: 0, name: "", email: "", role: "", status: "" });
      queryClient.invalidateQueries({ queryKey: ["employees"] });

      toastRef.current?.show({
        severity: "success",
        summary: "Başarılı",
        detail: "Çalışan kaydedildi!",
        life: 3000,
      });
    } catch (error) {
      toastRef.current?.show({
        severity: "error",
        summary: "Hata",
        detail: "Çalışan kaydedilemedi!",
        life: 3000,
      });
    }
  };

  const onTableChange = (e: DataTableStateEvent) => {
    const params: Record<string, string> = {
      page: String((e.first ?? 0) / (e.rows ?? limit) + 1),
      limit: String(e.rows ?? limit),
      name,
      role,
    };
    if (e.sortField) params.sort = e.sortField;
    if (e.sortOrder === 1) params.order = "asc";
    else if (e.sortOrder === -1) params.order = "desc";

    setSearchParams(params);
  };

  return (
    <div className="p-4">
      <Toast ref={toastRef} />
      <h2 className="text-xl mb-4">{t("translation.employees")}</h2>

      {/* Filters */}
      <div className="">
        <span className="p-input-icon-left w-48">
          <i className="pi pi-search" style={{ marginLeft: "16px" }} />
          <InputText
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder={t("translation.searchByName")}
            className="h-20"
            style={{ marginLeft: "10px", paddingLeft: "2rem", height: "40px" }}
          />
        </span>
        <Dropdown
          value={roleFilter}
          options={[
            { label: t("translation.all"), value: "" },
            { label: t("translation.admin"), value: "admin" },
            { label: t("translation.engineer"), value: "engineer" },
            { label: t("translation.manager"), value: "manager" },
          ]}
          onChange={(e) => setRoleFilter(e.value || "")}
          placeholder={t("translation.filterByRole")}
          style={{ marginLeft: "10px" }}
        />
        <Button
          label={t("translation.addEmployee")}
          icon="pi pi-plus"
          onClick={() => setShowDialog(true)}
          style={{ height: "45px", marginLeft: "50px" }}
        />
      </div>

      {/* Table */}
      <DataTable
        value={(data ?? []).slice((page - 1) * limit, page * limit)}
        paginator
        rows={limit}
        totalRecords={data?.length ?? 0}
        lazy
        first={(page - 1) * limit}
        loading={isLoading}
        onPage={onTableChange}
        onSort={onTableChange}
        pageLinkSize={3}
      >
        <Column field="id" header={t("ID")} sortable />
        <Column field="name" header={t("translation.name")} sortable />
        <Column field="email" header={t("translation.email")} />
        <Column field="role" header={t("translation.role")} sortable />
        <Column field="status" header={t("translation.status")} sortable />
        <Column
          field="createdAt"
          header="Oluşturulma Tarihi"
          body={(row) => row.createdAt?.substring(0, 10)}
        />
      </DataTable>

      {/* Dialog */}
      <Dialog
        header={t("translation.addEmployee")}
        visible={showDialog}
        style={{ width: "30vw" }}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-col gap-3">
          <InputText
            value={newEmployee.name}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, name: e.target.value })
            }
            placeholder={t("translation.name")}
          />
          <InputText
            value={newEmployee.email}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, email: e.target.value })
            }
            placeholder={t("translation.email")}
          />
          <InputText
            value={newEmployee.role}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, role: e.target.value })
            }
            placeholder={t("translation.role")}
          />
          <InputText
            value={newEmployee.status}
            onChange={(e) =>
              setNewEmployee({ ...newEmployee, status: e.target.value })
            }
            placeholder={t("translation.status")}
          />
          <Button label={t("translation.save")} onClick={saveEmployee} />
        </div>
      </Dialog>
    </div>
  );
}
