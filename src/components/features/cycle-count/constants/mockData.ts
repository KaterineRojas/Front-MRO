import { Article } from '../types';

export const mockArticles: Article[] = [
  {
    id: '1',
    code: 'AMX01-ZGC-R01-L04-B01',
    description: 'Premium Electronic Components',
    type: 'non-consumable',
    zone: 'Good Condition',
    totalRegistered: 25
  },
  {
    id: '2',
    code: 'AMX01-ZGC-R02-L03-B05',
    description: 'Digital Multimeter Pro',
    type: 'non-consumable',
    zone: 'Good Condition',
    totalRegistered: 15
  },
  {
    id: '3',
    code: 'AMX01-ZDM-R01-L02-B03',
    description: 'Cracked Display Panel',
    type: 'non-consumable',
    zone: 'Damaged',
    totalRegistered: 8
  },
  {
    id: '4',
    code: 'AMX01-ZDM-R03-L01-B02',
    description: 'Used Battery Pack',
    type: 'consumable',
    zone: 'Damaged',
    totalRegistered: 12
  },
  {
    id: '5',
    code: 'AMX01-ZQT-R01-L01-B01',
    description: 'Unverified Components',
    type: 'non-consumable',
    zone: 'Quarantine',
    totalRegistered: 6
  },
  {
    id: '6',
    code: 'AMX01-ZGC-R03-L02-B04',
    description: 'Industrial Sensors',
    type: 'non-consumable',
    zone: 'Good Condition',
    totalRegistered: 32
  },
  {
    id: '7',
    code: 'AMX01-ZQT-R02-L03-B01',
    description: 'Testing Equipment',
    type: 'non-consumable',
    zone: 'Quarantine',
    totalRegistered: 4
  }
];
