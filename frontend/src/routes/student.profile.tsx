import { createFileRoute } from "@tanstack/react-router";
import { ProfilePage } from "@/components/dashboard/ProfilePage";
export const Route = createFileRoute("/student/profile")({ component: ProfilePage });
