import React, { useEffect, useState } from 'react';

const ListeProfiles = () => {
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Replace with your API endpoint or data fetching logic
        fetch('/api/profiles')
            .then((res) => res.json())
            .then((data) => {
                setProfiles(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div>Chargement des profils...</div>;
    }

    return (
        <div>
            <h2>Liste des Profils</h2>
            {profiles.length === 0 ? (
                <p>Aucun profil trouvé.</p>
            ) : (
                <ul>
                    {profiles.map((profile) => (
                        <li key={profile.id}>
                            {profile.nom} {profile.prenom} - {profile.email}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ListeProfiles;