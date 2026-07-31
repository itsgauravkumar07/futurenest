import PlanForm from "@/components/dashboard/PlanForm";

export default function NewPlanPage() {
  return (
    <div>
      <h1 className="text-2xl">New Plan</h1>
      <PlanForm mode="create" />
    </div>
  );
}
