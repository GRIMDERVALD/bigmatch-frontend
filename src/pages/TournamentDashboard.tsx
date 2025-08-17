import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Share2, 
  Play, 
  Trophy,
  Plus,
  Trash2,
  CheckCircle
} from 'lucide-react';
import { Button, Card, Loading, Alert, Badge, Input } from '../components/ui';
import { tournamentApi, playerApi, type Tournament, type Player } from '../services/api';
import { format } from 'date-fns';

const TournamentDashboard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerContact, setNewPlayerContact] = useState('');
  const [creatingPools, setCreatingPools] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTournamentData();
  }, [id]);

  const loadTournamentData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [tournamentData, playersData] = await Promise.all([
        tournamentApi.getById(id),
        playerApi.getAll(id)
      ]);
      
      setTournament(tournamentData);
      setPlayers(playersData);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newPlayerName.trim()) return;

    try {
      setAddingPlayer(true);
      const newPlayer = await playerApi.add(id, {
        name: newPlayerName.trim(),
        contact: newPlayerContact.trim() || undefined,
      });
      
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
      setNewPlayerContact('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de l\'ajout du joueur');
    } finally {
      setAddingPlayer(false);
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce joueur ?')) return;

    try {
      await playerApi.remove(playerId);
      setPlayers(players.filter(p => p.id !== playerId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la suppression');
    }
  };

  const handleCreatePools = async () => {
    if (!id || !tournament) return;

    if (players.length < 4) {
      setError('Minimum 4 joueurs requis pour créer les poules');
      return;
    }

    try {
      setCreatingPools(true);
      await tournamentApi.createPools(id);
      
      // Recharger les données
      await loadTournamentData();
      
      alert('Poules créées avec succès ! Vous pouvez maintenant démarrer le tournoi.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors de la création des poules');
    } finally {
      setCreatingPools(false);
    }
  };

  const handleStartTournament = async () => {
    if (!id) return;

    try {
      await tournamentApi.start(id);
      await loadTournamentData();
      alert('Tournoi démarré ! Les matchs ont été générés.');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Erreur lors du démarrage');
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/rejoindre/${tournament?.share_link}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      setup: { variant: 'default' as const, text: 'Configuration' },
      pools: { variant: 'warning' as const, text: 'Poules créées' },
      active: { variant: 'success' as const, text: 'En cours' },
      finished: { variant: 'default' as const, text: 'Terminé' },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.setup;
    return <Badge variant={badge.variant}>{badge.text}</Badge>;
  };

  if (loading) return <Loading />;
  if (error && !tournament) return <Alert type="error">{error}</Alert>;
  if (!tournament) return <Alert type="error">Tournoi non trouvé</Alert>;

  const canModify = tournament.status === 'setup';
  const canCreatePools = tournament.status === 'setup' && players.length >= 4;
  const canStart = tournament.status === 'pools';

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{tournament.name}</h1>
              {getStatusBadge(tournament.status)}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(tournament.date), 'dd/MM/yyyy à HH:mm')}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{tournament.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Organisé par {tournament.organizer}</span>
              </div>
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={copyShareLink}
            className="flex items-center gap-2"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copié !' : 'Partager'}
          </Button>
        </div>
      </Card>

      {error && (
        <Alert type="error">{error}</Alert>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tournament.total_players || players.length}</div>
            <div className="text-sm text-gray-600">Joueurs</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tournament.total_teams || 0}</div>
            <div className="text-sm text-gray-600">Équipes</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <Play className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tournament.total_matches || 0}</div>
            <div className="text-sm text-gray-600">Matchs</div>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{tournament.completed_matches || 0}</div>
            <div className="text-sm text-gray-600">Terminés</div>
          </div>
        </Card>
      </div>

      {/* Players Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Joueurs inscrits ({players.length})
          </h2>
        </div>

        {/* Add Player Form */}
        {canModify && (
          <form onSubmit={handleAddPlayer} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Ajouter un joueur</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Nom du joueur"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                required
              />
              <Input
                placeholder="Contact (optionnel)"
                value={newPlayerContact}
                onChange={(e) => setNewPlayerContact(e.target.value)}
              />
              <Button
                type="submit"
                loading={addingPlayer}
                disabled={!newPlayerName.trim()}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Ajouter
              </Button>
            </div>
          </form>
        )}

        {/* Players List */}
        {players.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Aucun joueur inscrit pour le moment</p>
            <p className="text-sm">Partagez le lien pour que vos amis s'inscrivent !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900">{player.name}</div>
                  {player.contact && (
                    <div className="text-sm text-gray-600">{player.contact}</div>
                  )}
                </div>
                
                {canModify && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemovePlayer(player.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        {canCreatePools && (
          <Card>
            <div className="text-center py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Prêt à créer les équipes ?
              </h3>
              <p className="text-gray-600 mb-6">
                Les joueurs seront automatiquement répartis en équipes de 2.
              </p>
              
              <Button
                onClick={handleCreatePools}
                loading={creatingPools}
                size="lg"
                className="flex items-center gap-2 mx-auto"
              >
                <Trophy className="w-5 h-5" />
                Créer les poules et équipes
              </Button>
            </div>
          </Card>
        )}

        {canStart && (
          <Card>
            <div className="text-center py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Démarrer le tournoi
              </h3>
              <p className="text-gray-600 mb-6">
                Les matchs seront générés automatiquement selon le format round-robin.
              </p>
              
              <Button
                onClick={handleStartTournament}
                size="lg"
                variant="success"
                className="flex items-center gap-2 mx-auto"
              >
                <Play className="w-5 h-5" />
                Générer les matchs
              </Button>
            </div>
          </Card>
        )}

        {(tournament.status === 'active' || tournament.status === 'finished') && (
          <div className="text-center">
            <Button
              onClick={() => alert('Gestion des matchs à venir dans la prochaine version !')}
              size="lg"
              className="mx-auto"
            >
              Gérer les matchs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentDashboard;