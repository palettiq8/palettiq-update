import Sidebar from "@/components/projects/Sidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Sidebar />
      <main>
        {children}
      </main>
    </div>
  )
}
