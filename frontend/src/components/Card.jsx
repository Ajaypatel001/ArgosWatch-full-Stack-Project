export default function Card({ title, icon: Icon, children, className = '', onClick, bgImage }) {
  return (
    <div 
      className={`relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {bgImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={bgImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/40 to-transparent"></div>
        </div>
      )}
      
      <div className="relative z-10">
        <div className="p-5 border-b border-gray-50 flex items-center space-x-3 bg-gray-50/50 backdrop-blur-sm">
          {Icon && (
            <div className="p-2 bg-farm-green-100 rounded-lg">
              <Icon className="w-5 h-5 text-farm-green-600" />
            </div>
          )}
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
