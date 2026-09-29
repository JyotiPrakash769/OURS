export type FootstepSpot = {
  id: string
  name: string
  area: string
  dateStr: string
  category: 'Milestone' | 'Kiss' | 'Date' | 'Moment' | 'Sacred' | 'Cinema'
  badge: string
  icon: string
  description: string
  latitude: number
  longitude: number
  googleMapsUrl: string
  highlight?: string
}

export const FOOTSTEP_SPOTS: FootstepSpot[] = [
  {
    id: 'khordha-park',
    name: 'The Park in Khordha',
    area: 'Khordha',
    dateStr: '29 July & 27 August 2026',
    category: 'Milestone',
    badge: '💍 Proposal & Record Date',
    icon: '💍',
    description:
      'Where we said yes to forever on 29th July (4:00 PM – 9:15 PM)! Also the location of our record-breaking 7.5 hours date on 27th August.',
    latitude: 20.185,
    longitude: 85.62,
    googleMapsUrl: 'https://maps.google.com/?q=The+Park+Khordha',
    highlight: 'Our most sacred milestone where our official journey began ❤️',
  },
  {
    id: 'jaydev-vatika',
    name: 'Jaydev Vatika',
    area: 'Khandagiri, Bhubaneswar',
    dateStr: '25 July 2026',
    category: 'Kiss',
    badge: '💋 First Kiss Spot',
    icon: '💋',
    description:
      'The lush, peaceful gardens where our lips met for the very first time during an evening walk (5:00 PM – 8:00 PM).',
    latitude: 20.2541,
    longitude: 85.782,
    googleMapsUrl: 'https://maps.google.com/?q=Jaydev+Vatika+Bhubaneswar',
    highlight: 'Celebrated every 25th as our First Kiss Anniversary ✨',
  },
  {
    id: 'kala-bhoomi',
    name: 'Kala Bhoomi Crafts Museum',
    area: 'Pokhariput, Bhubaneswar',
    dateStr: '12 July 2026',
    category: 'Date',
    badge: '☕ 1st Official Date',
    icon: '🏛️',
    description:
      'Our first official date together exploring handloom artifacts, courtyards, and terracotta crafts (11:30 AM – 2:15 PM).',
    latitude: 20.2435,
    longitude: 85.8016,
    googleMapsUrl: 'https://maps.google.com/?q=Kala+Bhoomi+Odisha+Crafts+Museum+Bhubaneswar',
  },
  {
    id: 'lingaraj-rajarani',
    name: 'Lingaraj & Rajarani Temples',
    area: 'Old Town, Bhubaneswar',
    dateStr: '17 July 2026',
    category: 'Sacred',
    badge: '🛕 Historic Temples',
    icon: '🛕',
    description:
      'A serene evening soaking in ancient stone architecture, spirituality, and quiet conversation (4:00 PM – 8:30 PM).',
    latitude: 20.2382,
    longitude: 85.8336,
    googleMapsUrl: 'https://maps.google.com/?q=Lingaraj+Temple+Bhubaneswar',
  },
  {
    id: 'botanical-garden',
    name: 'Botanical Garden (Ekamra Kanan)',
    area: 'Nayapalli, Bhubaneswar',
    dateStr: '31 July 2026',
    category: 'Date',
    badge: '🌸 1st Couple Date',
    icon: '🌿',
    description:
      'Our very first date after becoming an official couple! Wandering under the trees and enjoying the lake (4:15 PM – 9:45 PM).',
    latitude: 20.3012,
    longitude: 85.8115,
    googleMapsUrl: 'https://maps.google.com/?q=Ekamra+Kanan+Botanical+Gardens+Bhubaneswar',
  },
  {
    id: 'iskcon-temple',
    name: 'ISKCON Temple',
    area: 'Nayapalli, Bhubaneswar',
    dateStr: '31 July & 26 August 2026',
    category: 'Sacred',
    badge: '🙏 Divine Blessings',
    icon: '✨',
    description:
      'Visited on our first couple date evening and revisited on 26th August for Aarti and divine blessings for our relationship.',
    latitude: 20.2974,
    longitude: 85.8202,
    googleMapsUrl: 'https://maps.google.com/?q=ISKCON+Temple+Nayapalli+Bhubaneswar',
  },
  {
    id: 'ram-mandir',
    name: 'Ram Mandir',
    area: 'Janpath, Kharvela Nagar',
    dateStr: '26 August 2026',
    category: 'Sacred',
    badge: '🛕 Evening Darshan',
    icon: '🕉️',
    description:
      'An evening of peaceful prayer, beautiful evening lights, and togetherness along Janpath.',
    latitude: 20.2838,
    longitude: 85.8447,
    googleMapsUrl: 'https://maps.google.com/?q=Ram+Mandir+Bhubaneswar',
  },
  {
    id: 'ganesh-puja-mela',
    name: 'Ganesh Puja Mela',
    area: 'Bhubaneswar',
    dateStr: '14 September 2026',
    category: 'Moment',
    badge: '🎪 Sweet Reunion & Mela',
    icon: '🎪',
    description:
      'A joyful festive reunion together browsing colorful stalls, eating sweets, and watching a movie!',
    latitude: 20.275,
    longitude: 85.825,
    googleMapsUrl: 'https://maps.google.com/?q=Bhubaneswar',
  },
  {
    id: 'cinema-dates',
    name: 'Bhubaneswar Cinemas',
    area: 'Bhubaneswar Multiplexes',
    dateStr: 'July – August 2026',
    category: 'Cinema',
    badge: '🍿 10 Movie Dates',
    icon: '🎬',
    description:
      'From our 1st movie Evil Dead Burn to Dhamaal 4, Jan Neta (thrice!), Spiderman, Awaarapan, Insidious, Batwara, to #10 Toxic!',
    latitude: 20.295,
    longitude: 85.835,
    googleMapsUrl: 'https://maps.google.com/?q=Cinemas+Bhubaneswar',
    highlight: '10 movie milestones celebrated together 🎞️',
  },
]
