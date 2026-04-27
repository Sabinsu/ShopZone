import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar/>
      <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl">
          {children}
        </div>
      </div>
    </div>
  );
}
