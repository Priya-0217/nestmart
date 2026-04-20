export function Logo() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      {/* Basket */}
      <rect x="15" y="32" width="30" height="22" rx="4" fill="#1A56DB" />
      
      {/* Basket lines */}
      <line x1="22" y1="32" x2="22" y2="54" stroke="white" strokeWidth="1.5" />
      <line x1="30" y1="32" x2="30" y2="54" stroke="white" strokeWidth="1.5" />
      <line x1="38" y1="32" x2="38" y2="54" stroke="white" strokeWidth="1.5" />
      
      {/* Roof */}
      <polygon points="12,32 30,10 48,32" fill="#F59E0B" />
    </svg>
  );
}
