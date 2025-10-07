import { getDashboardKPI, getRecentActivities } from "@/app/actions/dashboard";
import { DashboardClient } from "./DashboardClient";
import { redirect } from "next/navigation";
import { getCurrentUserId } from "@/auth";

/**
 * ダッシュボードページ
 */
export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!userId) {
    redirect("/login");
  }

  const kpiResult = await getDashboardKPI();
  const activitiesResult = await getRecentActivities();

  if (!kpiResult.success || !activitiesResult.success) {
    return (
      <div className="text-red-600">
        エラー: {kpiResult.error || activitiesResult.error || "データの取得に失敗しました"}
      </div>
    );
  }

  return <DashboardClient kpi={kpiResult.data!} activities={activitiesResult.data!} />;
}
