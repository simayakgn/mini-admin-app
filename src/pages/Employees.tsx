// EmployeesPage.tsx
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
import { fi } from "@faker-js/faker";

// Types
type Employee = {
  id: string; // <-- artık string
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt?: string;
};

type UseEmployeesParams = {
  page: number;
  limit: number;
  sort?: string;
  order?: string;
  name?: string;
  role?: string;
};

// debounce helper
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Hook – server-side filtreleme
export function useEmployees(params: UseEmployeesParams) {
  const qp = new URLSearchParams();
  if (params.name && params.name.trim())
    qp.append("name_like", params.name.trim());
  if (params.role) {
    qp.append("role", params.role);
  }
  if (params.sort) qp.append("_sort", params.sort);
  if (params.order) qp.append("_order", params.order);
  const queryString = qp.toString();

  return useQuery<Employee[], Error>({
    queryKey: ["employees", { ...params, queryString }],
    queryFn: async () => {
      const base = "http://localhost:3001/employees";
      const url = queryString ? `${base}?${queryString}` : base;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch employees");
      const data = (await res.json()) as Employee[];
      // server sort yoksa id desc
      if (!params.sort) return data.sort((a, b) => Number(b.id) - Number(a.id));
      return data;
    },
    placeholderData: [],
  });
}

// id üretici → string döner
function getNextEmployeeId(employees: Employee[]): string {
  const ids = employees.map((e) => Number(e.id)).sort((a, b) => a - b);
  for (let i = 1; i <= ids.length + 1; i++) {
    if (!ids.includes(i)) return String(i);
  }
  return String(ids.length + 1);
}

// Component
export default function EmployeesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || 1);
  const limit = Number(searchParams.get("limit") || 10);
  const sort = searchParams.get("sort") || undefined;
  const order = searchParams.get("order") || undefined;
  const nameParam = searchParams.get("name") || "";
  const roleParam = searchParams.get("role") || "";

  const [nameFilter, setNameFilter] = React.useState(nameParam);
  const [roleFilter, setRoleFilter] = React.useState(roleParam);
  const debouncedName = useDebounce(nameFilter, 300);

  const toastRef = React.useRef<Toast>(null);
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const { data, isLoading } = useEmployees({
    page,
    limit,
    sort,
    order,
    name: debouncedName,
    role: roleFilter,
  });

  // Add/Edit dialog state
  const [showDialog, setShowDialog] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(
    null
  );
  const [newEmployee, setNewEmployee] = React.useState<Employee>({
    id: "",
    name: "",
    email: "",
    role: "",
    status: "",
  });

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deletingEmployee, setDeletingEmployee] =
    React.useState<Employee | null>(null);

  // filtreler değişince URL’i güncelle
  React.useEffect(() => {
    setSearchParams({
      page: String(page),
      limit: String(limit),
      sort: sort || "",
      order: order || "",
      name: debouncedName,
      role: roleFilter,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName, roleFilter]);

  // Save (add or edit)
  const saveEmployee = async () => {
    try {
      if (editingEmployee) {
        // UPDATE
        await fetch(`http://localhost:3001/employees/${editingEmployee.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editingEmployee),
        });
        toastRef.current?.show({
          severity: "info",
          summary: t("translation.updated"),
          detail: t("translation.employeeUpdated", {
            name: editingEmployee.name,
          }),
          life: 3000,
        });
      } else {
        // CREATE
        const res = await fetch("http://localhost:3001/employees");
        const existing: Employee[] = await res.json();
        const newId = getNextEmployeeId(existing);

        await fetch("http://localhost:3001/employees", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: newId, // <-- string tipinde
            name: newEmployee.name,
            email: newEmployee.email,
            role: newEmployee.role,
            status: newEmployee.status,
            createdAt: new Date().toISOString().substring(0, 10),
          }),
        });

        toastRef.current?.show({
          severity: "success",
          summary: t("translation.saved"),
          detail: t("translation.employeeSaved", { name: newEmployee.name }),
          life: 3000,
        });
      }

      setShowDialog(false);
      setNewEmployee({ id: "", name: "", email: "", role: "", status: "" });
      setEditingEmployee(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch {
      toastRef.current?.show({
        severity: "error",
        summary: t("translation.error"),
        detail: t("translation.error"),
        life: 3000,
      });
    }
  };

  // Delete
  const deleteEmployee = async () => {
    if (!deletingEmployee) return;
    try {
      await fetch(`http://localhost:3001/employees/${deletingEmployee.id}`, {
        method: "DELETE",
      });
      setShowDeleteDialog(false);
      setDeletingEmployee(null);
      queryClient.invalidateQueries({ queryKey: ["employees"] });

      toastRef.current?.show({
        severity: "warn",
        summary: t("translation.deleted"),
        detail: t("translation.employeeDeleted", {
          name: deletingEmployee?.name,
        }),
        life: 3000,
      });
    } catch {
      toastRef.current?.show({
        severity: "warn",
        summary: t("translation.deleted"),
        detail: t("translation.employeeDeleted", {
          name: deletingEmployee.name,
        }),
        life: 3000,
      });
    }
  };

  // paging/sorting
  const onTableChange = (e: DataTableStateEvent) => {
    const params: Record<string, string> = {
      page: String((e.first ?? 0) / (e.rows ?? limit) + 1),
      limit: String(e.rows ?? limit),
      name: debouncedName,
      role: roleFilter,
    };
    if (e.sortField) params.sort = e.sortField;
    if (e.sortOrder === 1) params.order = "asc";
    else if (e.sortOrder === -1) params.order = "desc";
    setSearchParams(params);
  };
  // EmployeesPage.tsx içinde, render öncesinde:
  const filtered = (data ?? []).filter((e) =>
    debouncedName
      ? e.name.toLowerCase().startsWith(debouncedName.toLowerCase())
      : true
  );

  return (
    <div className="p-4">
      <Toast ref={toastRef} />
      <h2 className="text-xl mb-4">{t("translation.employees")}</h2>

      {/* Filters */}
      <div>
        <span className="p-input-icon-left w-48">
          <i className="pi pi-search" style={{ marginLeft: "16px" }} />
          <InputText
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder={t("translation.searchByName")}
            style={{ marginLeft: "10px", paddingLeft: "2rem", height: "45px" }}
          />
        </span>

        <Dropdown
          value={roleFilter}
          options={[
            { label: t("translation.all"), value: "null" },
            { label: t("translation.admin"), value: "admin" },
            { label: t("translation.engineer"), value: "engineer" },
            { label: t("translation.manager"), value: "manager" },
          ]}
          onChange={(e) => setRoleFilter(e.value)}
          placeholder={t("translation.filterByRole")}
          style={{ marginLeft: "10px" }}
        />

        <Button
          label={t("translation.addEmployee")}
          icon="pi pi-plus"
          onClick={() => {
            setEditingEmployee(null);
            setNewEmployee({
              id: "",
              name: "",
              email: "",
              role: "",
              status: "",
            });
            setShowDialog(true);
          }}
          style={{ height: "45px", marginLeft: "50px" }}
        />
      </div>

      {/* Table */}
      <DataTable
        value={filtered.slice((page - 1) * limit, page * limit)}
        paginator
        rows={limit}
        totalRecords={filtered.length}
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
        <Column
          field="role"
          header={t("translation.role")}
          body={(row) => t(`translation.${row.role.toLowerCase()}`)}
        />
        <Column
          field="status"
          header={t("translation.status")}
          body={(row) =>
            row.status === "active"
              ? t("translation.active")
              : t("translation.inactive")
          }
        />

        <Column
          field="createdAt"
          header={t("translation.createdAt")}
          body={(row) => row.createdAt?.substring(0, 10)}
        />

        <Column
          header={t("translation.actions")}
          body={(row: Employee) => (
            <div className="flex gap-2">
              <Button
                label={t("translation.edit")}
                onClick={() => {
                  setEditingEmployee(row);
                  setShowDialog(true);
                }}
              />
              <Button
                label={t("translation.delete")}
                style={{ marginLeft: "25px" }}
                severity="danger"
                onClick={() => {
                  setDeletingEmployee(row);
                  setShowDeleteDialog(true);
                }}
              />
            </div>
          )}
        />
      </DataTable>

      {/* Add/Edit Dialog */}
      <Dialog
        header={
          editingEmployee
            ? t("translation.editEmployee")
            : t("translation.addEmployee")
        }
        visible={showDialog}
        style={{ width: "30vw" }}
        onHide={() => setShowDialog(false)}
      >
        <div className="flex flex-col gap-3">
          <InputText
            value={editingEmployee ? editingEmployee.name : newEmployee.name}
            onChange={(e) =>
              editingEmployee
                ? setEditingEmployee({
                    ...editingEmployee,
                    name: e.target.value,
                  })
                : setNewEmployee({ ...newEmployee, name: e.target.value })
            }
            placeholder={t("translation.name")}
          />
          <InputText
            value={editingEmployee ? editingEmployee.email : newEmployee.email}
            onChange={(e) =>
              editingEmployee
                ? setEditingEmployee({
                    ...editingEmployee,
                    email: e.target.value,
                  })
                : setNewEmployee({ ...newEmployee, email: e.target.value })
            }
            placeholder={t("translation.email")}
          />
          <InputText
            value={editingEmployee ? editingEmployee.role : newEmployee.role}
            onChange={(e) =>
              editingEmployee
                ? setEditingEmployee({
                    ...editingEmployee,
                    role: e.target.value,
                  })
                : setNewEmployee({ ...newEmployee, role: e.target.value })
            }
            placeholder={t("translation.role")}
          />
          <InputText
            value={
              editingEmployee ? editingEmployee.status : newEmployee.status
            }
            onChange={(e) =>
              editingEmployee
                ? setEditingEmployee({
                    ...editingEmployee,
                    status: e.target.value,
                  })
                : setNewEmployee({ ...newEmployee, status: e.target.value })
            }
            placeholder={t("translation.status")}
          />
          <Button label={t("translation.save")} onClick={saveEmployee} />
        </div>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        header={t("translation.confirmDelete")}
        visible={showDeleteDialog}
        style={{ width: "25vw" }}
        onHide={() => setShowDeleteDialog(false)}
      >
        <p>
          {t("translation.confirmDeleteMessage", {
            name: deletingEmployee?.name,
          })}
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            label={t("translation.cancel")}
            onClick={() => setShowDeleteDialog(false)}
            className="p-button-text"
          />
          <Button
            label={t("translation.delete")}
            severity="danger"
            onClick={deleteEmployee}
          />
        </div>
      </Dialog>
    </div>
  );
}
