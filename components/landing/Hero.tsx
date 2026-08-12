import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32 sm:pt-32 sm:pb-48">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full border border-slate-200">
          <Zap size={16} className="text-slate-600" />
          <span className="text-sm font-medium text-slate-600">
            Graph-powered career insights
          </span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6">
          See where your skills can take you.
        </h1>

        {/* Subheading */}
        <p className="text-xl sm:text-2xl text-slate-600 max-w-2xl mx-auto mb-12">
          Explore the connections between skills, technologies, roles and companies through a
          living career graph.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/roles"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition-all hover:shadow-lg"
          >
            Explore Career Paths
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/explore"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-900 text-slate-900 font-semibold rounded-lg hover:bg-slate-50 transition-all"
          >
            Explore the Graph
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
