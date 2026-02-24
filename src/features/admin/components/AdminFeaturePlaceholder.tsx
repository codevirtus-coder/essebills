import React from "react";

interface AdminFeaturePlaceholderProps {
  title: string;
  description: string;
}

const AdminFeaturePlaceholder: React.FC<AdminFeaturePlaceholderProps> = ({
  title,
  description,
}) => {
  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] border border-neutral-light shadow-sm p-8">
        <h2 className="text-2xl font-extrabold text-dark-text dark:text-white">{title}</h2>
        <p className="text-sm text-neutral-text mt-2 max-w-2xl">{description}</p>
        <div className="mt-8 rounded-2xl border border-dashed border-neutral-light bg-neutral-light/20 p-6">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-text">
            Module scaffolded
          </p>
          <p className="text-sm text-neutral-text mt-2">
            This section is now placed in Admin navigation and ready for API wiring.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminFeaturePlaceholder;
