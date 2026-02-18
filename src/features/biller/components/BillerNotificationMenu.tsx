import React, { useEffect, useRef, useState } from "react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "info" | "alert" | "success";
}

interface BillerNotificationMenuProps {
  onReplenishFloat?: () => void;
}

const BillerNotificationMenu: React.FC<BillerNotificationMenuProps> = ({
  onReplenishFloat,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      title: "Payment Success",
      message: "ZESA payment for meter 1422... was successful.",
      time: "2 mins ago",
      isRead: false,
      type: "success",
    },
    {
      id: "2",
      title: "Low Float Alert",
      message: "Your current shop float is below $50.",
      time: "1 hour ago",
      isRead: false,
      type: "alert",
    },
    {
      id: "3",
      title: "System Update",
      message: "New billers added to the marketplace.",
      time: "5 hours ago",
      isRead: true,
      type: "info",
    },
  ]);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20"
            : "bg-neutral-light/50 text-neutral-text hover:bg-neutral-light"
        }`}
      >
        <span className="material-symbols-outlined text-xl">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-14 right-0 w-96 bg-white rounded-[2rem] shadow-2xl border border-neutral-light/50 overflow-hidden animate-in fade-in z-[100]">
          <div className="p-6 border-b border-neutral-light/30 flex items-center justify-between">
            <h4 className="text-xs font-black uppercase tracking-widest text-dark-text/40">
              INBOX
            </h4>
          </div>
          <div className="max-h-[500px] overflow-y-auto relative">
            <div className="flex flex-col relative">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-6 border-b border-neutral-light/30 last:border-0 hover:bg-neutral-light/20 transition-colors relative"
                >
                  <div className="flex gap-4 items-start">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        n.type === "success"
                          ? "bg-[#f0f9e6] text-[#a3e635]"
                          : n.type === "alert"
                            ? "bg-red-50 text-red-500"
                            : "bg-blue-50 text-blue-500"
                      }`}
                    >
                      <span className="material-symbols-outlined text-2xl">
                        {n.type === "success"
                          ? "check_circle"
                          : n.type === "alert"
                            ? "warning"
                            : "info"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className="text-base font-black text-dark-text tracking-tight">
                        {n.title}
                      </p>
                      <p className="text-sm text-neutral-text mt-1 leading-tight font-medium">
                        {n.message}
                      </p>
                      <p className="text-[10px] font-black text-neutral-text/30 uppercase mt-2 tracking-widest">
                        {n.time}
                      </p>
                    </div>
                  </div>
                  {n.type === "alert" && n.title.includes("Float") && (
                    <div className="mt-4 flex justify-center">
                      <button
                        onClick={() => onReplenishFloat?.()}
                        className="bg-primary text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-2 w-full max-w-[280px]"
                      >
                        <span className="material-symbols-outlined text-lg">
                          add_circle
                        </span>
                        REPLENISH FLOAT
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillerNotificationMenu;
