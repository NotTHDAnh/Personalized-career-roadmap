import React, { useState, useRef, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from "recharts";

import {
  GraduationCap, BookOpen, Map, MessageCircle, LogOut, Send,
  AlertTriangle, Plus, Trash2, ChevronDown, ArrowRight,
  CheckCircle2, Clock, Circle, Eye, EyeOff, Bot,
  Users, UploadCloud, Check, X, Bell, TrendingUp, Award,
  FileText, ChevronRight, User, Settings, Star
} from "lucide-react";
import { ROADMAPS, MARKET_DATA } from "../../data/mockData";
import { StatusIcon } from "../../components/common/StatusIcon";

export function RoadmapTab() {
  const [career, setCareer] = useState("Frontend Developer");
  const [careerOpen, setCareerOpen] = useState(false);
  const careers = Object.keys(ROADMAPS);
  const phases = ROADMAPS[career];

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base tracking-tight" style={{ color: "#1B365D" }}>
            Career Roadmap
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select a target career to visualize your learning path
          </p>
        </div>
        <div className="relative">
          <button
            onClick={() => setCareerOpen(!careerOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:border-teal-300 transition-all shadow-sm"
          >
            <Award size={15} style={{ color: "#0D9488" }} />
            {career}
            <ChevronDown
              size={14}
              className={`text-slate-400 transition-transform ${careerOpen ? "rotate-180" : ""}`}
            />
          </button>
          {careerOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-xl z-30 overflow-hidden">
              {careers.map((c) => (
                <button
                  key={c}
                  onClick={() => { setCareer(c); setCareerOpen(false); }}
                  className={`w-full text-left px-4 py-3 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 ${
                    c === career ? "text-teal-600 bg-teal-50" : "text-slate-700"
                  }`}
                >
                  {c === career && <Check size={12} />}
                  {c !== career && <div className="w-3" />}
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skill tree */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-x-auto">
        <div className="flex gap-3 min-w-max items-start">
          {phases.map((phase, pi) => (
            <div key={pi} className="flex items-start gap-3">
              {/* Phase column */}
              <div
                className={`rounded-2xl border p-4 w-52 space-y-3 ${phase.colorClass}`}
              >
                <div
                  className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-lg inline-block ${phase.headerColor}`}
                >
                  {phase.phase}
                </div>
                {phase.nodes.map((node) => (
                  <div
                    key={node.code}
                    className="bg-white rounded-xl border border-slate-100 p-3 shadow-sm space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <StatusIcon status={node.status} />
                      <span
                        className="text-[10px] font-bold"
                        style={{
                          color: "#1B365D",
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        {node.code}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 leading-tight">
                      {node.name}
                    </p>
                    <span
                      className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: "rgba(13,148,136,0.08)",
                        color: "#0D9488",
                      }}
                    >
                      {node.skill}
                    </span>
                  </div>
                ))}
              </div>
              {/* Arrow between phases */}
              {pi < phases.length - 1 && (
                <div className="flex items-center mt-12">
                  <ArrowRight size={22} className="text-slate-300" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-5 pt-4 border-t border-slate-100">
          {[
            { icon: <CheckCircle2 size={13} className="text-emerald-500" />, label: "Completed" },
            { icon: <Clock size={13} className="text-sky-500" />, label: "In Progress" },
            { icon: <Circle size={13} className="text-slate-300" />, label: "Pending" },
          ].map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              {l.icon}
              <span className="text-[11px] text-slate-500 font-medium">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Market Pulse */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} style={{ color: "#0D9488" }} />
          <div>
            <h4 className="font-extrabold text-sm tracking-tight" style={{ color: "#1B365D" }}>
              Market Pulse Trends
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tech stack demand index · Q4 2024 · Regional market
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={210}>
          <BarChart
            data={MARKET_DATA}
            layout="vertical"
            margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
            <XAxis
              type="number"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "'JetBrains Mono', monospace" }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="skill"
              tick={{ fontSize: 11, fill: "#475569", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}
              width={88}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              formatter={(v) => [`${v}%`, "Demand Index"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #E2E8F0", fontSize: 12 }}
              cursor={{ fill: "rgba(13,148,136,0.06)" }}
            />
            <Bar dataKey="demand" radius={[0, 6, 6, 0]}>
              {MARKET_DATA.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.demand >= 85 ? "#0D9488" : entry.demand >= 70 ? "#1B365D" : "#94A3B8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── TAB 3: AI VIRTUAL MENTOR ────────────────────────────────────────────────
