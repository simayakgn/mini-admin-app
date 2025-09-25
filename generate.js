import { writeFileSync } from "node:fs";
import { faker } from "@faker-js/faker";

// ----- Employees -----
const employees = Array.from({ length: 100 }).map((_, i) => ({
  id: i + 1,
  name: faker.person.fullName(),
  email: faker.internet.email(),
  role: faker.helpers.arrayElement(["admin", "engineer", "manager"]),
  status: faker.helpers.arrayElement(["active", "inactive"]),
  createdAt: faker.date
    .between({ from: "2025-01-01", to: "2025-09-22" })
    .toISOString()
    .split("T")[0],
}));

// ----- Trainings -----
const trainings = [
  {
    id: 101,
    title: "TypeScript 101",
    startDate: "2025-09-20",
    endDate: "2025-09-20",
    active: true,
  },
  {
    id: 102,
    title: "PrimeReact Başlangıç",
    startDate: "2025-09-22",
    endDate: "2025-09-22",
    active: true,
  },
  {
    id: 103,
    title: "React Advanced",
    startDate: "2025-09-25",
    endDate: "2025-09-25",
    active: true,
  },
  {
    id: 104,
    title: "Node.js Temelleri",
    startDate: "2025-09-27",
    endDate: "2025-09-27",
    active: true,
  },
];

// ----- Assignments -----
const assignments = [];

// Her çalışanı random 1 veya 2 training’e atayalım
employees.forEach((emp) => {
  const randomTrainings = faker.helpers.arrayElements(
    trainings,
    faker.number.int({ min: 1, max: 2 })
  );
  randomTrainings.forEach((t) => {
    assignments.push({
      id: assignments.length + 1001,
      employeeId: emp.id,
      trainingId: t.id,
    });
  });
});

// ----- DB JSON -----
const db = { employees, trainings, assignments };

// Dosyaya yaz
writeFileSync("db.json", JSON.stringify(db, null, 2));

console.log("db.json başarıyla oluşturuldu!");
