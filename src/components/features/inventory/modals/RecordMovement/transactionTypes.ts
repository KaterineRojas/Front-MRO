// Transaction Types and SubTypes from API

export interface TransactionType {
  value: number;
  name: string;
  description: string;
}

export interface TransactionSubType {
  value: number;
  name: string;
  description: string;
  category: string;
}

export interface TransactionTypesResponse {
  types: TransactionType[];
  subTypes: TransactionSubType[];
}

export const MOCK_TRANSACTION_DATA: TransactionTypesResponse = {
  types: [
    {
      value: 0,
      name: "Entry",
      description: "Entry - Adds stock into the warehouse or increases available quantity."
    },
    {
      value: 1,
      name: "Exit",
      description: "Exit - Removes stock from the warehouse or decreases available quantity."
    },
    {
      value: 2,
      name: "Transfer",
      description: "Transfer - Moves stock between bins, zones, or warehouses without changing total quantity."
    },
    {
      value: 3,
      name: "Adjustment",
      description: "Adjustment - Manual or system corrections to stock balances."
    },
    {
      value: 4,
      name: "Kit",
      description: "Kit - Operations related to the assembly or disassembly of kits."
    }
  ],
  subTypes: [
    {
      value: 0,
      name: "Purchase",
      description: "Purchase - Stock received from an external supplier as part of a procurement process.",
      category: "Entry"
    },
    {
      value: 1,
      name: "Reception",
      description: "Reception - Stock manually received or added without a purchase order, e.g., donations or test materials.",
      category: "Entry"
    },
    {
      value: 2,
      name: "ReturnFromLoan",
      description: "Return from Loan - Items returned after being temporarily loaned to another department or technician.",
      category: "Entry"
    },
    {
      value: 3,
      name: "ReviewApproved",
      description: "Review Approved - Items previously under inspection are now approved and reintroduced into good stock.",
      category: "Entry"
    },
    {
      value: 100,
      name: "Loan",
      description: "Loan - Temporary outgoing movement where items are lent to another user, department, or technician.",
      category: "Exit"
    },
    {
      value: 101,
      name: "Scrap",
      description: "Scrap - Permanent removal of stock due to being unusable, expired, or beyond repair.",
      category: "Exit"
    },
    {
      value: 102,
      name: "Damaged",
      description: "Damaged - Items identified as damaged and removed from available stock, possibly sent for review or disposal.",
      category: "Exit"
    },
    {
      value: 103,
      name: "Lost",
      description: "Lost - Items missing after inventory count or identified as stolen or untraceable.",
      category: "Exit"
    },
    {
      value: 104,
      name: "Consumption",
      description: "Consumption - Stock used internally for operations, testing, or maintenance purposes.",
      category: "Exit"
    },
    {
      value: 200,
      name: "Relocation",
      description: "Relocation - Movement of items between bins, shelves, or zones within the same warehouse.",
      category: "Transfer"
    },
    {
      value: 201,
      name: "SentToReview",
      description: "Sent to Review - Movement of items from a regular bin to a review/inspection area for quality or condition check.",
      category: "Transfer"
    },
    {
      value: 202,
      name: "WarehouseTransfer",
      description: "Warehouse Transfer - Movement of items between different warehouses or facilities under the same organization.",
      category: "Transfer"
    },
    {
      value: 300,
      name: "AddStock",
      description: "Add Stock - Manual positive correction when items are found or system count is lower than physical count.",
      category: "Adjustment"
    },
    {
      value: 301,
      name: "CycleCount",
      description: "Cycle Count - Adjustment made after a periodic inventory audit or cycle count process.",
      category: "Adjustment"
    },
    {
      value: 302,
      name: "StockCorrection",
      description: "Stock Correction - Administrative correction due to data entry errors, miscounts, or record discrepancies.",
      category: "Adjustment"
    },
    {
      value: 303,
      name: "RelocationAdjustment",
      description: "Relocation Adjustment - Internal bin correction made by the system when a bin is automatically released or reassigned.",
      category: "Adjustment"
    },
    {
      value: 400,
      name: "KitCreated",
      description: "Kit Created - Assembly of a kit using multiple items or components, increasing stock of the kit SKU.",
      category: "Kit"
    },
    {
      value: 401,
      name: "KitDestroyed",
      description: "Kit Destroyed - Disassembly or removal of an existing kit, decreasing kit stock and releasing components back to inventory.",
      category: "Kit"
    },
    {
      value: 402,
      name: "ItemsRestocked",
      description: "Items Restocked - Components returned to stock after a kit is disassembled or canceled.",
      category: "Kit"
    },
    {
      value: 403,
      name: "KitCompositionUpdated",
      description: "Kit Composition Updated - Adjustment triggered when a kit definition changes and existing stock must be recalculated or replaced.",
      category: "Kit"
    }
  ]
};
