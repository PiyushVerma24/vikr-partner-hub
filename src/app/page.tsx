import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0C10] text-[#E0E2E6] p-4 relative overflow-hidden">
      {/* Subtle background glow effect simulating the reference image */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0ABFBC]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center space-y-8 max-w-2xl z-10">
        <div className="mx-auto w-fit px-3 py-1 border border-[#1E2330] bg-[#131720]/80 backdrop-blur-sm rounded-full flex items-center gap-2 mb-8">
          <ShieldCheck className="w-4 h-4 text-[#0ABFBC]" />
          <span className="text-xs font-semibold tracking-wider text-[#0ABFBC] uppercase">Secure Partner Network</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
          Your Exclusive <br className="hidden sm:block" />
          <span className="text-[#0ABFBC]">Distributor Hub</span>
        </h1>

        <p className="text-lg md:text-xl text-[#8F9BB3] max-w-xl mx-auto font-medium">
          Instant access to certified technical specifications, compliance documentation, and advanced training resources.
        </p>

        <div className="flex justify-center pt-4">
          <Link href="/login">
            <Button
              size="lg"
              className="gap-2 bg-[#0ABFBC] hover:bg-[#09aba8] text-[#052b2a] font-bold text-base px-8 py-6 rounded-lg shadow-[0_0_20px_rgba(10,191,188,0.25)] hover:shadow-[0_0_30px_rgba(10,191,188,0.4)] transition-all border border-[#0ABFBC]/50"
            >
              ACCESS PORTAL <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>

      <div className="absolute bottom-8 text-center text-xs text-[#4E5666] font-medium tracking-wide z-10 w-full flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6">
        <p>RESTRICTED: AUTHORIZED PERSONNEL ONLY</p>
        <span className="hidden sm:block">•</span>
        <p>© {new Date().getFullYear()} VIKR BIOSCIENCE</p>
      </div>
    </div>
  )
}
