export const Logo = ({ size = 24, className = "" }) => (
  <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
    {/* <Pocket size={size} className="text-teal-500" />
    <div className="absolute -top-1 -right-1 bg-emerald-400 rounded-full p-0.5 border-2 border-white shadow-sm">
      <Check size={size / 2.5} className="text-white stroke-[4]" />
    </div> */}
    <img src="/logo-icon.png" alt="Meu Bolso" className="text-teal-500" />
  </div>
);