import React, { useState } from "react";
import { X, Mail, Lock, Check, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Language, translations } from "../i18n";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (email: string) => void;
  theme: "light" | "dark";
}

export default function LoginModal({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
  theme
}: LoginModalProps) {
  if (!isOpen) return null;

  const t = translations[language] || translations.pt_br;

  // Login form state
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Localization internal
  const txtDict: Record<string, Record<Language, string>> = {
    titleLogin: {
      pt_br: "Acessar Conta",
      pt_pt: "Aceder à Conta",
      en: "Sign In",
      es: "Iniciar Sesión",
      fr: "Connexion",
      it: "Accedi",
      de: "Anmelden"
    },
    titleSignUp: {
      pt_br: "Criar Nova Conta",
      pt_pt: "Criar Nova Conta",
      en: "Create Account",
      es: "Crear Cuenta",
      fr: "Créer un Compte",
      it: "Registrati",
      de: "Konto erstellen"
    },
    descLogin: {
      pt_br: "Conecte-se para expor opiniões no Feed e salvar seus favoritos.",
      pt_pt: "Ligue-se para expor opiniões no Feed e guardar os favoritos.",
      en: "Connect to share opinions on the Feed and save your favorites.",
      es: "Conéctate para opinar en el Feed y guardar tus favoritos.",
      fr: "Connectez-vous pour donner votre avis sur le Feed et sauvegarder vos favoris.",
      it: "Connettiti para esprimere opinioni nel Feed e salvare i preferiti.",
      de: "Melden Sie sich an, um Meinungen im Feed zu teilen und Favoriten zu speichern."
    },
    nameLabel: {
      pt_br: "Seu Nome de Torcedor",
      pt_pt: "Seu Nome de Adepto",
      en: "Fan Name",
      es: "Nombre de Aficionado",
      fr: "Nom de Supporter",
      it: "Nome Tifoso",
      de: "Fan-Name"
    },
    emailLabel: {
      pt_br: "Endereço de E-mail",
      pt_pt: "Endereço de E-mail",
      en: "Email Address",
      es: "Correo electrónico",
      fr: "Adresse E-mail",
      it: "Indirizzo E-mail",
      de: "E-Mail-Adresse"
    },
    passLabel: {
      pt_br: "Senha de Acesso",
      pt_pt: "Palavra-passe",
      en: "Password",
      es: "Contraseña",
      fr: "Mot de passe",
      it: "Password",
      de: "Passwort"
    },
    submitLogin: {
      pt_br: "Entrar",
      pt_pt: "Entrar",
      en: "Sign In",
      es: "Entrar",
      fr: "Se connecter",
      it: "Accedi",
      de: "Einloggen"
    },
    submitSignUp: {
      pt_br: "Cadastrar e Entrar",
      pt_pt: "Registar e Entrar",
      en: "Register & Sign In",
      es: "Registrarse e Entrar",
      fr: "S'inscrire et se connecter",
      it: "Registrati e Accedi",
      de: "Registrieren & Einloggen"
    },
    toggleToSignUp: {
      pt_br: "Não tem uma conta? Crie uma de graça!",
      pt_pt: "Não tem uma conta? Crie uma grátis!",
      en: "Don't have an account? Sign up for free!",
      es: "¿No tienes cuenta? ¡Regístrate gratis!",
      fr: "Pas encore de compte ? Créez-en un gratuitement !",
      it: "Non hai un account? Registrati gratis!",
      de: "Noch kein Konto? Kostenlos registrieren!"
    },
    toggleToLogin: {
      pt_br: "Já possui uma conta? Entre aqui",
      pt_pt: "Já possui uma conta? Entre aqui",
      en: "Already have an account? Sign in here",
      es: "¿Ya tienes cuenta? Inicia sesión aquí",
      fr: "Vous avez déjà un compte ? Connectez-vous",
      it: "Hai già un account? Accedi qui",
      de: "Bereits ein Konto? Hier anmelden"
    },
    successMsg: {
      pt_br: "Sucesso! Você foi conectado.",
      pt_pt: "Sucesso! Ligações efetuadas.",
      en: "Success! You are now logged in.",
      es: "¡Éxito! Has iniciado sesión.",
      fr: "Succès ! Vous êtes maintenant connecté.",
      it: "Successo! Accesso effettuado com successo.",
      de: "Erfolgreich eingeloggt!"
    },
    invalidInputs: {
      pt_br: "Por favor, preencha todos os campos corretamente.",
      pt_pt: "Por favor, preencha todos os campos corretamente.",
      en: "Please fill in all fields correctly.",
      es: "Por favor, rellene todos los campos correctamente.",
      fr: "Veuillez remplir tous les champs correctement.",
      it: "Si prega di compilare tutti i campi correttamente.",
      de: "Bitte alle Felder korrekt ausfüllen."
    }
  };

  const getL10n = (key: string): string => {
    const block = txtDict[key];
    if (!block) return "";
    return block[language] || block.en || "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !email.includes("@")) {
      setError(getL10n("invalidInputs"));
      return;
    }

    if (password.length < 4) {
      setError(language === "pt_br" || language === "pt_pt" ? "A senha deve ter pelo menos 4 caracteres." : "Password must be at least 4 characters.");
      return;
    }

    if (isSignUp && !name.trim()) {
      setError(language === "pt_br" || language === "pt_pt" ? "Por favor, digite seu nome de torcedor." : "Please enter your fan name.");
      return;
    }

    // Success flow
    setSuccess(true);
    setTimeout(() => {
      const resolvedName = isSignUp ? name.trim() : email.split("@")[0];
      // Store in local storage to persist
      localStorage.setItem("ws_logged_user", JSON.stringify({ name: resolvedName, email }));
      onLoginSuccess(resolvedName);
      setSuccess(false);
      setEmail("");
      setPassword("");
      setName("");
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs cursor-pointer"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div 
        className={`relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transform transition-all flex flex-col ${
          theme === "dark" 
            ? "bg-slate-950 border-slate-800 text-slate-100" 
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Header decoration inside */}
        <div className="bg-[#009c3b] p-5 text-white flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            {/* Symmetrical Mini Logo (Yellow background, Black Trophy) */}
            <div className="w-9 h-9 bg-[#ffdf00] rounded-[28%] flex items-center justify-center shadow-md select-none shrink-0 border border-amber-500/20">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" className="w-5.2 h-5.2 text-black font-bold">
                {/* Cup Body */}
                <path d="M 7.5 5.5 H 16.5 V 10 C 16.5 12.5, 14.5 14.5, 12 14.5 C 9.5 14.5, 7.5 12.5, 7.5 10 Z" />
                {/* Handles */}
                <path d="M 7.5 7 C 5.5 7, 5 8, 5 8.8 C 5 10, 6.2 10.3, 7.5 10.3" />
                <path d="M 16.5 7 C 18.5 7, 19 8, 19 8.8 C 19 10, 17.8 10.3, 16.5 10.3" />
                {/* Stem & Triangle Support */}
                <path d="M 12 14.5 V 17.5 L 9.5 20.5 H 14.5 Z" fill="none" />
                {/* Base Line */}
                <path d="M 6.8 20.5 H 17.2" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                {isSignUp ? getL10n("titleSignUp") : getL10n("titleLogin")}
              </h2>
              <p className="text-[10px] text-emerald-100 font-medium">WorldScore Community</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 hover:bg-emerald-700/50 rounded-lg text-emerald-100 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Splash */}
        {success ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {getL10n("successMsg")}
            </h3>
            <p className="text-xs text-slate-400">Direcionando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              {getL10n("descLogin")}
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-450 text-xs font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Name Field (Sign Up Mode Only) */}
            {isSignUp && (
              <div className="space-y-1.5 animate-fadeIn duration-200">
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                  {getL10n("nameLabel")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="text-xs font-extrabold select-none">@</span>
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: NeymarFan99"
                    className={`w-full text-xs font-semibold rounded-xl pl-9 pr-4 py-3 border focus:outline-none transition-all ${
                      theme === "dark" 
                        ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-emerald-600" 
                        : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5 animate-fadeIn duration-200">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {getL10n("emailLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={`w-full text-xs font-semibold rounded-xl pl-10 pr-4 py-3 border focus:outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-emerald-600" 
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {getL10n("passLabel")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                  className={`w-full text-xs font-semibold rounded-xl pl-10 pr-10 py-3 border focus:outline-none transition-all ${
                    theme === "dark" 
                      ? "bg-slate-900 border-slate-800 text-slate-100 focus:border-emerald-600" 
                      : "bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-450 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#009c3b] hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wide rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              {isSignUp ? getL10n("submitSignUp") : getL10n("submitLogin")}
            </button>

            {/* Toggle form type and quick actions */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline transition-colors cursor-pointer"
              >
                {isSignUp ? getL10n("toggleToLogin") : getL10n("toggleToSignUp")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
