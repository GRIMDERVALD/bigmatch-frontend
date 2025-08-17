import React from 'react';
import { Plus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="container-mobile py-8">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Organisez vos matchs de basket
        </h2>
        <p className="text-gray-600">
          Créez et gérez facilement vos tournois et matchs
        </p>
      </div>

      {/* Actions */}
      <div className="space-y-4">
        <Link 
          to="/nouveau-tournoi" 
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-basketball-orange rounded-lg">
            <Plus className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Créer un tournoi</h3>
            <p className="text-sm text-gray-500">Organisez un nouveau tournoi</p>
          </div>
        </Link>

        <Link 
          to="/rejoindre" 
          className="flex items-center gap-4 p-6 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Rejoindre un tournoi</h3>
            <p className="text-sm text-gray-500">Utilisez un code de partage</p>
          </div>
        </Link>
      </div>

      {/* Info Section */}
      <div className="mt-12 p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Comment ça marche ?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Créez votre tournoi avec les détails</li>
          <li>• Partagez le code avec les joueurs</li>
          <li>• Les équipes se forment automatiquement</li>
          <li>• Suivez les scores en temps réel</li>
        </ul>
      </div>
    </div>
  );
};

export default Home;