import { WarehouseV2 } from '../types/warehouse-v2';

export const mockWarehousesV2: WarehouseV2[] = [
  {
    id: '1',
    code: 'AMX01',
    name: 'Almacén Principal',
    zones: [
      {
        id: 'z1',
        code: 'GC',
        name: 'Good Condition',
        racks: [
          {
            id: 'r1',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: 'l1',
                code: 'L04',
                name: 'High',
                bins: [
                  { 
                    id: 'b1', 
                    code: 'GC-R01-L04-B01',
                    name: 'Bin GC-R01-L04-B01', 
                    description: 'Bin de almacenamiento alto',
                    quantity: 0,
                    createdAt: new Date('2024-01-15')
                  },
                  { 
                    id: 'b2', 
                    code: 'GC-R01-L04-B02',
                    name: 'Bin GC-R01-L04-B02', 
                    description: 'Bin de almacenamiento alto',
                    quantity: 0,
                    createdAt: new Date('2024-01-15')
                  },
                  { 
                    id: 'b3', 
                    code: 'GC-R01-L04-B03',
                    name: 'Bin GC-R01-L04-B03', 
                    description: 'Bin de almacenamiento alto',
                    quantity: 0,
                    createdAt: new Date('2024-01-15')
                  },
                  { 
                    id: 'b4', 
                    code: 'GC-R01-L04-B04',
                    name: 'Bin GC-R01-L04-B04', 
                    description: 'Bin de almacenamiento alto',
                    quantity: 0,
                    createdAt: new Date('2024-01-15')
                  },
                ],
              },
              {
                id: 'l2',
                code: 'L03',
                name: 'Mid',
                bins: [
                  { 
                    id: 'b5', 
                    code: 'GC-R01-L03-B01',
                    name: 'Bin GC-R01-L03-B01', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-16')
                  },
                  { 
                    id: 'b6', 
                    code: 'GC-R01-L03-B02',
                    name: 'Bin GC-R01-L03-B02', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-16')
                  },
                  { 
                    id: 'b7', 
                    code: 'GC-R01-L03-B03',
                    name: 'Bin GC-R01-L03-B03', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-16')
                  },
                  { 
                    id: 'b8', 
                    code: 'GC-R01-L03-B04',
                    name: 'Bin GC-R01-L03-B04', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-16')
                  },
                ],
              },
              {
                id: 'l3',
                code: 'L02',
                name: 'Mid',
                bins: [
                  { 
                    id: 'b9', 
                    code: 'GC-R01-L02-B01',
                    name: 'Bin GC-R01-L02-B01', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-17')
                  },
                  { 
                    id: 'b10', 
                    code: 'GC-R01-L02-B02',
                    name: 'Bin GC-R01-L02-B02', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-17')
                  },
                  { 
                    id: 'b11', 
                    code: 'GC-R01-L02-B03',
                    name: 'Bin GC-R01-L02-B03', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-17')
                  },
                  { 
                    id: 'b12', 
                    code: 'GC-R01-L02-B04',
                    name: 'Bin GC-R01-L02-B04', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-17')
                  },
                ],
              },
              {
                id: 'l4',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: 'b13', 
                    code: 'GC-R01-L01-B01',
                    name: 'Bin GC-R01-L01-B01', 
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: 'b14', 
                    code: 'GC-R01-L01-B02',
                    name: 'Bin GC-R01-L01-B02', 
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: 'b15', 
                    code: 'GC-R01-L01-B03',
                    name: 'Bin GC-R01-L01-B03', 
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: 'b16', 
                    code: 'GC-R01-L01-B04',
                    name: 'Bin GC-R01-L01-B04', 
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: 'b17', 
                    code: 'GC-R01-L01-B05',
                    name: 'Bin GC-R01-L01-B05', 
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: 'b18', 
                    code: 'GC-R01-L01-B06',
                    name: 'Bin GC-R01-L01-B06', 
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-01-18')
                  },
                ],
              },
            ],
          },
          {
            id: 'r2',
            code: 'R02',
            name: 'Rack 02',
            levels: [
              {
                id: 'l5',
                code: 'L03',
                name: 'Mid',
                bins: [
                  { 
                    id: 'b19', 
                    code: 'GC-R02-L03-B01',
                    name: 'Bin GC-R02-L03-B01', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-20')
                  },
                  { 
                    id: 'b20', 
                    code: 'GC-R02-L03-B02',
                    name: 'Bin GC-R02-L03-B02', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-20')
                  },
                  { 
                    id: 'b21', 
                    code: 'GC-R02-L03-B03',
                    name: 'Bin GC-R02-L03-B03', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-20')
                  },
                ],
              },
              {
                id: 'l6',
                code: 'L02',
                name: 'Mid',
                bins: [
                  { 
                    id: 'b23', 
                    code: 'GC-R02-L02-B01',
                    name: 'Bin GC-R02-L02-B01', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-21')
                  },
                  { 
                    id: 'b24', 
                    code: 'GC-R02-L02-B02',
                    name: 'Bin GC-R02-L02-B02', 
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-01-21')
                  },
                ],
              },
              {
                id: 'l7',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: 'b27', 
                    code: 'GC-R02-L01-B01',
                    name: 'Bin GC-R02-L01-B01', 
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-01-22')
                  },
                  { 
                    id: 'b28', 
                    code: 'GC-R02-L01-B02',
                    name: 'Bin GC-R02-L01-B02', 
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-01-22')
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'z2',
        code: 'DMG',
        name: 'Damaged',
        racks: [
          {
            id: 'r3',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: 'l8',
                code: 'L02',
                name: 'Mid',
                bins: [
                  { 
                    id: 'b31', 
                    code: 'DMG-R01-L02-B01',
                    name: 'Bin DMG-R01-L02-B01', 
                    description: 'Bin para productos dañados',
                    quantity: 0,
                    createdAt: new Date('2024-02-01')
                  },
                  { 
                    id: 'b32', 
                    code: 'DMG-R01-L02-B02',
                    name: 'Bin DMG-R01-L02-B02', 
                    description: 'Bin para productos dañados',
                    quantity: 0,
                    createdAt: new Date('2024-02-01')
                  },
                ],
              },
              {
                id: 'l9',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: 'b34', 
                    code: 'DMG-R01-L01-B01',
                    name: 'Bin DMG-R01-L01-B01', 
                    description: 'Bin para productos dañados',
                    quantity: 0,
                    createdAt: new Date('2024-02-02')
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 'z3',
        code: 'QTN',
        name: 'Quarantine',
        racks: [
          {
            id: 'r4',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: 'l10',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: 'b37', 
                    code: 'QTN-R01-L01-B01',
                    name: 'Bin QTN-R01-L01-B01', 
                    description: 'Bin de cuarentena',
                    quantity: 0,
                    createdAt: new Date('2024-02-05')
                  },
                  { 
                    id: 'b38', 
                    code: 'QTN-R01-L01-B02',
                    name: 'Bin QTN-R01-L01-B02', 
                    description: 'Bin de cuarentena',
                    quantity: 0,
                    createdAt: new Date('2024-02-05')
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    code: 'AMX02',
    name: 'Almacén Secundario',
    zones: [
      {
        id: 'z4',
        code: 'GC',
        name: 'Good Condition',
        racks: [
          {
            id: 'r5',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: 'l11',
                code: 'L02',
                name: 'Mid',
                bins: [
                  { 
                    id: 'b39', 
                    code: 'AMX02-GC-R01-L02-B01', 
                    name: 'Bin de algo',
                    description: 'Bin de nivel medio',
                    quantity: 0,
                    createdAt: new Date('2024-02-10')
                  },
                ],
              },
              {
                id: 'l12',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: 'b42', 
                    code: 'AMX02-GC-R01-L01-B01', 
                    name: 'Bin de algo',
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-02-11')
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    code: 'AMX03',
    name: 'Almacén Norte',
    zones: [
      {
        id: 'z6',
        code: 'GC',
        name: 'Good Condition',
        racks: [
          {
            id: 'r7',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: 'l14',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: 'b47', 
                    code: 'AMX03-GC-R01-L01-B01', 
                    name: 'Bin de nombre de su amx',
                    description: 'Bin a nivel de suelo',
                    quantity: 0,
                    createdAt: new Date('2024-02-15')
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];