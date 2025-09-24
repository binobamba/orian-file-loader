import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/images/favicon.png";
const APP_NAME = import.meta.env.VITE_APP_NAME;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    const result = await login(email, password);
    if (result.success) {
      navigate("/");
    } else {
      console.log(result);
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[60vh] bg-gradient-to-br from-green-900 via-emerald-800 to-teal-900">
      <div className="flex">

        {/* Partie formulaire */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-8 w-full lg:w-1/2">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img 
              src={logo} 
              alt="BNI" 
              className="mx-auto h-16 w-16 object-contain mb-4" 
            />
            <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-white">
              Connectez-vous à votre compte
            </h2>
        
          </div>

          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Message d'erreur */}
              {error && (
                <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-sm text-orange-200 text-center font-medium">{error}</p>
                </div>
              )}

              {/* Champ Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-green-100 mb-2">
                  Nom d'utilisateur
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    type="text"
                    name="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-green-300 border border-green-600/30 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                    placeholder="votre ADM"
                  />
                </div>
              </div>

              {/* Champ Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium text-green-100">
                    Mot de passe
                  </label>
                </div>
                <div className="mt-1">
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-xl bg-white/10 px-4 py-3 text-white placeholder-green-300 border border-green-600/30 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/50 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                    placeholder="Votre mot de passe"
                  />
                </div>
              </div>

              {/* Bouton de connexion */}
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center items-center rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:from-orange-600 hover:to-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connexion...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      Se connecter
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Partie illustration */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500/10 via-amber-500/10 to-yellow-500/10 items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
          <div className="relative z-10 text-center p-12">
            <div className="bg-white/10 rounded-2xl p-8 backdrop-blur-lg border border-white/20">
              <img 
                src={logo} 
                alt="logo BNI" 
                className="mx-auto h-32 w-32 object-contain mb-6 drop-shadow-lg"
              />
              <h3 className="text-2xl font-bold text-white mb-4">{APP_NAME}</h3>
              <p className="text-green-100 text-lg mb-6">Plateforme de validation des fichiers</p>
              
              {/* Points forts */}
              <div className="space-y-3 text-left">
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span>Validation sécurisée</span>
                </div>
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span>Interface intuitive</span>
                </div>
                <div className="flex items-center text-green-100">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mr-3"></div>
                  <span>Gestion efficace</span>
                </div>
              </div>
            </div>
          </div>
          
          
        </div>

      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
        <p className="text-xs text-white">
          ©2025 {APP_NAME}. Tous droits réservés.
        </p>
      </div>

    </div>
  );
}