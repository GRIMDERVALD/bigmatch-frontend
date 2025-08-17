import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Trophy, Users, Calendar, MapPin, Play } from 'lucide-react';
import { Button, Input, Card, Alert } from '../components/ui';
import { tournamentApi } from '../services/api';

const schema = yup.object({
  name: yup.string().required('Le nom du tournoi est requis').min(3, 'Minimum 3 caractères'),
  location: yup.string().required('Le lieu est requis'),
  date: yup.string().required('La date est requise'),
  organizer: yup.string().required('Le nom de l\'organisateur est requis'),
});

type FormData = yup.InferType<typeof schema>;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    try {
      const tournament = await tournamentApi.create({
        ...data,
        date: new Date(data.date).toISOString(),
        settings: {
          teams_per_pool: 4,
          matches_per_team: 3,
          score_limit: 21,
        },
      });

      navigate(`/tournoi/${tournament.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création du tournoi');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 p-4 rounded-full">
            <Trophy className="w-16 h-16 text-blue-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Organisez votre tournoi de basket
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Créez des poules, gérez les matchs et suivez les scores en temps réel. 
          Simple, rapide et efficace !
        </p>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <Card className="text-center">
          <Users className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Invitation simple</h3>
          <p className="text-gray-600 text-sm">
            Partagez un lien et vos amis s'inscrivent en quelques clics
          </p>
        </Card>
        
        <Card className="text-center">
          <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Poules automatiques</h3>
          <p className="text-gray-600 text-sm">
            Création automatique des équipes et des matchs
          </p>
        </Card>
        
        <Card className="text-center">
          <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-2">Classement en temps réel</h3>
          <p className="text-gray-600 text-sm">
            Suivez les scores et le classement automatiquement
          </p>
        </Card>
      </div>

      {/* Create Tournament Form */}
      <div className="max-w-2xl mx-auto">
        <Card>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Créer un nouveau tournoi
            </h2>
            <p className="text-gray-600">
              Remplissez les informations pour démarrer votre tournoi
            </p>
          </div>

          {error && (
            <Alert type="error" className="mb-6">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Nom du tournoi"
              placeholder="Ex: Tournoi de basket du samedi"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Organisateur"
              placeholder="Votre nom"
              {...register('organizer')}
              error={errors.organizer?.message}
            />

            <Input
              label="Lieu"
              placeholder="Ex: Gymnase Jean Moulin, Paris"
              {...register('location')}
              error={errors.location?.message}
            />

            <Input
              label="Date et heure"
              type="datetime-local"
              min={today}
              {...register('date')}
              error={errors.date?.message}
              helperText="La date doit être dans le futur"
            />

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Configuration du tournoi</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 4 équipes maximum par poule</li>
                <li>• 2 joueurs par équipe (basket 2v2)</li>
                <li>• Premier à 21 points gagne</li>
                <li>• Matchs en round-robin par poule</li>
              </ul>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Créer le tournoi
            </Button>
          </form>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Vous avez déjà un tournoi ?
        </h3>
        <p className="text-gray-600 mb-6">
          Accédez à votre tournoi avec le lien de partage
        </p>
        <Button
          variant="secondary"
          onClick={() => {
            const link = prompt('Entrez le lien de partage de votre tournoi:');
            if (link) {
              const shareCode = link.split('/').pop();
              if (shareCode) {
                navigate(`/rejoindre/${shareCode}`);
              }
            }
          }}
        >
          Rejoindre un tournoi
        </Button>
      </div>
    </div>
  );
};

export default Home;