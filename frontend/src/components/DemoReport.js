'use client'
import React from 'react';
import { CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

const mockData = {
    atsScore: 78,
    matchSummary:
        "Anurag has a strong foundation in backend development, specifically with the Node.js/Express.js and JavaScript stack. He demonstrates practical experience through a Node.js internship and key projects involving REST APIs, WebSockets, and database modeling. To improve his suitability for general Backend Developer roles, he should integrate modern backend practices such as Docker, TypeScript, Cloud Services (AWS), and automated testing.",
    matchingSkills: [
        "Node.js", "Express.js", "REST APIs", "JavaScript",
        "MongoDB", "MySQL", "SQL", "JWT Authentication",
        "Git", "GitHub", "Postman"
    ],
    missingKeywords: [
        "Docker", "TypeScript", "AWS", "Redis", "System Design",
        "Unit Testing", "Jest", "Microservices", "CI/CD"
    ],
    strengths: [
        "Hands-on internship experience building scalable REST APIs and managing multiple modules.",
        "Strong algorithmic problem-solving skills, backed by 900+ solved problems on LeetCode and GFG.",
        "Practical integration of real-time technologies like WebSockets and WebRTC."
    ],
    areasOfImprovement: [
        {
            category: "Technical Stack Expansion",
            issue: "The backend stack is highly restricted to vanilla JavaScript and Node.js.",
            suggestion: "Adopt TypeScript for modern Node.js development and list it prominently. Consider exploring another language like Python, Go, or Java for backend services."
        },
        {
            category: "DevOps & Cloud",
            issue: "Lack of containerization and mainstream cloud infrastructure experience (such as AWS, GCP, or Docker).",
            suggestion: "Containerize your Node.js projects using Docker, and deploy services using AWS ECS or EC2 to showcase production-level infrastructure skills."
        },
        {
            category: "Testing and Reliability",
            issue: "No mention of unit, integration, or API automated testing.",
            suggestion: "Add testing tools such as Jest, Supertest, or Mocha to your skills and detail how you tested your API endpoints in your project bullet points."
        }
    ]
};

export default function DemoReport() {
    return (
        <div className="w-full space-y-8 mt-16 pt-12 border-t border-slate-800/80">
            {/* Demo Badge Header */}
            <div className="text-center space-y-2">
                <span className="inline-block px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold rounded-full uppercase tracking-widest">
                    Interactive Demo Preview
                </span>
                <h3 className="text-2xl font-bold text-white">See What Your ATS Report Will Look Like</h3>
                <p className="text-slate-400 text-sm max-w-lg mx-auto">
                    Here is a real example of the actionable insights and score breakdown our AI generates after evaluating a resume.
                </p>
            </div>

            {/* Demo Output Display */}
            <div className="space-y-6 opacity-90 hover:opacity-100 transition-opacity">
                {/* Header Title */}
                <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                        AI ANALYSIS COMPLETE
                    </span>
                    <h2 className="text-3xl font-extrabold text-white mt-1">ATS report dashboard</h2>
                    <p className="text-slate-400 text-sm">
                        Review your match score, missing keywords, strengths, and concrete edits before submitting your application.
                    </p>
                </div>

                {/* ATS Score Card */}
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
                    <div className="space-y-2">
                        <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">ATS SCORE</span>
                        <h3 className="text-2xl font-bold text-white">Resume match rating</h3>
                        <span className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full">
                            Strong ATS Match
                        </span>
                    </div>

                    <div className="relative w-28 h-28 flex items-center justify-center">
                        {/* SVG Progress Circle */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <path
                                className="text-slate-800"
                                strokeWidth="3.5"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path
                                className="text-emerald-400"
                                strokeDasharray="78, 100"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                stroke="currentColor"
                                fill="none"
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                        </svg>
                        <div className="absolute text-center">
                            <span className="text-2xl font-extrabold text-white">{mockData.atsScore}</span>
                            <span className="text-xs text-slate-400 block">/100</span>
                        </div>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-2">
                    <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">EXECUTIVE SUMMARY</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{mockData.matchSummary}</p>
                </div>

                {/* Skills & Missing Keywords */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Matching Skills */}
                    <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Matching Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {mockData.matchingSkills.map((skill, idx) => (
                                <span key={idx} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Missing Keywords */}
                    <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400" /> Missing Keywords
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {mockData.missingKeywords.map((kw, idx) => (
                                <span key={idx} className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-medium rounded-full">
                                    {kw}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Strengths */}
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-3">
                    <h4 className="text-md font-semibold text-white">Strengths</h4>
                    <div className="space-y-2">
                        {mockData.strengths.map((st, idx) => (
                            <div key={idx} className="flex items-start gap-3 text-slate-300 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{st}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <h4 className="text-md font-semibold text-white flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-indigo-400" /> Actionable Recommendations
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {mockData.areasOfImprovement.map((rec, idx) => (
                            <div key={idx} className="bg-slate-950 border border-slate-800/80 p-5 rounded-xl space-y-3">
                                <h5 className="text-sm font-bold text-indigo-300">{rec.category}</h5>
                                <p className="text-xs text-slate-300">
                                    <strong className="text-slate-100">Detected issue: </strong>{rec.issue}
                                </p>
                                <p className="text-xs text-slate-400">
                                    <strong className="text-indigo-400">Suggested fix: </strong>{rec.suggestion}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}