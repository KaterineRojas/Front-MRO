import { WarehouseV2 } from '../types/warehouse-v2';

export const mockWarehousesV2: WarehouseV2[] = [
  {
    id: '1',
    code: 'AMX01',
    name: 'Main Warehouse',
    zones: [
      {
        id: '1',
        code: 'ZGC',
        name: 'Good Condition',
        racks: [
          {
            id: '1',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: '1',
                code: 'L04',
                name: 'High',
                bins: [
                  { 
                    id: '1', 
                    code: 'AMX01-ZGC-R01-L04-B01',
                    name: 'Premium Electronic Components', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-15')
                  },
                  { 
                    id: '2', 
                    code: 'AMX01-ZGC-R01-L04-B02',
                    name: 'High Precision Sensors', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-15')
                  },
                  { 
                    id: '3', 
                    code: 'AMX01-ZGC-R01-L04-B03',
                    name: 'Specialized Motherboards', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-15')
                  },
                  { 
                    id: '4', 
                    code: 'AMX01-ZGC-R01-L04-B04',
                    name: 'Communication Modules', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-15')
                  },
                ],
              },
              {
                id: '2',
                code: 'L03',
                name: 'Mid',
                bins: [
                  { 
                    id: '5', 
                    code: 'AMX01-ZGC-R01-L03-B01',
                    name: 'Processors and CPUs', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-16')
                  },
                  { 
                    id: '6', 
                    code: 'AMX01-ZGC-R01-L03-B02',
                    name: 'Enterprise RAM Memory', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-16')
                  },
                  { 
                    id: '7', 
                    code: 'AMX01-ZGC-R01-L03-B03',
                    name: 'SSD Hard Drives', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-16')
                  },
                  { 
                    id: '8', 
                    code: 'AMX01-ZGC-R01-L03-B04',
                    name: 'Power Supplies', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-16')
                  },
                ],
              },
              {
                id: '3',
                code: 'L02',
                name: 'Mid',
                bins: [
                  { 
                    id: '9', 
                    code: 'AMX01-ZGC-R01-L02-B01',
                    name: 'Network and WiFi Cards', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-17')
                  },
                  { 
                    id: '10', 
                    code: 'AMX01-ZGC-R01-L02-B02',
                    name: 'Cables and Connectors',
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-17')
                  },
                  { 
                    id: '11', 
                    code: 'AMX01-ZGC-R01-L02-B03',
                    name: 'Fans and Cooling Systems', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-17')
                  },
                  { 
                    id: '12', 
                    code: 'AMX01-ZGC-R01-L02-B04',
                    name: 'Batteries and UPS', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-17')
                  },
                ],
              },
              {
                id: '4',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: '13', 
                    code: 'AMX01-ZGC-R01-L01-B01',
                    name: 'Monitors and Displays', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: '14', 
                    code: 'AMX01-ZGC-R01-L01-B02',
                    name: 'Keyboards and Mice', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: '15', 
                    code: 'AMX01-ZGC-R01-L01-B03',
                    name: 'Printers and Scanners', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: '16', 
                    code: 'AMX01-ZGC-R01-L01-B04',
                    name: 'Security Cameras', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: '17', 
                    code: 'AMX01-ZGC-R01-L01-B05',
                    name: 'Network Equipment', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-18')
                  },
                  { 
                    id: '18', 
                    code: 'AMX01-ZGC-R01-L01-B06',
                    name: 'Various Accessories', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-18')
                  },
                ],
              },
            ],
          },
          {
            id: '2',
            code: 'R02',
            name: 'Rack 02',
            levels: [
              {
                id: '5',
                code: 'L03',
                name: 'Mid',
                bins: [
                  { 
                    id: '19', 
                    code: 'AMX01-ZGC-R02-L03-B01',
                    name: 'Smartphones and Tablets', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-20')
                  },
                  { 
                    id: '20', 
                    code: 'AMX01-ZGC-R02-L03-B02',
                    name: 'Enterprise Laptops', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-20')
                  },
                  { 
                    id: '21', 
                    code: 'AMX01-ZGC-R02-L03-B03',
                    name: 'Mobile Accessories', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-20')
                  },
                ],
              },
              {
                id: '6',
                code: 'L02',
                name: 'Mid',
                bins: [
                  { 
                    id: '22', 
                    code: 'AMX01-ZGC-R02-L02-B01',
                    name: 'Printing Consumables', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-21')
                  },
                  { 
                    id: '23', 
                    code: 'AMX01-ZGC-R02-L02-B02',
                    name: 'Storage Media', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-21')
                  },
                ],
              },
              {
                id: '7',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: '24', 
                    code: 'AMX01-ZGC-R02-L01-B01',
                    name: 'Audio Equipment', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-22')
                  },
                  { 
                    id: '25', 
                    code: 'AMX01-ZGC-R02-L01-B02',
                    name: 'Projectors and Screens', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-01-22')
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: '2',
        code: 'ZDMG',
        name: 'Damaged',
        racks: [
          {
            id: '3',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: '8',
                code: 'L02',
                name: 'Mid',
                bins: [
                  { 
                    id: '26', 
                    code: 'AMX01-ZDMG-R01-L02-B01',
                    name: 'Defective Components', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-02-01')
                  },
                  { 
                    id: '27', 
                    code: 'AMX01-ZDMG-R01-L02-B02',
                    name: 'Equipment for Repair', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-02-01')
                  },
                ],
              },
              {
                id: '9',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: '28', 
                    code: 'AMX01-ZDMG-R01-L01-B01',
                    name: 'Material for Disassembly', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-02-02')
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: '3',
        code: 'ZQTN',
        name: 'Quarantine',
        racks: [
          {
            id: '4',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: '10',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: '29', 
                    code: 'AMX01-ZQTN-R01-L01-B01',
                    name: 'Lots Under Inspection', 
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-02-05')
                  },
                  { 
                    id: '30', 
                    code: 'AMX01-ZQTN-R01-L01-B02',
                    name: 'Products in Validation', 
                    quantity: 0,
                    allowDifferentItems: false,
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
    name: 'Secondary Warehouse',
    zones: [
      {
        id: '4',
        code: 'ZGC',
        name: 'Good Condition',
        racks: [
          {
            id: '5',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: '11',
                code: 'L02',
                name: 'Mid',
                bins: [
                  { 
                    id: '31', 
                    code: 'AMX02-ZGC-R01-L02-B01', 
                    name: 'Spare Parts and Components',
                    quantity: 0,
                    allowDifferentItems: false,
                    createdAt: new Date('2024-02-10')
                  },
                ],
              },
              {
                id: '12',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: '32', 
                    code: 'AMX02-ZGC-R01-L01-B01', 
                    name: 'Packaging Materials',
                    quantity: 0,
                    allowDifferentItems: false,
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
    name: 'North Warehouse',
    zones: [
      {
        id: '5',
        code: 'ZGC',
        name: 'Good Condition',
        racks: [
          {
            id: '6',
            code: 'R01',
            name: 'Rack 01',
            levels: [
              {
                id: '13',
                code: 'L01',
                name: 'Ground',
                bins: [
                  { 
                    id: '33', 
                    code: 'AMX03-ZGC-R01-L01-B01', 
                    name: 'Seasonal Inventory',
                    quantity: 0,
                    allowDifferentItems: false,
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