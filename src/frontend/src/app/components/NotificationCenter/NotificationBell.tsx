import React, { useState, useRef, useEffect } from "react";
import { Bell, Info, CheckCircle2, AlertTriangle, Activity, Search, X } from "lucide-react";
import { useVirtualNotifications, VirtualNotification } from "../../../shared/hooks/useVirtualNotifications";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { notifications, loading, dismissNotification, clearAllNotifications } = useVirtualNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<VirtualNotification | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsSearching(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "roadmap_created":
        return <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Info size={16} /></div>;
      case "course_completed":
        return <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><CheckCircle2 size={16} /></div>;
      case "deadline_passed":
        return <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600"><AlertTriangle size={16} /></div>;
      case "score_updated":
        return <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600"><Activity size={16} /></div>;
      default:
        return <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600"><Info size={16} /></div>;
    }
  };

  const getTitle = (type: string) => {
    switch (type) {
      case "roadmap_created": return "Roadmap Created";
      case "course_completed": return "Course Completed";
      case "deadline_passed": return "Deadline Passed";
      case "score_updated": return "Score Updated";
      default: return "Notification";
    }
  };

  const filteredNotifications = notifications.filter(notif => 
    notif.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
    getTitle(notif.type).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E0E7FF] transition-colors text-[#64748B]"
      >
        <Bell size={18} />
        {notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#F8F9FF]"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[280px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 z-[9999] overflow-hidden flex flex-col max-h-[420px]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 h-14">
            {isSearching ? (
              <div className="flex items-center w-full gap-2 bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
                <Search size={14} className="text-gray-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                />
                <button onClick={() => { setIsSearching(false); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-600 p-0.5">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex flex-col w-full">
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-bold text-gray-900">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {filteredNotifications.length > 0 && (
                      <button 
                        onClick={() => clearAllNotifications()}
                        className="text-xs text-red-500 hover:text-red-600 font-semibold hover:underline"
                      >
                        Clear all
                      </button>
                    )}
                    <button 
                      onClick={() => setIsSearching(true)}
                      className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                    >
                      <Search size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500 text-sm">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-20 h-20 mb-3 bg-gray-50 rounded-full flex items-center justify-center">
                   <Bell size={28} className="text-gray-200" />
                </div>
                <h4 className="text-sm font-bold text-gray-900 mb-1">No notification yet!</h4>
                <p className="text-[11px] text-gray-500 max-w-[200px]">You don't have any notification yet, check back later.</p>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => setSelectedNotif(notif)}
                    className="flex items-start gap-3 p-4 hover:bg-gray-50 border-b border-gray-50 transition-colors text-left group cursor-pointer relative"
                  >
                    {getIcon(notif.type)}
                    <div className="flex-1 min-w-0 pr-6">
                      <h4 className="text-sm font-semibold text-gray-900 truncate">{getTitle(notif.type)}</h4>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {formatDistanceToNow(notif.createdAt, { addSuffix: true })}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissNotification(notif.id);
                      }}
                      className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                      title="Delete notification"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedNotif && (
        <div className="fixed inset-0 bg-black/20 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start p-5 border-b border-gray-50">
              <h3 className="font-bold text-gray-900 text-lg">{getTitle(selectedNotif.type)}</h3>
              <button 
                onClick={() => setSelectedNotif(null)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="p-5">
              <p className="text-sm text-gray-600 leading-relaxed">
                {selectedNotif.message}
              </p>
            </div>

            <div className="p-5 flex flex-col gap-3 pt-0">
              <button
                onClick={() => {
                  dismissNotification(selectedNotif.id);
                  setSelectedNotif(null);
                }}
                className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                Delete notification
              </button>
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full py-3 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
