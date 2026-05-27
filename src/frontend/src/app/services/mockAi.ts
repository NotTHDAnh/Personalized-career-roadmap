export function getAIResponse(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("career") || m.includes("match") || m.includes("suit") || m.includes("best")) {
    return "Based on your transcript (3.73 weighted GPA), your strongest indicators point in two directions:\n\n🏆 **Frontend Developer** — Your WEB201 performance (3.7) and CS foundations are exactly right. React/TypeScript market demand sits at 89% and is growing.\n\n🥈 **Data Engineer** — Your MATH101 results (3.5) and interest in data structures hint at strong analytical aptitude here too.\n\nWould you like me to map out the full course path for either of these?";
  }
  if (m.includes("course") || m.includes("prioritize") || m.includes("semester") || m.includes("next")) {
    return "For Semester 3, here's my priority stack for your profile:\n\n1. **WEB301 — React & Next.js** _(high priority)_ — Follows directly from your WEB201 (3.7). 89% market demand index.\n\n2. **DB101 — Database Fundamentals** _(medium)_ — Unlocks 3 advanced tracks and is universally required.\n\n3. **CS302 — Operating Systems** _(if capacity allows)_ — Prerequisite for Cloud Computing.\n\nRecommended load: 8–10 credits to maintain your GPA trajectory.";
  }
  if (m.includes("internship") || m.includes("job") || m.includes("apply") || m.includes("work")) {
    return "You're ready to start applying now. Here is your action plan:\n\n**Immediate:** Build 2 React projects — one with a REST API, one with state management — and push them to GitHub with clean READMEs.\n\n**This semester:** Complete WEB301 to validate proficiency. Add a DB101 project to show full-stack awareness.\n\n**Apply to:** Fintech startups, edtech companies, and university partner programs — they actively recruit at your stage (3.0+ GPA threshold).\n\nThe university career portal has pre-screened listings from partner companies with dedicated student tracks.";
  }
  if (m.includes("skill") || m.includes("demand") || m.includes("trend") || m.includes("industry")) {
    return "Current market pulse (2024 data):\n\n🥇 **Python** — 94% demand index\n🥈 **React / Next.js** — 89%\n🥉 **AWS** — 82%\n📊 **SQL** — 78% (universal across all roles)\n⚡ **TypeScript** — 76%\n\n**My recommendation:** React + TypeScript mastery first (your current path), then SQL and AWS in year 3. This stack maps to over 75% of open junior positions in the regional tech market.";
  }
  if (m.includes("study") || m.includes("plan") || m.includes("schedule")) {
    return "Here is a structured weekly plan for Semester 3:\n\n**Mon / Wed:** CS201 problem sets (1.5h each) — focus on Big-O analysis and sorting\n**Tue / Thu:** WEB201 project work (2h each) — build real TypeScript apps\n**Friday:** Review + 3 LeetCode Easy problems\n**Weekend:** 3–4h deep focus on your hardest topic\n\n📌 **Key tactic:** Use 25-min Pomodoro blocks for CS theory. For coding, use longer 50-min sessions with no interruptions.\n\nWant me to drill into a specific subject or week?";
  }
  if (m.includes("gpa") || m.includes("grade") || m.includes("improve") || m.includes("tip")) {
    return "To push your CS201 grade from 3.6 to 3.9+:\n\n**High-impact tactics:**\n• Visualize every algorithm — draw state changes on paper before coding\n• Implement each structure from scratch: linked list, stack, queue, BST, heap\n• Annotate every solution with time and space complexity\n\n**Exam prep:** The pattern weights complexity analysis (40%) and implementation (35%). Study past exams carefully.\n\n**Resources:** MIT 6.006 (YouTube), Visualgo.net, LeetCode Easy/Medium daily.\n\nWith 4 weeks of focused practice, 3.9+ is very achievable.";
  }
  return "That is a thoughtful question. Based on your 3.73 GPA and your strong trajectory in Web Development and CS fundamentals, I would focus on consolidating your TypeScript skills before branching into more specialized areas.\n\nIs there a specific aspect of your career path or coursework I can help you think through in more detail?";
}
