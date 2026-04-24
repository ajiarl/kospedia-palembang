export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        backgroundImage: `
          radial-gradient(ellipse at 20% 50%, rgba(232,93,4,0.08) 0%, transparent 60%),
          radial-gradient(ellipse at 80% 20%, rgba(26,78,95,0.07) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cg fill='none' stroke='%23E85D04' stroke-width='0.5' opacity='0.07'%3E%3Cpath d='M20 5 L35 20 L20 35 L5 20 Z'/%3E%3C/g%3E%3C/svg%3E")
        `,
        backgroundColor: "hsl(210 40% 98%)",
      }}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
