import { RedirectHome } from "@/components/RedirectHome";

export function generateStaticParams() {
  return [{ user: "erik" }, { user: "benno" }];
}

export default function UserPage() {
  return <RedirectHome />;
}
