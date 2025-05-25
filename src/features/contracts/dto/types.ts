export interface BailData {
  agence: {
    nom: string;
    sousTitre: string;
    adresse: string;
    telephone: string;
  };
  contrat: {
    type: string;
    sousTitre: string;
    lieu: string;
    dateSignature: string;
    loyer: string;
    caution: string;
  };
  bailleur: {
    nom: string;
    telephone: string;
    email: string;
  };
  preneur: {
    nom: string;
    telephone: string;
    email: string;
  };
  articles: {
    numero: number;
    titre: string;
    contenu: string;
  }[];
}
