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
              Fondée en 2023, Zaffaf est née d'une vision simple : rendre accessible la beauté et l'élégance à tous ceux qui célèbrent l'amour et la vie. Notre équipe passionnée travaille sans relâche pour vous offrir une sélection des meilleurs lieux à travers le pays.
            </p>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">Nos Valeurs</h2>
            <ul className="list-disc pl-6 mb-6 text-gray-700">
              <li className="mb-2"><span className="font-semibold">Excellence</span> - Nous ne proposons que des lieux qui répondent à nos standards élevés de qualité.</li>
              <li className="mb-2"><span className="font-semibold">Transparence</span> - Des informations claires et honnêtes sur chaque lieu et service.</li>
              <li className="mb-2"><span className="font-semibold">Personnalisation</span> - Chaque événement est unique, et nous le comprenons.</li>
              <li><span className="font-semibold">Service</span> - Un accompagnement attentif du début à la fin de votre projet.</li>
            </ul>
            
            <h2 className="text-2xl font-semibold mt-10 mb-4">Notre Équipe</h2>
            <p className="text-gray-700 mb-6">
              Derrière Zaffaf se trouve une équipe diversifiée d'experts en événementiel, de passionnés de technologie et de créatifs, tous unis par la même passion : créer des souvenirs inoubliables pour nos clients.
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