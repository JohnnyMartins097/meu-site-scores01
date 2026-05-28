import React, { useState, useEffect } from "react";
import { MessageSquare, Heart, Share2, Send, Sparkles, Trophy, Flame } from "lucide-react";
import { Language, translations } from "../i18n";

export interface FeedPost {
  id: string;
  category: string;
  author: string;
  authorBadge?: string;
  time: string;
  title: string;
  content: string;
  likes: number;
  commentsCount: number;
  hasLiked?: boolean;
  commentsList: string[];
}

export default function SportsFeed({ 
  theme, 
  language = "pt_br",
  currentUser = null
}: { 
  theme: "light" | "dark", 
  language?: Language,
  currentUser?: string | null
}) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Geral");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);

  const t = translations[language] || translations.pt_br;
  const currentLang = language;

  // Initial mock news/commentary feed
  useEffect(() => {
    const saved = localStorage.getItem("worldscore_feed_posts");
    if (saved) {
      setPosts(JSON.parse(saved));
    } else {
      const initial: FeedPost[] = [
        {
          id: "feed-1",
          category: "Brasileirão",
          author: "Mauro Cezar Rodrigues",
          authorBadge: "Jornalista de Elite",
          time: "Há 12 min",
          title: "Análise: Flamengo e Palmeiras fazem o maior clássico tático da rodada",
          content: "Com a volta das principais estrelas do futebol brasileiro para esta rodada do Brasileirão Série A, teremos um duelo espetacular entre o ímpeto ofensivo do Maracanã de um lado, e a precisão do esquema montado no Allianz do outro. Quem ganha é o torcedor. Favorito? Empate Técnico.",
          likes: 42,
          commentsCount: 3,
          commentsList: [
            "Excelente análise! Vai ser um jogo de xadrez.",
            "Palmeiras entra mais equilibrado hoje.",
            "Eu aposto no placar magro a favor do mandante."
          ]
        },
        {
          id: "feed-2",
          category: "Champions League",
          author: "André Henning",
          authorBadge: "Narrador Oficial",
          time: "Há 35 min",
          title: "Real Madrid vs Manchester City promete quebrar recordes no Bernabéu",
          content: "Amigos, preparem o coração! É o maior confronto da atualidade na Europa. Szymon Marciniak no apito garante controle absoluto. Acompanhe os gols em tempo real aqui na Central do WorldScore!",
          likes: 128,
          commentsCount: 2,
          commentsList: [
            "Hala Madrid! Nós somos os donos dessa taça.",
            "O City de Guardiola vem com sangue nos olhos hoje."
          ]
        },
        {
          id: "feed-3",
          category: "Mercado da Bola",
          author: "Fabrizio Romano",
          authorBadge: "Expert de Transferências",
          time: "Há 2 horas",
          title: "💣 HISTÓRICO: Novo craque brasileiro assina pré-contrato com gigante europeu",
          content: "Negócio fechado e confirmado! Detalhes financeiros já selados em cerca de €65M mais bônus. O jogador viajará após a final do campeonato continental em julho. Here we go!",
          likes: 215,
          commentsCount: 1,
          commentsList: [
            "Mais um jovem craque de ouro saindo do nosso futebol nacional!"
          ]
        }
      ];
      setPosts(initial);
      localStorage.setItem("worldscore_feed_posts", JSON.stringify(initial));
    }
  }, []);

  const savePosts = (updated: FeedPost[]) => {
    setPosts(updated);
    localStorage.setItem("worldscore_feed_posts", JSON.stringify(updated));
  };

  const handleLike = (id: string) => {
    const updated = posts.map((post) => {
      if (post.id === id) {
        const hasLiked = !post.hasLiked;
        return {
          ...post,
          hasLiked,
          likes: hasLiked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    });
    savePosts(updated);
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: FeedPost = {
      id: `custom-${Date.now()}`,
      category: selectedCategory,
      author: currentUser || ((language === "pt_br" || language === "pt_pt") ? "Torcedor WorldScore" : language === "en" ? "WorldScore Fan" : language === "es" ? "Aficionado WorldScore" : language === "fr" ? "Supporter WorldScore" : language === "it" ? "Tifoso WorldScore" : "WorldScore Fan"),
      authorBadge: "Comentarista Local",
      time: "Agora mesmo",
      title: newTitle.trim(),
      content: newContent.trim(),
      likes: 1,
      commentsCount: 0,
      hasLiked: true,
      commentsList: []
    };

    const updated = [newPost, ...posts];
    savePosts(updated);
    setNewTitle("");
    setNewContent("");
  };

  const handleAddComment = (postId: string) => {
    const txt = commentInputs[postId] || "";
    if (!txt.trim()) return;

    const updated = posts.map((post) => {
      if (post.id === postId) {
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          commentsList: [...post.commentsList, txt.trim()]
        };
      }
      return post;
    });

    savePosts(updated);
    setCommentInputs({
      ...commentInputs,
      [postId]: ""
    });
  };

  const getLocalizedPost = (post: FeedPost) => {
    const isPt = currentLang === "pt_br" || currentLang === "pt_pt";
    if (post.id === "feed-1") {
      return {
        ...post,
        category: t.catBrasileirao,
        authorBadge: t.cmtElite,
        time: isPt ? "Há 12 min" : currentLang === "en" ? "12 min ago" : currentLang === "es" ? "Hace 12 min" : currentLang === "fr" ? "Il y a 12 min" : currentLang === "it" ? "12 min fa" : "Vor 12 Min.",
        title: isPt ? "Análise: Flamengo e Palmeiras fazem o maior clássico tático da rodada"
             : currentLang === "en" ? "Analysis: Flamengo and Palmeiras play the biggest tactical derby of the round"
             : currentLang === "es" ? "Análisis: Flamengo y Palmeiras deparan el mayor clásico táctico de la fecha"
             : currentLang === "fr" ? "Analyse : Flamengo et Palmeiras s'affrontent dans le choc tactique de la journée"
             : currentLang === "it" ? "Analisi: Flamengo e Palmeiras regalano il miglior derby tattico della giornata"
             : "Analyse: Flamengo und Palmeiras liefern sich das größte taktische Derby des Spieltags",
        content: isPt ? "Com a volta das principais estrelas do futebol brasileiro para esta rodada do Brasileirão Série A, teremos um duelo espetacular entre o ímpeto ofensivo do Maracanã de um lado, e a precisão do esquema montado no Allianz do outro. Quem ganha é o torcedor. Favorito? Empate Técnico."
               : currentLang === "en" ? "With the return of the main Brazilian football stars for this Serie A round, we'll have a spectacular duel between Maracana's offensive drive on one side, and the precision of the Allianz scheme on the other. The fans are the winners. Favorite? Technical draw."
               : currentLang === "es" ? "Con la vuelta de las principales estrellas del fútbol brasileño para esta fecha, tendremos un duelo espectacular entre el ímpetu ofensivo del Maracaná por un lado, y la precisión táctica del Allianz por el otro. Gana el aficionado. ¿Favorito? Empate técnico."
               : currentLang === "fr" ? "Avec le retour des stars du football brésilien pour cette journée de Serie A, nous aurons un duel spectaculaire entre la puissance offensive du Maracana d'un côté, et la précision tactique de l'Allianz de l'autre. Les supporters sont gagnants. Favori ? Match nul."
               : currentLang === "it" ? "Con il ritorno delle principali stelle del calcio brasiliano per questa giornata di Serie A, assisteremo a un duello spettacolare tra la foga offensiva del Maracanà e la precisione del sistema varato all'Allianz. A vincere sarà lo spettacolo. Favorito? Pareggio tattico."
               : "Mit der Rückkehr der wichtigsten brasilianischen Fußballstars für diesen Serie-A-Spieltag erwartet uns ein spektakuläres Duell zwischen dem Offensivdrang des Maracanã auf der einen und der Präzision des im Allianz-Stadion etablierten Systems auf der anderen Seite. Der Gewinner ist der Fan. Favorit? Leistungsgerechtes Unentschieden.",
        commentsList: isPt ? ["Excelente análise! Vai ser um jogo de xadrez.", "Palmeiras entra mais equilibrado hoje.", "Eu aposto no placar magro a favor do mandante."]
                    : currentLang === "en" ? ["Excellent analysis! It's going to be a game of chess.", "Palmeiras comes in more balanced today.", "I bet on a narrow score for the home side."]
                    : currentLang === "es" ? ["¡Excelente análisis! Será una partida de ajedrez.", "Palmeiras llega más equilibrado hoy.", "Apuesto por un marcador ajustado a favor del local."]
                    : currentLang === "fr" ? ["Excellente analyse ! Ce sera une partie d'échecs.", "Palmeiras arrive plus équilibré aujourd'hui.", "Je parie sur un score serré pour les locaux."]
                    : currentLang === "it" ? ["Ottima analisi! Sarà una partita a scacchi.", "Il Palmeiras arriva più in equilibrio oggi.", "Scommetto su una vittoria di misura in casa."]
                    : ["Hervorragende Analyse! Das wird ein Schachspiel.", "Palmeiras ist heute ausgeglichener besetzt.", "Ich tippe auf einen knappen Heimsieg."]
      };
    }
    if (post.id === "feed-2") {
      return {
        ...post,
        category: t.catChampions,
        authorBadge: t.cmtOfficial,
        time: isPt ? "Há 35 min" : currentLang === "en" ? "35 min ago" : currentLang === "es" ? "Hace 35 min" : currentLang === "fr" ? "Il y a 35 min" : currentLang === "it" ? "35 min fa" : "Vor 35 Min.",
        title: isPt ? "Real Madrid vs Manchester City promete quebrar recordes no Bernabéu"
             : currentLang === "en" ? "Real Madrid vs Manchester City promises to break records at the Bernabeu"
             : currentLang === "es" ? "Real Madrid vs Manchester City promete batir récords en el Bernabéu"
             : currentLang === "fr" ? "Real Madrid vs Manchester City promet de battre des records au Bernabéu"
             : currentLang === "it" ? "Real Madrid vs Manchester City promette di battere i record al Bernabéu"
             : "Real Madrid gegen Manchester City verspricht Rekorde im Bernabéu zu brechen",
        content: isPt ? "Amigos, preparem o coração! É o maior confronto da atualidade na Europa. Szymon Marciniak no apito garante controle absoluto. Acompanhe os gols em tempo real aqui na Central do WorldScore!"
               : currentLang === "en" ? "Friends, brace yourselves! It's the biggest clash in Europe today. Szymon Marciniak on the whistle ensures absolute control. Follow the goals in real-time here on the WorldScore Central!"
               : currentLang === "es" ? "¡Amigos, preparen el corazón! Es el mayor choque futbolístico de Europa hoy. Szymon Marciniak con el silbato garantiza control total. ¡Sigue los goles en tiempo real aquí en WorldScore Central!"
               : currentLang === "fr" ? "Amis, préparez-vous ! C'est le plus grand choc actuel en Europe. Szymon Marciniak au sifflet garantit un contrôle total. Suivez les buts en temps réel ici sur WorldScore Central !"
               : currentLang === "it" ? "Amici, tenetevi pronti! È lo scontro clou del momento in Europa. Szymon Marciniak al fischietto assicura una gestione ottimale. Segui i gol in tempo reale qui su WorldScore Central!"
               : "Freunde, haltet euch fest! Es ist das derzeit größte Duell in Europa. Szymon Marciniak an der Pfeife garantiert absolute Spielkontrolle. Verfolgen Sie die Tore in Echtzeit hier bei WorldScore Central!",
        commentsList: isPt ? ["Hala Madrid! Nós somos os donos dessa taça.", "O City de Guardiola vem com sangue nos olhos hoje."]
                    : currentLang === "en" ? ["Hala Madrid! We own this trophy.", "Guardiola's City comes with fire in their eyes today."]
                    : currentLang === "es" ? ["¡Hala Madrid! Somos los dueños de esta copa.", "El City de Guardiola viene muy motivado hoy."]
                    : currentLang === "fr" ? ["Hala Madrid ! C'est notre coupe.", "Le City de Guardiola arrive survolté aujourd'hui."]
                    : currentLang === "it" ? ["Hala Madrid! Questa coppa è nostra.", "Il City di Guardiola arriva affamato di vittorie oggi."]
                    : ["Hala Madrid! Wir sind die Könige dieser Trophäe.", "Guardiola's City brennt heute auf den Sieg."]
      };
    }
    if (post.id === "feed-3") {
      return {
        ...post,
        category: isPt ? "Mercado da Bola" : currentLang === "en" ? "Transfer Window" : currentLang === "es" ? "Fichajes" : currentLang === "fr" ? "Transferts" : currentLang === "it" ? "Calciomercato" : "Transfermarkt",
        authorBadge: t.cmtExpert,
        time: isPt ? "Há 2 horas" : currentLang === "en" ? "2 hours ago" : currentLang === "es" ? "Hace 2 horas" : currentLang === "fr" ? "Il y a 2 heures" : currentLang === "it" ? "2 ore fa" : "Vor 2 Std.",
        title: isPt ? "💣 HISTÓRICO: Novo craque brasileiro assina pré-contrato com gigante europeu"
             : currentLang === "en" ? "💣 HISTORIC: New Brazilian star signs pre-contract with European giant"
             : currentLang === "es" ? "💣 HISTÓRICO: Nueva estrella brasileña firma precontrato con gigante europeo"
             : currentLang === "fr" ? "💣 HISTORIQUE : Une nouvelle star brésilienne signe un pré-contrat avec un mastodonte européen"
             : currentLang === "it" ? "💣 STORICO: La nuova stella brasiliana firma un pre-contratto con una big europea"
             : "💣 HISTORISCH: Neuer brasilianischer Star unterschreibt Vorvertrag bei europäischem Giganten",
        content: isPt ? "Negócio fechado e confirmado! Detalhes financeiros já selados em cerca de €65M mais bônus. O jogador viajará após a final do campeonato continental em julho. Here we go!"
               : currentLang === "en" ? "Deal closed and confirmed! Financial details completed at around €65M plus add-ons. The player will travel after the continental final in July. Here we go!"
               : currentLang === "es" ? "¡Trato cerrado e confirmado! Detalles económicos sellados en cerca de €65M más variables. El jugador viajará tras la final del campeonato continental en julio. ¡Here we go!"
               : currentLang === "fr" ? "Accord conclu et confirmé ! Détails financiers scellés aux alentours de 65 M€ plus bonus. Le joueur voyagera après la finale continentale en juillet. Here we go!"
               : currentLang === "it" ? "Affare fatto e confermato! Dettagli finanziari siglati intorno ai 65 milioni di euro più bonus. Il giocatore si trasferirà dopo la finale del campeonato continentale a luglio. Here we go!"
               : "Deal vereinbart und bestätigt! Finanzielle Details bei rund 65 Mio. € plus Boni abgeschlossen. Der Spieler reist nach dem kontinentalen Finale im Juli an. Here we go!",
        commentsList: isPt ? ["Mais um jovem craque de ouro saindo do nosso futebol nacional!"]
                    : currentLang === "en" ? ["Another golden young talent leaving our national league!"]
                    : currentLang === "es" ? ["¡Otra joven joya de oro que deja nuestro fútbol nacional!"]
                    : currentLang === "fr" ? ["Encore un jeune espoir en or qui quitte notre championnat national !"]
                    : currentLang === "it" ? ["Un altro giovane talento straordinario lascia il nostro calcio nazionale!"]
                    : ["Ein weiteres goldenes Talent verlässt unsere heimische Liga!"]
      };
    }

    if (post.id.startsWith("custom-")) {
      return {
        ...post,
        authorBadge: t.cmtLocal,
        time: t.nowText
      }
    }

    return post;
  };

  const catLabels: Record<string, string> = {
    "Geral": t.catGeneral || "Geral",
    "Brasileirão": t.catBrasileirao || "Brasileirão",
    "La Liga": t.catLaLiga || "La Liga",
    "Libertadores": t.catLibertadores || "Libertadores",
    "Champions": t.catChampions || "Champions"
  };

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-2xs transition-all ${
      theme === "dark" 
        ? "bg-slate-900 border-slate-800 text-slate-100" 
        : "bg-white border-slate-200/80 text-slate-800"
    }`}>
      {/* Title block */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-slate-200/50 dark:border-slate-850">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
          <h2 className="text-sm font-bold uppercase tracking-wider">{t.feedTitle}</h2>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 bg-red-105 border border-red-500/20 text-red-600 dark:text-red-400 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-red-500" />
          {t.feedLiveBadge}
        </span>
      </div>

      {/* Form to submit a sports opinion/post */}
      <form onSubmit={handleCreatePost} className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/30">
        <h3 className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">
          {t.postOpinionHeader}
        </h3>
        <div className="space-y-3.5">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-400 font-medium">{t.categoryLabel}</span>
            {["Geral", "Brasileirão", "La Liga", "Libertadores", "Champions"].map((cat) => (
              <button
                type="button"
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200/60 dark:bg-slate-800 hover:bg-slate-330 dark:hover:bg-slate-705 text-slate-600 dark:text-slate-300"
                }`}
              >
                {catLabels[cat] || cat}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder={t.postTitlePlaceholder}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:text-white"
            maxLength={80}
          />

          <div className="relative">
            <textarea
              placeholder={t.postContentPlaceholder}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none min-h-[65px] dark:text-white pr-10"
              maxLength={400}
            />
            <button
              type="submit"
              disabled={!newTitle.trim() || !newContent.trim()}
              className="absolute right-2 bottom-3 p-1.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-transform active:scale-95 disabled:opacity-40 disabled:scale-100 disabled:pointer-events-none"
              title={t.postBtn}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Listing feeds */}
      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
        {posts.map((post) => {
          const localized = getLocalizedPost(post);
          return (
            <div 
              key={post.id} 
              className="p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800 dark:bg-slate-950 bg-white/50 space-y-2.5 hover:border-slate-300 transition-colors"
            >
              {/* Post meta header */}
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded text-[10px] uppercase font-mono">
                    {localized.category}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{localized.author}</span>
                  {localized.authorBadge && (
                    <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-500 border border-amber-500/15 rounded text-[9px] font-medium font-mono">
                      {localized.authorBadge}
                    </span>
                  )}
                </div>
                <span className="text-slate-400 text-[10px]">{localized.time}</span>
              </div>

              {/* Post Title & Content */}
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-100 leading-snug">
                  {localized.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                  {localized.content}
                </p>
              </div>

              {/* Actions list */}
              <div className="flex items-center gap-4 text-slate-400 pt-1 border-t border-slate-100/45 dark:border-slate-900">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-all active:scale-90 cursor-pointer ${
                    post.hasLiked ? "text-red-500 font-extrabold" : "hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.hasLiked ? "fill-red-500 stroke-red-500" : ""}`} />
                  <span>{post.likes}</span>
                </button>

                <button
                  onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                  className={`flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    activeCommentsPostId === post.id ? "text-emerald-600 font-black" : "hover:text-slate-600"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.commentsCount}</span>
                </button>

                <button className="flex items-center gap-1.5 text-xs hover:text-slate-600 ml-auto cursor-pointer" title="Share Link">
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Collapsible comments block */}
              {activeCommentsPostId === post.id && (
                <div className="mt-3.5 p-3 rounded-lg bg-slate-55 dark:bg-slate-900 border border-slate-200/20 space-y-2.5 bg-slate-50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100/30 pb-1">
                    {t.commentsHeader} ({localized.commentsList.length})
                  </div>

                  {localized.commentsList.length === 0 ? (
                    <p className="text-[11px] text-slate-400 italic">{t.noCommentsTxt}</p>
                  ) : (
                    <div className="space-y-2">
                      {localized.commentsList.map((comment, cidx) => (
                        <div key={cidx} className="text-[11px] text-slate-600 dark:text-slate-350 bg-white dark:bg-slate-950 p-2 rounded border border-slate-200/10 shadow-3xs">
                          {comment}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Submitting quick comments in list thread */}
                  <div className="flex gap-1.5 items-center pt-1.5">
                    <input
                      type="text"
                      placeholder={t.commentInputPlaceholder}
                      value={commentInputs[post.id] || ""}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded px-2.5 py-1 text-[11px] focus:outline-none dark:text-white"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="p-1.5 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-colors shrink-0 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
