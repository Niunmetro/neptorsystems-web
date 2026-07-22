/* Neptor Systems — legal content ported from the previous site (OLDWEB).
   Literal port with the mandated adaptations:
   - Identification normalised (NEPTOR SYSTEMS SL · NIF B75815704 · Sociedad Limitada ·
     Avenida de Europa 15, 28224, Pozuelo de Alarcón (Madrid), España · email · teléfono).
   - Privacy "Finalidad": commercial-demo / B2B-product references removed.
   - Aviso legal / Legal notice keep the [PENDIENTE — REGISTRO MERCANTIL] marker.
   - Inline tokens [[email]] / [[privacy]] / [[aepd]] are turned into links at render time.
   Do not draft new legal text — only port and adapt. */

import { ORG } from '../config';
import type { Lang } from './copy';

export type LegalBlock =
  | { p: string }
  | { ul: string[] }
  | { defs: { term: string; value: string; href?: string }[] };
export type LegalSection = { h2: string; blocks: LegalBlock[] };
export type LegalDoc = { updated: string; sections: LegalSection[] };
export type LegalKey = 'legal' | 'privacy' | 'cookies';

const NAME = ORG.name;
const NIF = ORG.vatID;
const EMAIL = ORG.email;
const PHONE = ORG.phone;

const addr = {
  es: 'Avenida de Europa 15, 28224, Pozuelo de Alarcón (Madrid), España',
  en: 'Avenida de Europa 15, 28224, Pozuelo de Alarcón (Madrid), Spain',
};
const updated = { es: 'Última actualización: julio de 2026', en: 'Last updated: July 2026' };

const identES = (withRegistry: boolean, withActivity: boolean) => ({
  defs: [
    { term: 'Razón Social', value: NAME },
    { term: 'NIF', value: NIF },
    { term: 'Forma Jurídica', value: ORG.legalForm },
    { term: 'Domicilio', value: addr.es },
    { term: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
    { term: 'Teléfono', value: PHONE, href: `tel:${ORG.phoneHref}` },
    ...(withActivity ? [{ term: 'Actividad', value: 'Investigación, desarrollo, fabricación y comercialización de dispositivos tecnológicos de seguridad acuática' }] : []),
    ...(withRegistry && ORG.registryDetails ? [{ term: 'Datos registrales', value: ORG.registryDetails }] : []),
  ],
});
const identEN = (withRegistry: boolean, withActivity: boolean) => ({
  defs: [
    { term: 'Company Name', value: NAME },
    { term: 'Tax ID', value: NIF },
    { term: 'Legal Form', value: 'Limited Liability Company' },
    { term: 'Address', value: addr.en },
    { term: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
    { term: 'Phone', value: PHONE, href: `tel:${ORG.phoneHref}` },
    ...(withActivity ? [{ term: 'Activity', value: 'Research, development, manufacturing and commercialization of aquatic safety technological devices' }] : []),
    ...(withRegistry && ORG.registryDetails ? [{ term: 'Registry details', value: ORG.registryDetails }] : []),
  ],
});

const content: Record<Lang, Record<LegalKey, LegalDoc>> = {
  es: {
    // TermsConditions.tsx -> /aviso-legal
    legal: {
      updated: updated.es,
      sections: [
        { h2: '1. Información General', blocks: [
          { p: 'Los presentes Términos y Condiciones regulan el uso de este sitio web y los servicios ofrecidos por:' },
          identES(true, true),
        ]},
        { h2: '2. Objeto', blocks: [
          { p: 'NEPTOR SYSTEMS SL se dedica a la investigación, desarrollo, fabricación y comercialización de dispositivos tecnológicos de seguridad acuática, incluyendo dispositivos portátiles, aparatos de medida y navegación, sistemas de monitoreo remoto y equipos de telecomunicaciones, así como el desarrollo, implementación y comercialización de soluciones integrales de seguridad acuática basadas en inteligencia artificial.' },
        ]},
        { h2: '3. Condiciones de Uso', blocks: [
          { p: 'El acceso y uso de este sitio web implica la aceptación expresa de estos Términos y Condiciones. El Usuario se compromete a:' },
          { ul: [
            'Hacer un uso correcto y lícito del sitio web',
            'No utilizar el sitio web para actividades ilícitas o contrarias a la buena fe',
            'No causar daños a los sistemas físicos o lógicos de NEPTOR SYSTEMS SL',
            'No introducir o difundir virus informáticos o cualquier otro sistema que pueda causar daños',
          ]},
        ]},
        { h2: '4. Propiedad Intelectual e Industrial', blocks: [
          { p: 'Todos los contenidos del sitio web, incluyendo textos, fotografías, gráficos, imágenes, iconos, tecnología, software, diseño gráfico y códigos fuente, son propiedad intelectual de NEPTOR SYSTEMS SL y están protegidos por las leyes españolas e internacionales de propiedad intelectual e industrial.' },
          { p: 'Queda prohibida la reproducción, distribución, comunicación pública, transformación o cualquier otra actividad que se pueda realizar con los contenidos sin autorización expresa de NEPTOR SYSTEMS SL.' },
        ]},
        { h2: '5. Servicios y Productos', blocks: [
          { p: 'Los servicios y productos ofrecidos por NEPTOR SYSTEMS SL están sujetos a disponibilidad. La empresa se reserva el derecho de modificar, suspender o cancelar cualquier servicio o producto sin previo aviso.' },
          { p: 'Las características técnicas, precios y condiciones comerciales serán informadas de manera específica en cada caso.' },
        ]},
        { h2: '6. Responsabilidad', blocks: [
          { p: 'NEPTOR SYSTEMS SL no se hace responsable de:' },
          { ul: [
            'Interrupciones o errores en el acceso al sitio web',
            'Contenidos introducidos por terceros',
            'Uso indebido del sitio web por parte de los usuarios',
            'Enlaces a sitios web de terceros',
          ]},
        ]},
        { h2: '7. Protección de Datos', blocks: [
          { p: 'El tratamiento de datos personales se rige por lo establecido en nuestra [[privacy]], disponible en este sitio web.' },
        ]},
        { h2: '8. Modificaciones', blocks: [
          { p: 'NEPTOR SYSTEMS SL se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el sitio web.' },
        ]},
        { h2: '9. Legislación y Jurisdicción', blocks: [
          { p: 'Estos Términos y Condiciones se rigen por la legislación española. Para cualquier controversia derivada de estos términos, las partes se someten a los Juzgados y Tribunales de Madrid, renunciando expresamente a cualquier otro fuero que pudiera corresponderles.' },
        ]},
        { h2: '10. Contacto', blocks: [
          { p: 'Para cualquier consulta relacionada con estos Términos y Condiciones, puede contactar con nosotros a través de:' },
          { defs: [
            { term: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
            { term: 'Teléfono', value: PHONE, href: `tel:${ORG.phoneHref}` },
            { term: 'Dirección', value: addr.es },
          ]},
        ]},
      ],
    },
    // PrivacyPolicy.tsx -> /privacidad
    privacy: {
      updated: updated.es,
      sections: [
        { h2: '1. Información al Usuario', blocks: [
          { p: 'NEPTOR SYSTEMS SL, en adelante RESPONSABLE, es el Responsable del tratamiento de los datos personales del Usuario y le informa que estos datos serán tratados de conformidad con lo dispuesto en el Reglamento (UE) 2016/679 de 27 de abril (GDPR) y la Ley Orgánica 3/2018 de 5 de diciembre (LOPDGDD).' },
        ]},
        { h2: '2. Datos de Identificación', blocks: [ identES(false, false) ]},
        { h2: '3. Finalidad del Tratamiento', blocks: [
          { p: 'Los datos personales proporcionados a través de este sitio web serán tratados con las siguientes finalidades:' },
          { ul: [
            'Gestión de consultas de colaboración',
            'Gestión de la lista de espera',
            'Cumplimiento de obligaciones legales',
          ]},
        ]},
        { h2: '4. Legitimación', blocks: [
          { p: 'El tratamiento de sus datos se basa en el consentimiento del interesado (artículo 6.1.a GDPR) y en la ejecución de medidas precontractuales (artículo 6.1.b GDPR).' },
        ]},
        { h2: '5. Conservación de Datos', blocks: [
          { p: 'Los datos personales se conservarán mientras se mantenga la relación con el interesado o durante los años necesarios para cumplir con las obligaciones legales.' },
        ]},
        { h2: '6. Derechos del Usuario', blocks: [
          { p: 'El Usuario puede ejercer los siguientes derechos:' },
          { ul: [
            'Derecho de acceso, rectificación, portabilidad y supresión de sus datos',
            'Derecho de limitación y oposición a su tratamiento',
            'Derecho a no ser objeto de decisiones basadas únicamente en el tratamiento automatizado',
            'Derecho a presentar una reclamación ante la autoridad de control ([[aepd]])',
          ]},
          { p: 'Para ejercer estos derechos, puede dirigirse a [[email]].' },
        ]},
        { h2: '7. Seguridad', blocks: [
          { p: 'NEPTOR SYSTEMS SL ha adoptado medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, alteración, pérdida o destrucción.' },
        ]},
        { h2: '8. Cookies', blocks: [
          { p: 'Este sitio web utiliza cookies técnicas necesarias para su correcto funcionamiento. No se utilizan cookies de seguimiento o publicitarias sin su consentimiento.' },
        ]},
        { h2: '9. Modificaciones', blocks: [
          { p: 'NEPTOR SYSTEMS SL se reserva el derecho de modificar esta política de privacidad. Las modificaciones serán comunicadas a través de este sitio web.' },
        ]},
      ],
    },
    // Derived from the "Cookies" section of the privacy policy
    cookies: {
      updated: updated.es,
      sections: [
        { h2: 'Uso de Cookies', blocks: [
          { p: 'Este sitio web utiliza cookies técnicas necesarias para su correcto funcionamiento. No se utilizan cookies de seguimiento o publicitarias sin su consentimiento.' },
          { p: 'Para más información sobre el tratamiento de tus datos, consulta nuestra [[privacy]].' },
        ]},
        { h2: 'Contacto', blocks: [
          { defs: [ { term: 'Email', value: EMAIL, href: `mailto:${EMAIL}` } ] },
        ]},
      ],
    },
  },
  en: {
    // TermsConditionsEn.tsx -> /en/legal-notice
    legal: {
      updated: updated.en,
      sections: [
        { h2: '1. General Information', blocks: [
          { p: 'These Terms and Conditions govern the use of this website and the services offered by:' },
          identEN(true, true),
        ]},
        { h2: '2. Purpose', blocks: [
          { p: 'NEPTOR SYSTEMS SL is dedicated to research, development, manufacturing and commercialization of aquatic safety technological devices, including portable devices, measurement and navigation equipment, remote monitoring systems and telecommunications equipment, as well as the development, implementation and commercialization of comprehensive aquatic safety solutions based on artificial intelligence.' },
        ]},
        { h2: '3. Terms of Use', blocks: [
          { p: 'Access and use of this website implies express acceptance of these Terms and Conditions. The User agrees to:' },
          { ul: [
            'Make correct and lawful use of the website',
            'Not use the website for illegal activities or contrary to good faith',
            'Not cause damage to NEPTOR SYSTEMS SL physical or logical systems',
            'Not introduce or disseminate computer viruses or any other system that may cause damage',
          ]},
        ]},
        { h2: '4. Intellectual and Industrial Property', blocks: [
          { p: 'All website content, including texts, photographs, graphics, images, icons, technology, software, graphic design and source codes, are the intellectual property of NEPTOR SYSTEMS SL and are protected by Spanish and international intellectual and industrial property laws.' },
          { p: 'Reproduction, distribution, public communication, transformation or any other activity that can be performed with the content without express authorization from NEPTOR SYSTEMS SL is prohibited.' },
        ]},
        { h2: '5. Services and Products', blocks: [
          { p: 'The services and products offered by NEPTOR SYSTEMS SL are subject to availability. The company reserves the right to modify, suspend or cancel any service or product without prior notice.' },
          { p: 'Technical specifications, prices and commercial conditions will be specifically informed in each case.' },
        ]},
        { h2: '6. Liability', blocks: [
          { p: 'NEPTOR SYSTEMS SL is not responsible for:' },
          { ul: [
            'Interruptions or errors in website access',
            'Content introduced by third parties',
            'Misuse of the website by users',
            'Links to third-party websites',
          ]},
        ]},
        { h2: '7. Data Protection', blocks: [
          { p: 'The processing of personal data is governed by the provisions of our [[privacy]], available on this website.' },
        ]},
        { h2: '8. Modifications', blocks: [
          { p: 'NEPTOR SYSTEMS SL reserves the right to modify these Terms and Conditions at any time. Modifications will take effect from their publication on the website.' },
        ]},
        { h2: '9. Legislation and Jurisdiction', blocks: [
          { p: 'These Terms and Conditions are governed by Spanish law. For any controversy arising from these terms, the parties submit to the Courts and Tribunals of Madrid, expressly waiving any other jurisdiction that may correspond to them.' },
        ]},
        { h2: '10. Contact', blocks: [
          { p: 'For any questions related to these Terms and Conditions, you can contact us through:' },
          { defs: [
            { term: 'Email', value: EMAIL, href: `mailto:${EMAIL}` },
            { term: 'Phone', value: PHONE, href: `tel:${ORG.phoneHref}` },
            { term: 'Address', value: addr.en },
          ]},
        ]},
      ],
    },
    // PrivacyPolicyEn.tsx -> /en/privacy-policy
    privacy: {
      updated: updated.en,
      sections: [
        { h2: '1. User Information', blocks: [
          { p: 'NEPTOR SYSTEMS SL, hereinafter referred to as RESPONSIBLE, is the Data Controller and informs you that your personal data will be processed in accordance with Regulation (EU) 2016/679 of April 27 (GDPR) and Spanish Law 3/2018 of December 5 (LOPDGDD).' },
        ]},
        { h2: '2. Company Information', blocks: [ identEN(false, false) ]},
        { h2: '3. Purpose of Processing', blocks: [
          { p: 'Personal data provided through this website will be processed for the following purposes:' },
          { ul: [
            'Management of collaboration inquiries',
            'Management of the waiting list',
            'Compliance with legal obligations',
          ]},
        ]},
        { h2: '4. Legal Basis', blocks: [
          { p: 'The processing of your data is based on the consent of the data subject (Article 6.1.a GDPR) and the execution of pre-contractual measures (Article 6.1.b GDPR).' },
        ]},
        { h2: '5. Data Retention', blocks: [
          { p: 'Personal data will be retained as long as the relationship with the data subject is maintained or for the years necessary to comply with legal obligations.' },
        ]},
        { h2: '6. User Rights', blocks: [
          { p: 'You have the following rights:' },
          { ul: [
            'Right to access, rectification, portability and deletion of your data',
            'Right to limitation and opposition to processing',
            'Right not to be subject to decisions based solely on automated processing',
            'Right to file a complaint with the supervisory authority ([[aepd]])',
          ]},
          { p: 'To exercise these rights, please contact [[email]].' },
        ]},
        { h2: '7. Security', blocks: [
          { p: 'NEPTOR SYSTEMS SL has adopted technical and organizational security measures to protect your personal data against unauthorized access, alteration, loss or destruction.' },
        ]},
        { h2: '8. Cookies', blocks: [
          { p: 'This website uses technical cookies necessary for its proper functioning. No tracking or advertising cookies are used without your consent.' },
        ]},
        { h2: '9. Modifications', blocks: [
          { p: 'NEPTOR SYSTEMS SL reserves the right to modify this privacy policy. Modifications will be communicated through this website.' },
        ]},
      ],
    },
    cookies: {
      updated: updated.en,
      sections: [
        { h2: 'Use of Cookies', blocks: [
          { p: 'This website uses technical cookies necessary for its proper functioning. No tracking or advertising cookies are used without your consent.' },
          { p: 'For more information about how we process your data, see our [[privacy]].' },
        ]},
        { h2: 'Contact', blocks: [
          { defs: [ { term: 'Email', value: EMAIL, href: `mailto:${EMAIL}` } ] },
        ]},
      ],
    },
  },
};

export function getLegalDoc(lang: Lang, key: LegalKey): LegalDoc {
  return content[lang][key];
}
