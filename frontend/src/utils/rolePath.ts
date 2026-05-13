import type { FileRouteTypes } from "@/routeTree.gen";

export function rolePath(role: string): FileRouteTypes["to"] {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "professeur":
      return "/professor/dashboard";
    case "etudiant":
      return "/student/dashboard";
    default:
      return "/login";
  }
}
