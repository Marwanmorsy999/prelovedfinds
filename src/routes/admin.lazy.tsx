import { createLazyFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "./admin";

export const Route = createLazyFileRoute("/admin")({
  component: AdminDashboard,
});
