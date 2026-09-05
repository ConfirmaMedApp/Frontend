const LogoConfirmamed = ({
  width = 50,
  height = 50,
  className = "",
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background */}
      <rect x="4" y="4" width="88" height="88" rx="20" fill="#0EA5E9" />

      {/* Calendar top */}
      <rect x="22" y="22" width="52" height="12" rx="6" fill="#0369A1" />

      {/* Calendar body */}
      <rect x="22" y="34" width="52" height="40" rx="10" fill="white" />

      {/* Medical cross */}
      <rect x="44" y="42" width="8" height="22" rx="2" fill="#0EA5E9" />
      <rect x="37" y="49" width="22" height="8" rx="2" fill="#0EA5E9" />

      {/* Check */}
      <path
        d="M32 58 L40 66 L62 44"
        stroke="#22C55E"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default LogoConfirmamed;
