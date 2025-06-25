import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "#frontend/features/landing-page/components/landing-page";

export const Route = createFileRoute("/landing")({
  component: LandingPage,
});
