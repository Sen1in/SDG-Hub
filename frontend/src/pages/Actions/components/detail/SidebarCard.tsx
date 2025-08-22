interface SidebarCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const SidebarCard: React.FC<SidebarCardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );
};