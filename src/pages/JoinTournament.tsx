import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Trophy, Calendar, MapPin, Users, CheckCircle } from 'lucide-react';
import { Button, Input, Card, Loading, Alert } from '../components/ui';
import { tournamentApi, playerApi, type Tournament } from '../services/api';
import { format } from 'date-fns';

type FormData = {
  name: string;
  contact?: string;
};

const JoinTournament: React.FC = () => {
  const { shareLink } = useParams<{ shareLink: string }>();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  useEffect(() => {
    loadTournament();
  }, [shareLink]);

  const loadTournament = async () => {
    if (!shareLink) return;
    
    try {
      setLoading(true);
      const tournamentData = await tournamentApi.getByShareLink(shareLink);
      setTournament(tournamentData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Tournoi non trouvé');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!tournament) return;

    try {
      setJoining(true);
      setError(null);
      
      await playerApi.add(tournament.id, {
        name: data.name,
        contact: data.contact || undefined,
      });
      
      setSuccess(true);
      
      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        navigate(`/tournoi/${tournament.id}`);
      }, 2000);
      
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'inscription');
    } finally {
      setJoining(false);
    }
  };

  if (loading) return <Loading text="Chargement du tournoi..." />;
  if (error && !tournament) return <Alert type="error">{error}</Alert>;
  if (!tournament) return <Alert type="error">Tournoi non trouvé</Alert>;

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <Card>
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Inscription réussie !
          </h1>
          <p className="text-gray-600 mb-6">
            Vous êtes maintenant inscrit au tournoi "{tournament.name}".
            Redirection en cours...
          </p>
          <Button onClick={() => navigate(`/tournoi/${tournament.id}`)}>
            Voir le tournoi
          </Button>
        </Card>
      </div>
    );
  }

  const canJoin = tournament.status === 'setup';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Tournament Info */}
      <Card>
        <div className="text-center mb-6">
          <div className="bg-blue-100 p-3 rounded-full w-16 h-16 mx-auto mb-4">
            <Trophy className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {tournament.name}
          </h1>
          <p className="text-gray-600">
            Vous êtes invité à participer à ce tournoi de basket !
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
          <div className="text-center">
            <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Date</div>
            <div className="text-sm text-gray-600">
              {format(new Date(tournament.date), 'dd/MM/yyyy')}
            </div>
            <div className="text-sm text-gray-600">
              {format(new Date(tournament.date), 'HH:mm')}
            </div>
          </div>
          
          <div className="text-center">
            <MapPin className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Lieu</div>
            <div className="text-sm text-gray-600">{tournament.location}</div>
          </div>
          
          <div className="text-center">
            <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="font-medium text-gray-900">Organisateur</div>
            <div className="text-sm text-gray-600">{tournament.organizer}</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium text-gray-900 mb-3">Format du tournoi</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Équipes de 2 joueurs (basket 2v2)</li>
            <li>• {tournament.settings.teams_per_pool} équipes maximum par poule</li>
            <li>• Premier à {tournament.settings.score_limit} points gagne</li>
            <li>• Matchs en round-robin par poule</li>
          </ul>
        </div>
      </Card>

      {/* Join Form */}
      {canJoin ? (
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Rejoindre le tournoi
          </h2>
          
          {error && (
            <Alert type="error" className="mb-4">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Votre nom"
              placeholder="Ex: Jean Dupont"
              {...register('name', { required: 'Votre nom est requis', minLength: { value: 2, message: 'Minimum 2 caractères' } })}
              error={errors.name?.message}
            />

            <Input
              label="Contact (optionnel)"
              placeholder="Téléphone ou email"
              {...register('contact')}
              error={errors.contact?.message}
              helperText="Pour que l'organisateur puisse vous contacter si besoin"
            />

            <Button
              type="submit"
              loading={joining}
              className="w-full"
              size="lg"
            >
              S'inscrire au tournoi
            </Button>
          </form>
        </Card>
      ) : (
        <Alert type="warning">
          <div className="text-center">
            <h3 className="font-medium mb-2">Inscriptions fermées</h3>
            <p>
              {tournament.status === 'pools' && 'Les équipes ont déjà été formées.'}
              {tournament.status === 'active' && 'Le tournoi est en cours.'}
              {tournament.status === 'finished' && 'Le tournoi est terminé.'}
            </p>
            <Button
              onClick={() => navigate(`/tournoi/${tournament.id}`)}
              variant="secondary"
              className="mt-3"
            >
              Voir le tournoi
            </Button>
          </div>
        </Alert>
      )}

      {/* Current Players Count */}
      {tournament.total_players !== undefined && tournament.total_players > 0 && (
        <Card>
          <div className="text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-gray-900">
              {tournament.total_players} joueur{tournament.total_players > 1 ? 's' : ''} déjà inscrit{tournament.total_players > 1 ? 's' : ''}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Rejoignez-les pour un tournoi mémorable !
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default JoinTournament;