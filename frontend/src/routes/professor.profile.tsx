import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/dashboard/ProfilePage";
export const Route = createFileRoute("/professor/profile")({ component: ProfilePage });
