/**
 * B_LineGraphix - Zentrale Content-Datei
 * =======================================
 * Alle Website-Texte an EINER Stelle.
 * Bei Textänderungen nur diese Datei bearbeiten.
 */

const CONTENT = {

  meta: {
    title: 'B_LineGraphix – Markenauftritte mit Substanz',
    description: 'Markenauftritte, die Vertrauen schaffen – für Menschen, die mehr wollen als nur ein Logo. Grafikdesign von Jessica Batur.',
  },

  // ========== HERO ==========
  hero: {
    tagline: 'Markenauftritte, die Vertrauen schaffen – für Menschen, die mehr wollen als nur ein Logo.',
    cta: 'Eintauchen',
  },

  // ========== PHILOSOPHY ==========
  philosophy: {
    subtitle: 'Ansatz',
    title: 'Jedes Projekt verdient einen starken Auftritt.',
    description: 'Ob Markenauftritt, Präsentation oder kreatives Projekt – durchdachtes Design schafft Klarheit, weckt Interesse und bleibt im Kopf.',
    subtext: 'Für alle, die verstanden werden wollen.',
  },

  // ========== PORTFOLIO ==========
  portfolio: {
    subtitle: 'Ausgewählte Arbeiten',
    title: 'Ergebnisse, die überzeugen.',
    ctaText: 'Ihr Projekt könnte hier stehen',
    viewLabel: 'Ansehen',
    projects: [
      {
        id: 1,
        title: 'CITECH AI',
        category: 'Corporate Design',
        description: 'Komplettes Corporate Design für ein KI-Unternehmen. Logo, Farbwelt, Typografie und Geschäftsausstattung – alles aus einem Guss.',
        details: 'Entwicklung einer vollständigen visuellen Identität: Logo mit molekularer Bildmarke, dunkles Farbsystem mit Cyan-Akzent, Inter als Hausschrift. Die Website nutzt Glassmorphism-Karten, eine animierte Neuronale-Netzwerk-Visualisierung im Hintergrund und Mesh-Gradient-Animationen.',
        image: 'assets/images/citech-logo-white3.svg',
        pdf: 'assets/pdfs/Citech AI Corporate Design.pdf',
        website: 'https://www.citech-ai.de',
        glowColor: '#00b4d8',
      },
      {
        id: 2,
        title: 'Wegweiser Digital',
        category: 'Webdesign & Branding',
        description: 'Modernes Webdesign für ein KI-Weiterbildungsunternehmen. Glassmorphism-Ästhetik, animierte Hintergründe und responsive Umsetzung.',
        details: 'Konzeption und Umsetzung einer modernen Website: Glassmorphism-Karussell mit 3D-Positionierung, fünf animierte Gradient-Blobs als Hintergrund, Scroll-Reveal-Animationen und Dark/Light-Mode. Logo mit stilisierter Kompass-Bildmarke in Petrol-Blau.',
        image: 'assets/images/wegweiser-logo-light.svg',
        website: 'https://wegweiser-digital.de',
        glowColor: '#0b8aa8',
      },
      {
        id: 3,
        title: 'Sebastian Jantzen',
        category: 'Rebranding',
        description: 'Modernes Rebranding einer etablierten Steuerkanzlei. Neues Logo, frische Farbwelt – seriös und zeitgemäß.',
        details: 'Komplettes Rebranding: Entwicklung eines modernen Logo-Konzepts mit stilisiertem „S" als Bildmarke, elegante Farbwelt in Petrol-Tönen, leichte Typografie für einen zeitgemäßen, vertrauenswürdigen Auftritt.',
        image: 'assets/images/jantzen-logo.png',
        website: 'https://www.stb-jantzen.de',
        glowColor: '#0d6e6e',
      },
      {
        id: 4,
        title: 'Solarbau-Firma',
        category: 'Printwerbung',
        description: 'Aufmerksamkeitsstarke Printkampagne für einen Solarbau-Betrieb. Flyer, Plakate und Banner.',
        details: 'Gestaltung einer zielgruppenorientierten Printkampagne mit „Werde Umwelt Held!"-Konzept: Kräftige Typografie, Superhelden-Bildwelt für emotionale Ansprache. Flyer, Plakate und großformatige Banner.',
        image: 'assets/images/solar-banner.jpg',
        glowColor: '#38bdf8',
      },
    ],
  },

  // ========== ABOUT ==========
  about: {
    subtitle: 'Über mich',
    title: 'Design mit Haltung.',
    description: 'Ich bin Jessica Batur – Grafikdesignerin mit Fokus auf Markenauftritte, die wirken. Seit über 10 Jahren unterstütze ich Unternehmen dabei, visuell das zu zeigen, was sie ausmacht.',
    subtext: 'Mein Ansatz: Weniger Dekoration, mehr Substanz. Jedes Projekt bekommt meine volle Aufmerksamkeit – denn gutes Design braucht Zeit und Tiefe, keine Massenabfertigung.',
    services: [
      'Corporate Design',
      'Markenentwicklung',
      'Logo Design',
      'Visuelle Identität',
      'Print & Digital',
    ],
    stats: [
      { number: '10+', label: 'Jahre Erfahrung' },
      { number: '500+', label: 'Projekte' },
      { number: '100%', label: 'Fokus' },
    ],
  },

  // ========== ROADMAP ==========
  roadmap: {
    subtitle: 'So arbeiten wir',
    title: 'Der Weg zu Ihrem Auftritt',
    cta: 'Kostenloses Erstgespräch',
    ctaSubtext: '100% Fokus. Ein Projekt. Während der Zusammenarbeit sind Sie mein einziger Kunde.',
    steps: [
      { number: '01', title: 'Kennenlernen', desc: 'Kostenloses Erstgespräch: Wir klären Ihre Ziele, Zielgruppe und was Ihr Auftritt bewirken soll.' },
      { number: '02', title: 'Strategie', desc: 'Sie erhalten ein klares Konzept mit Moodboard und Richtung – bevor ein Pixel gestaltet wird.' },
      { number: '03', title: 'Umsetzung', desc: 'Transparenter Prozess mit Zwischenpräsentationen. Sie sehen jeden Schritt und geben Feedback.' },
      { number: '04', title: 'Übergabe', desc: 'Alle Dateien in allen Formaten, plus Styleguide für konsistente Anwendung. Sofort einsatzbereit.' },
    ],
  },

  // ========== CONTACT ==========
  contact: {
    subtitle: 'Nächster Schritt',
    title: 'Bereit für einen Auftritt, der wirkt?',
    description: 'Kostenloses Erstgespräch – unverbindlich, aber nicht unverbindlich. Wir klären, ob und wie ich helfen kann.',
    submitButton: 'Gespräch vereinbaren',
    submittingButton: 'Wird gesendet...',
    responseTime: 'Antwort innerhalb von 24 Stunden',
    successTitle: 'Vielen Dank!',
    successMessage: 'Die Anfrage wurde gesendet. Eine Antwort folgt in Kürze.',
    form: {
      name: { label: 'Name', placeholder: 'Vor- und Nachname' },
      email: { label: 'E-Mail', placeholder: 'email@beispiel.de' },
      message: { label: 'Nachricht', placeholder: 'Projektidee oder Anfrage beschreiben...' },
    },
    info: {
      email: 'info@blinegraphix.de',
      phone: '0170 9669853',
      phoneLink: '+491709669853',
      address: { street: 'Dorfstraße 30a', city: '85445 Oberding' },
    },
    social: [
      { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/jessica-batur-0040873aa/' },
    ],
  },

  // ========== FOOTER ==========
  footer: {
    copyright: '© 2026 B_LineGraphix. Alle Rechte vorbehalten.',
    designer: 'Design & Entwicklung: B_LineGraphix',
  },

  // ========== NAVIGATION ==========
  nav: {
    main: [
      { label: 'Start', href: '#hero' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'Über mich', href: '#about' },
      { label: 'Kontakt', href: '#kontakt' },
    ],
    legal: [
      { label: 'Impressum', href: 'pages/impressum.html' },
      { label: 'Datenschutz', href: 'pages/datenschutz.html' },
      { label: 'KI-Transparenz', href: 'pages/ki-transparenz.html' },
    ],
  },

  // ========== COOKIE BANNER ==========
  cookie: {
    text: 'Diese Website verwendet nur technisch notwendige Cookies.',
    accept: 'Verstanden',
  },
};
