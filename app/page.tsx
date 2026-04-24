import { Header } from "@/components/dashboard/header"
import { FastingTracker } from "@/components/dashboard/fasting-tracker"
import { SupplementStack } from "@/components/dashboard/supplement-stack"
import { FinancialProgress } from "@/components/dashboard/financial-progress"
import { ResumeCard } from "@/components/dashboard/resume-card"

const noonStack = [
  { name: "Vitamin C" },
  { name: "Vitamin B" },
  { name: "Fish Oil" },
]

const nightStack = [
  { name: "Magnesium L-Threonate", dosage: "2 Capsules" },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
        <Header />
        
        <main className="space-y-6">
          {/* Mobile: Single column, Desktop: Grid layout */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Fasting Tracker - Takes full width on mobile, 1 column on tablet, spans 1 on desktop */}
            <div className="md:col-span-1">
              <FastingTracker />
            </div>
            
            {/* Supplement Stacks */}
            <div className="space-y-6 md:col-span-1">
              <SupplementStack
                title="Noon Stack"
                icon="noon"
                items={noonStack}
                triggerTime="12:00 PM"
              />
              <SupplementStack
                title="Night Stack"
                icon="night"
                items={nightStack}
                triggerTime="12:30 AM"
              />
            </div>
            
            {/* Financial Progress & Resume */}
            <div className="space-y-6 md:col-span-2 lg:col-span-1">
              <FinancialProgress />
              <ResumeCard />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
