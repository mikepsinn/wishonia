import { Metadata } from "next"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { getCurrentUser } from "@/lib/session"
import { Shell } from "@/components/layout/shell"
import { DashboardHeader } from "@/components/pages/dashboard/dashboard-header"
import { AppearanceForm } from "@/components/settings/appearance-form"
import { UserNameForm } from "@/components/user/user-name-form"
import {DFDATokenForm} from "@/components/settings/dfda-access-token-form";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account and settings.",
}

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect(authOptions?.pages?.signIn || "/signin")
  }

  return (
    <Shell>
      <DashboardHeader
        heading="Settings"
        text="Manage account and app settings."
      />
      <div className="grid grid-cols-1 gap-6">
        <UserNameForm user={{ id: user.id, username: user.username || "" }} />
          <DFDATokenForm userId={user.id} />
          {/*<DFDAEmailForm />*/}
        <AppearanceForm />
      </div>
    </Shell>
  )
}
