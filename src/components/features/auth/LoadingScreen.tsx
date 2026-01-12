export function LoadingScreen() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        margin: 0,
        padding: 0,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <img
        src="https://images.squarespace-cdn.com/content/v1/6449f0be1aea3b0d974f5af0/d6e90988-9b25-45db-967a-f110ffa9cfd3/amaxst+logo+side-07.png?format=750w"
        alt="AMAXST Logo"
        style={{
          height: '80px',
          width: 'auto',
          objectFit: 'contain',
          marginBottom: '40px',
        }}
      />

      {/* Spinner */}
      <div
        style={{
          width: '60px',
          height: '60px',
          border: '4px solid rgba(96, 165, 250, 0.2)',
          borderTop: '4px solid rgb(96, 165, 250)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />

      {/* Text */}
      <h2
        style={{
          color: 'white',
          fontSize: '24px',
          fontWeight: '600',
          marginTop: '30px',
          marginBottom: '10px',
        }}
      >
        Logging into the system
      </h2>

      <p
        style={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px',
        }}
      >
        Please wait while we authenticate your account...
      </p>

      {/* Animation styles */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
