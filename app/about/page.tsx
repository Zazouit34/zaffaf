import { Container } from "@/components/container";

export default function AboutPage() {
  return (
    <main className="pt-24 pb-16">
      <Container>
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-primary">À propos de Zaffaf</h1>
          
          <div className="prose prose-lg mx-auto">
            <p className="text-lg text-gray-700 mb-6">
              Bienvenue chez Zaffaf, votre partenaire de confiance pour trouver le lieu parfait pour votre mariage ou événement spécial.
            </p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">Notre Mission</h2>
            <p className="text-gray-700 mb-6">
              Chez Zaffaf, nous croyons que chaque célébration mérite un cadre exceptionnel. Notre mission est de simplifier la recherche et la réservation de lieux d'exception pour vos moments les plus précieux.
            </p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">Notre Histoire</h2>
            <p className="text-gray-700 mb-6">
              Fondée en 2025, Zaffaf est née d'une vision simple : faciliter la recherche de lieux parfaits pour vos événements spéciaux. Notre plateforme est conçue pour vous aider à découvrir des lieux exceptionnels pour célébrer vos moments importants.
            </p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">Nos Valeurs</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li className="mb-2"><span className="font-semibold">Simplicité</span> - Une plateforme intuitive pour faciliter votre recherche.</li>
              <li className="mb-2"><span className="font-semibold">Transparence</span> - Des informations claires et accessibles sur chaque lieu.</li>
              <li className="mb-2"><span className="font-semibold">Innovation</span> - Une amélioration continue de nos fonctionnalités pour mieux vous servir.</li>
              <li><span className="font-semibold">Utilité</span> - Un service qui répond réellement à vos besoins.</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">Notre Vision</h2>
            <p className="text-gray-700 mb-6">
              Zaffaf est actuellement une plateforme de découverte de lieux. À l'avenir, nous prévoyons d'enrichir notre offre avec davantage de fonctionnalités et de services, et de permettre aux propriétaires de lieux de créer leurs propres comptes pour présenter leurs espaces directement aux utilisateurs.
            </p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">Notre Équipe</h2>
            <p className="text-gray-700 mb-6">
              Zaffaf a été créée par une petite équipe passionnée par la technologie et l'organisation d'événements. Notre objectif est de développer une plateforme qui simplifie réellement la vie des utilisateurs dans leur recherche du lieu idéal pour leurs célébrations importantes.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg mt-10">
              <h3 className="text-xl font-semibold mb-3 text-primary">Contactez-nous</h3>
              <p className="text-gray-700 mb-2">
                Vous avez des questions ou souhaitez en savoir plus sur nos services ?
              </p>
              <p className="text-gray-700">
                Email: <a href="mailto:contact@zaffaf.com" className="text-primary hover:underline">contact@zaffaf.com</a>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
} 