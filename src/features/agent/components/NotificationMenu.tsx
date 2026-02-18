import React, { useState } from "react";

interface NotificationMenuProps {
  onReplenishFloat: () => void;
}

const NotificationMenu: React.FC<NotificationMenuProps> = ({
  onReplenishFloat,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-11 h-11 rounded-2xl bg-[#eceaf3] text-[#756d95] flex items-center justify-center relative"
      >
        <span className="material-symbols-outlined">notifications</span>
        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#ff4d4f] text-white text-[10px] grid place-items-center font-bold">
          2
        </span>
      </button>

      {open ? (
        <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl border border-[#e4e2ec] shadow-xl p-3 z-20">
          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-text px-2 py-1">
            Notifications
          </p>
          <button
            type="button"
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f7f6fb] text-sm font-semibold"
          >
            2 sales completed successfully
          </button>
          <button
            type="button"
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#f7f6fb] text-sm font-semibold"
            onClick={() => {
              setOpen(false);
              onReplenishFloat();
            }}
          >
            Float running low. Replenish now
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationMenu;

