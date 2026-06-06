export function AuthShell({
  title,
  copy,
  children,
}: {
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mobile-frame">
      <section className="auth-page">
        <div className="brand-mark">
          <img src="/Logohh.jpeg" alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
        </div>
        <h1 className="auth-title">{title}</h1>
        <p className="auth-copy">{copy}</p>
        {children}
      </section>
    </main>
  );
}
