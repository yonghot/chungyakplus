export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-primary">청약메이트</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            나에게 맞는 청약을 찾아보세요
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
