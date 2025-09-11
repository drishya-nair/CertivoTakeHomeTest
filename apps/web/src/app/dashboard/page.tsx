// Redirect duplicate dashboard route to home to avoid duplicate code
import { redirect } from "next/navigation";

export default function Dashboard() {
  redirect("/");
}
