import { useQuery } from "@tanstack/react-query";
import { getEmployees } from "../api/employees";
import type { Employee } from "../types";

type EmployeesResponse = {
  data: Employee[];
  total: number;
};

export function useEmployees(params: {
  page: number;
  limit: number;
  sort?: string;
  order?: string;
  name?: string;
  role?: string;
}) {
  return useQuery<EmployeesResponse, Error>({
    queryKey: ["employees", params],
    queryFn: () => getEmployees(params),
    //keepPreviousData: true, // TS hatası çıkarsa //@ts-expect-error kullanabilirsin
  });
}
