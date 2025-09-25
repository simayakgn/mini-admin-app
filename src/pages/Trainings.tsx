// TrainingsPage.tsx
import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import type { DropdownChangeEvent } from "primereact/dropdown";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

// Types
type Training = {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  active: boolean;
};

// Hook
function useTrainings() {
  return useQuery<Training[], Error>({
    queryKey: ["trainings"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3001/trainings");
      if (!res.ok) throw new Error("Failed to fetch trainings");
      const data = await res.json();
      return data as Training[];
    },
  });
}

// Component
export default function TrainingsPage() {
  const { t } = useTranslation();

  const { data, isLoading } = useTrainings();

  const [titleFilter, setTitleFilter] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "" | "active" | "passive"
  >("");

  // Filtered data
  const filteredData: Training[] | undefined = data?.filter((t) => {
    const matchesTitle = t.title
      ?.toLowerCase()
      .includes(titleFilter.toLowerCase());

    let matchesStatus = true;
    if (statusFilter === "active") matchesStatus = t.active === true;
    else if (statusFilter === "passive") matchesStatus = t.active === false;

    return matchesTitle && matchesStatus;
  });

  return (
    <div className="p-4">
      <h2 className="text-xl mb-4">{t("translation.trainings")}</h2>
      <div className="flex gap-2 mb-3">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={titleFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setTitleFilter(e.target.value)
            }
            placeholder={t("translation.searchByTitle")}
          />
        </span>
        <Dropdown
          value={statusFilter}
          options={[
            { label: t("All"), value: "" },
            { label: t("Active"), value: "active" },
            { label: t("Passive"), value: "passive" },
          ]}
          onChange={(e: DropdownChangeEvent) => {
            // debugger;
            setStatusFilter(e.value ?? "");
          }}
          placeholder={t("translation.chooseState")}
        />
      </div>
      <DataTable value={filteredData ?? []} loading={isLoading}>
        <Column field="id" header={t("ID")} />
        <Column field="title" header={t("translation.title")} />
        <Column field="startDate" header={t("translation.startDate")} />
        <Column field="endDate" header={t("translation.endDate")} />
        <Column
          field="active"
          header={t("translation.status")}
          body={(row: Training) =>
            row.active ? (
              <span className="text-green-600">{t("Active")} </span>
            ) : (
              <span className="text-red-600">{t("Passive")} </span>
            )
          }
        />
      </DataTable>
    </div>
  );
}
