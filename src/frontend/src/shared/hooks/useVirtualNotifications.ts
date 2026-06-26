import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { apiClient } from "../api/apiClient";

export type VirtualNotificationType = "roadmap_created" | "deadline_passed" | "course_completed" | "score_updated";

export interface VirtualNotification {
  id: string; // Unique ID (e.g., roadmapId, nodeId)
  type: VirtualNotificationType;
  message: string;
  createdAt: Date;
  read: boolean;
}

export function useVirtualNotifications() {
  const { user } = useAuth();
  const userId = user?.userId;
  const [notifications, setNotifications] = useState<VirtualNotification[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load dismissed IDs from local storage
  useEffect(() => {
    try {
      if (userId) {
        const stored = localStorage.getItem(`dismissed_notifications_${userId}`);
        if (stored) {
          setDismissedIds(JSON.parse(stored));
        }
      }
    } catch (e) {
      console.error("Failed to parse dismissed notifications", e);
    }
  }, [userId]);

  const generateNotifications = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const newNotifications: VirtualNotification[] = [];
      const userRoadmaps = await apiClient.get<any[]>(`/Roadmap/user/${userId}`);
      
      if (!userRoadmaps || userRoadmaps.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      for (const roadmap of userRoadmaps) {
        // 1. Roadmap created notification
        const roadmapId = roadmap.roadmapId;
        newNotifications.push({
          id: `roadmap_${roadmapId}`,
          type: "roadmap_created",
          message: `Your roadmap "${roadmap.targetRoleName}" has been created successfully.`,
          createdAt: new Date(), // Using current date since we don't have creation time in DTO
          read: false,
        });

        // Fetch details to check nodes
        try {
          const detail = await apiClient.get<any>(`/Roadmap/${roadmapId}`);
          if (detail && detail.phases) {
            const flatNodes = detail.phases.flatMap((p: any) => p.nodes || []);
            
            flatNodes.forEach((node: any) => {
              // 2. Course completed notification
              if (node.status === "COMPLETED" || node.status === "done") {
                newNotifications.push({
                  id: `completed_${node.nodeId}`,
                  type: "course_completed",
                  message: `Congratulations! You have completed "${node.courseName || node.nodeId}".`,
                  createdAt: new Date(),
                  read: false,
                });
              }

              // 3. Deadline passed notification
              if (node.deadline && (node.status !== "COMPLETED" && node.status !== "done")) {
                const deadlineDate = new Date(node.deadline);
                if (deadlineDate < new Date()) {
                  newNotifications.push({
                    id: `deadline_${node.nodeId}`,
                    type: "deadline_passed",
                    message: `Deadline passed for "${node.courseName || node.nodeId}". Please review your progress.`,
                    createdAt: deadlineDate,
                    read: false,
                  });
                }
              }

              // 4. Score updated (Mock logic based on GPA if exists)
              if (node.gpa !== undefined && node.gpa !== null) {
                newNotifications.push({
                  id: `score_${node.nodeId}`,
                  type: "score_updated",
                  message: `Your score for "${node.courseName || node.nodeId}" has been updated to ${node.gpa}.`,
                  createdAt: new Date(),
                  read: false,
                });
              }
            });
          }
        } catch (detailErr) {
          console.error(`Failed to fetch details for roadmap ${roadmapId}`, detailErr);
        }
      }

      // Sort by date descending
      newNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      setNotifications(newNotifications);
    } catch (err) {
      console.error("Failed to generate virtual notifications", err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    generateNotifications();

    // Listen for custom event to trigger refresh without reloading the page
    const handleRoadmapUpdated = () => {
      generateNotifications();
    };
    window.addEventListener('roadmap_updated', handleRoadmapUpdated);
    
    return () => {
      window.removeEventListener('roadmap_updated', handleRoadmapUpdated);
    };
  }, [generateNotifications]);

  const activeNotifications = notifications.filter(n => !dismissedIds.includes(n.id));

  const dismissNotification = useCallback((id: string) => {
    setDismissedIds(prev => {
      const updated = [...prev, id];
      if (userId) {
        localStorage.setItem(`dismissed_notifications_${userId}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [userId]);

  const clearAllNotifications = useCallback(() => {
    setDismissedIds(prev => {
      const allIds = [...prev, ...notifications.map(n => n.id)];
      const unique = Array.from(new Set(allIds));
      if (userId) {
        localStorage.setItem(`dismissed_notifications_${userId}`, JSON.stringify(unique));
      }
      return unique;
    });
  }, [notifications, userId]);

  return {
    notifications: activeNotifications,
    loading,
    dismissNotification,
    clearAllNotifications,
    refresh: generateNotifications
  };
}
