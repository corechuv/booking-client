export type Certificate = {
  id: string
  title: string
  area: string
  preview: string
  pdf: string
}

export const certificates: Certificate[] = [
  {
    id: 'emf',
    title: 'EMF (Hochfrequenzgeraete) in der Kosmetik',
    area: 'Apparative Cosmetology',
    preview: '/certificates/EMF (Hochfrequenzgeräte) in der Kosmetik_page-0001.jpg',
    pdf: '/certificates/EMF (Hochfrequenzgeräte) in der Kosmetik.pdf',
  },
  {
    id: 'skin-basics',
    title: 'Grundlagen der Haut und deren Anhangsgebilde',
    area: 'Skin Science',
    preview:
      '/certificates/Grundlagen der Haut und deren Anhangsgebilde_page-0001.jpg',
    pdf: '/certificates/Grundlagen der Haut und deren Anhangsgebilde.pdf',
  },
  {
    id: 'optical-radiation',
    title: 'Optische Strahlung',
    area: 'Device Safety',
    preview: '/certificates/Optische Strahlung_page-0001.jpg',
    pdf: '/certificates/Optische Strahlung.pdf',
  },
  {
    id: 'ultrasound',
    title: 'Ultraschall',
    area: 'Advanced Treatment Methods',
    preview: '/certificates/Ultraschall_page-0001.jpg',
    pdf: '/certificates/Ultraschall.pdf',
  },
]
