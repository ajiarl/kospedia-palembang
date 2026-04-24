export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen items-center justify-center px-4 py-10"
      style={{
        backgroundColor: "#FAFAF8",
        backgroundImage: `
          radial-gradient(ellipse at 15% 50%, rgba(193,68,14,0.06) 0%, transparent 55%),
          radial-gradient(ellipse at 85% 20%, rgba(45,74,62,0.05) 0%, transparent 50%),
          url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cg fill='none' stroke='%23C1440E' stroke-width='0.5' opacity='0.06'%3E%3Cpath d='M20 5 L35 20 L20 35 L5 20 Z'/%3E%3C/g%3E%3C/svg%3E")
        `,
      }}
    >
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
