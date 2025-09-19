import React, { useState, useEffect } from 'react';
import { 
  FaUser, FaIdCard, FaBriefcase, FaCogs, FaUserShield, 
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaBuilding,
  FaSpinner, FaExclamationTriangle
} from 'react-icons/fa';
import { Card } from '../components/my-ui/Card';
import { api } from '../services/api';

const MonProfil = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Simulation de l'appel API
    useEffect(() => {
        const fetchUserData = async () => {
                // En situation réelle, vous feriez un appel API ici
                const response = await api.getCurrentUser();             
                setUserData(response);
                setLoading(false);

        };

        fetchUserData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-center">
                    <FaSpinner className="animate-spin h-12 w-12 text-green-900 mx-auto" />
                    <p className="mt-4 text-gray-600">Chargement de vos informations...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-yellow-700">Aucune donnée utilisateur disponible</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 mr-5">
            <Card
                title="MON PROFIL"
                className="max-w-5xl mx-auto"
            >
                {/* Conteneur avec défilement et en-tête fixe */}
                <div className="h-[70vh] overflow-y-auto">
                    <div className="p-4 space-y-6">
                        {/* Informations personnelles */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                                <FaIdCard className="text-green-900 mr-2" />
                                Informations personnelles
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Nom complet</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-800">
                                        {userData.firstName} {userData.lastName}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Matricule</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-800">{userData.matricule}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Identifiant</label>
                                    <p className="mt-1 text-sm text-gray-600 break-all">{userData.id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 flex items-center">
                                        <FaEnvelope className="mr-2 text-gray-400" />
                                        Email
                                    </label>
                                    <p className="mt-1 text-gray-800">{userData.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 flex items-center">
                                        <FaPhone className="mr-2 text-gray-400" />
                                        Téléphone
                                    </label>
                                    <p className="mt-1 text-gray-800">{userData.phone}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 flex items-center">
                                        <FaMapMarkerAlt className="mr-2 text-gray-400" />
                                        Adresse
                                    </label>
                                    <p className="mt-1 text-gray-800">{userData.address}</p>
                                </div>
                            </div>
                        </div>

                        {/* Informations professionnelles */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                                <FaBriefcase className="text-green-900 mr-2" />
                                Informations professionnelles
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Code opérateur</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-800">{userData.orionSheet.operatorCode}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600 flex items-center">
                                        <FaBuilding className="mr-2 text-gray-400" />
                                        Service
                                    </label>
                                    <p className="mt-1 text-lg font-semibold text-gray-800">{userData.orionSheet.service}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-600">Profil</label>
                                    <p className="mt-1 text-lg font-semibold text-gray-800">{userData.orionSheet.profile}</p>
                                </div>
                            </div>
                        </div>

                        {/* Services gérés */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                                <FaCogs className="text-green-900 mr-2" />
                                Services gérés
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {userData.orionSheet.servicesManaged?.map((service, index) => (
                                    <div key={index} className="bg-green-50 text-green-800 px-4 py-3 rounded-lg text-center border border-green-100">
                                        {service}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rôles et profils */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold text-green-900 mb-4 flex items-center">
                                <FaUserShield className="text-green-900 mr-2" />
                                Rôles et profils
                            </h2>
                            <div className="space-y-6">
                                {userData.roles.map((role) => (
                                    <div key={role.role_id} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
                                            {/* <span className={`px-3 py-1 text-xs rounded-full flex items-center ${
                                                role.editable ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            </span> */}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {role.profiles.map((profile) => (
                                                <div key={profile.id} className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                                    <div className="font-medium text-gray-800">{profile.libelle}</div>
                                                    <div className="text-sm text-gray-600 mt-1">{profile.code}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

            </Card>
        </div>
    );
};

export default MonProfil;