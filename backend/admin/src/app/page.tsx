import { 
  Leaf, 
  Droplets, 
  Users, 
  ShoppingBag,
  TrendingUp,
  Eye,
  MousePointer,
  Calendar
} from 'lucide-react';

// Composant carte statistique
function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon,
  color 
}: { 
  title: string; 
  value: string | number; 
  change?: string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
}

// Composant activité récente
function RecentActivity() {
  const activities = [
    { type: 'view', text: 'Tisane au thym consultée', time: 'Il y a 2 min' },
    { type: 'click', text: 'Clic Amazon - Miel bio', time: 'Il y a 5 min' },
    { type: 'user', text: 'Nouvel utilisateur inscrit', time: 'Il y a 12 min' },
    { type: 'view', text: 'Huile essentielle lavande consultée', time: 'Il y a 18 min' },
    { type: 'click', text: 'Clic Amazon - Thym bio', time: 'Il y a 25 min' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${
              activity.type === 'view' ? 'bg-blue-100' :
              activity.type === 'click' ? 'bg-green-100' : 'bg-purple-100'
            }`}>
              {activity.type === 'view' && <Eye className="w-4 h-4 text-blue-600" />}
              {activity.type === 'click' && <MousePointer className="w-4 h-4 text-green-600" />}
              {activity.type === 'user' && <Users className="w-4 h-4 text-purple-600" />}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">{activity.text}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Composant remèdes populaires
function PopularRemedies() {
  const remedies = [
    { name: 'Tisane au thym et miel', views: 1234, trend: '+12%' },
    { name: 'Infusion de camomille', views: 987, trend: '+8%' },
    { name: 'Sirop au citron', views: 856, trend: '+15%' },
    { name: 'Cataplasme d\'argile', views: 654, trend: '+5%' },
    { name: 'Inhalation eucalyptus', views: 543, trend: '+22%' },
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Remèdes populaires</h3>
      <div className="space-y-3">
        {remedies.map((remedy, index) => (
          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center">
              <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-medium flex items-center justify-center mr-3">
                {index + 1}
              </span>
              <span className="text-sm text-gray-900">{remedy.name}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">{remedy.views} vues</span>
              <span className="text-xs text-green-600 font-medium">{remedy.trend}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Page principale Dashboard
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre application</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>90 derniers jours</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Remèdes publiés"
          value={186}
          icon={Leaf}
          color="bg-green-500"
        />
        <StatCard
          title="Huiles essentielles"
          value={45}
          icon={Droplets}
          color="bg-purple-500"
        />
        <StatCard
          title="Utilisateurs actifs"
          value="2.4k"
          change="+12% cette semaine"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Clics Amazon"
          value={847}
          change="+23% cette semaine"
          icon={ShoppingBag}
          color="bg-orange-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PopularRemedies />
        <RecentActivity />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Leaf className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Nouveau remède</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Droplets className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Nouvelle HE</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Calendar className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Contenu du jour</span>
          </button>
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <ShoppingBag className="w-6 h-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Nouveau produit</span>
          </button>
        </div>
      </div>
    </div>
  );
}
