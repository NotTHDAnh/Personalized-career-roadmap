import {
    CheckCircle2,
    Clock3,
    LockKeyhole,
    Star,
} from "lucide-react";

import type {
    RoadmapPreview,
    SkillNodeDetail,
} from "../../../types";

type RoadmapTimelineProps = {
    roadmap: RoadmapPreview;
};

const PHASE_COLORS = ["#2EA98C", "#15876E", "#065543", "#094538", "#032F2B"];

export default function RoadmapTimeline({
    roadmap,
}: RoadmapTimelineProps) {
    const allNodes = roadmap.phases?.flatMap((phase) => phase.nodes) ?? [];

    const prerequisiteNodeIds = new Set(
        allNodes.filter((n) => n.parentNodeId).map((n) => n.parentNodeId)
    );

    const progress = Math.min(
        Math.max(Number(roadmap.progressPercent) || 0, 0),
        100,
    );

    return (
        <div className="space-y-5">
            <div>
                <h3 className="text-lg font-bold text-[#002046]">
                    Roadmap for {roadmap.targetRoleName}
                </h3>

                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>
                        Daily study: {roadmap.dailyStudyHours} hours
                    </span>

                    <span>Progress: {progress}%</span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                    <div
                        className="h-full rounded-full bg-teal-600"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {allNodes.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500">
                    This roadmap does not contain any learning nodes.
                </div>
            ) : (
                <div className="space-y-8">
                    {roadmap.phases?.map((phase, phaseIndex) => {
                        const phaseColor = PHASE_COLORS[phaseIndex % PHASE_COLORS.length];
                        const phaseNodes = orderNodesByParent(phase.nodes);

                        if (phaseNodes.length === 0) return null;

                        return (
                            <div key={phase.phaseName} className="relative">
                                <h4
                                    className="mb-4 text-base font-bold uppercase tracking-wide"
                                    style={{ color: phaseColor }}
                                >
                                    {phase.phaseName}
                                </h4>

                                <div className="relative overflow-x-hidden">
                                    <div
                                        className="absolute bottom-0 left-3 top-0 w-[2px] -translate-x-1/2"
                                        style={{ backgroundColor: phaseColor, opacity: 0.3 }}
                                    />

                                    <div className="space-y-5">
                                        {phaseNodes.map((node, index) => {
                                            const isPrereq = prerequisiteNodeIds.has(node.nodeId);

                                            return (
                                                <div
                                                    key={node.nodeId}
                                                    className="relative grid grid-cols-[24px_minmax(0,1fr)] gap-4"
                                                >
                                                    <div className="relative z-10 flex justify-center pt-5">
                                                        <StatusIcon status={node.status} color={phaseColor} />
                                                    </div>

                                                    <div
                                                        className="min-w-0 rounded-xl border border-gray-200 border-l-[6px] bg-white p-4 shadow-sm"
                                                        style={{ borderLeftColor: phaseColor }}
                                                    >
                                                        <div>
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p
                                                                    className="text-xs font-semibold uppercase tracking-wide"
                                                                    style={{ color: phaseColor }}
                                                                >
                                                                    Course {index + 1}
                                                                </p>

                                                                <div className="flex shrink-0 items-center gap-2">
                                                                    {isPrereq && (
                                                                        <span title="Prerequisite Course" className="flex shrink-0 items-center">
                                                                            <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
                                                                        </span>
                                                                    )}
                                                                    <StatusBadge status={node.status} />
                                                                </div>
                                                            </div>

                                                            <h4 className="mt-1 font-semibold text-[#002046]">
                                                                {node.courseName ||
                                                                    node.courseCode ||
                                                                    "Unnamed course"}
                                                            </h4>

                                                            {node.courseCode && node.courseName && (
                                                                <p className="mt-1 text-sm text-gray-500">
                                                                    {node.courseCode}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {node.deadline && (
                                                            <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                                                <Clock3 className="h-4 w-4 shrink-0" />
                                                                <span>Deadline: {node.deadline}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function StatusIcon({ status, color }: { status: string; color: string }) {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "done") {
        return (
            <CheckCircle2 className="h-5 w-5 fill-green-600 text-white" />
        );
    }

    if (normalizedStatus === "locked") {
        return (
            <LockKeyhole className="h-5 w-5 rounded-full bg-gray-400 p-1 text-white" />
        );
    }

    return (
        <span
            className="block h-4 w-4 rounded-full ring-4 ring-white"
            style={{ backgroundColor: color }}
        />
    );
}

function StatusBadge({ status }: { status: string }) {
    const normalizedStatus = status.toLowerCase();

    const badgeClass =
        normalizedStatus === "done"
            ? "bg-green-100 text-green-700"
            : normalizedStatus === "locked"
                ? "bg-gray-200 text-gray-600"
                : "bg-teal-100 text-teal-700";

    return (
        <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${badgeClass}`}
        >
            {status}
        </span>
    );
}

function orderNodesByParent(
    nodes: SkillNodeDetail[],
): SkillNodeDetail[] {
    if (nodes.length <= 1) {
        return nodes;
    }

    const nodeIds = new Set(nodes.map((node) => node.nodeId));

    const childrenByParentId = new Map<
        string | null,
        SkillNodeDetail[]
    >();

    nodes.forEach((node) => {
        const parentId = node.parentNodeId ?? null;
        const children = childrenByParentId.get(parentId) ?? [];

        children.push(node);
        childrenByParentId.set(parentId, children);
    });

    const orderedNodes: SkillNodeDetail[] = [];
    const visitedNodeIds = new Set<string>();

    function visitNode(node: SkillNodeDetail) {
        if (visitedNodeIds.has(node.nodeId)) {
            return;
        }

        visitedNodeIds.add(node.nodeId);
        orderedNodes.push(node);

        const children = childrenByParentId.get(node.nodeId) ?? [];
        children.forEach(visitNode);
    }

    const rootNodes = nodes.filter(
        (node) =>
            !node.parentNodeId ||
            !nodeIds.has(node.parentNodeId),
    );

    rootNodes.forEach(visitNode);

    // Giữ lại node rời nếu dữ liệu quan hệ không hoàn chỉnh.
    nodes.forEach(visitNode);

    return orderedNodes;
}