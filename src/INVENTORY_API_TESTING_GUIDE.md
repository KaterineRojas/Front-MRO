# Inventory API Simulation - Quick Testing Guide

## Quick Test Checklist

### ✅ 1. Create New Item
**Steps:**
1. Go to Inventory Management → Items tab
2. Click "Create new Item" button
3. Fill in the form:
   - SKU: TEST-001
   - Name: Test Item
   - Category: Office Supplies
   - Type: Consumable
   - Other required fields
4. Click "Create Item"

**Expected Result:**
- ✅ 500ms loading delay
- ✅ Console log: "API: Article created successfully"
- ✅ New item appears in the Items table
- ✅ Modal closes automatically

---

### ✅ 2. Record Movement (Entry)
**Steps:**
1. Click "Record Movement" button (top right)
2. Select:
   - Type: Item
   - Movement Type: Stock Entry
   - Select any article
   - Quantity: 10
   - Unit Price: Use current price
   - New Location: Select a bin
3. Click "Record Movement"

**Expected Result:**
- ✅ 500ms loading delay
- ✅ Console log: "API: Movement recorded successfully"
- ✅ Article stock increased by 10
- ✅ New transaction appears in Transactions tab
- ✅ Success alert shown

---

### ✅ 3. Record Movement (Exit)
**Steps:**
1. Click "Record Movement" button
2. Select:
   - Type: Item
   - Movement Type: Stock Exit
   - Select article with stock
   - Quantity: 5
3. Click "Record Movement"

**Expected Result:**
- ✅ 500ms loading delay
- ✅ Console log: "API: Movement recorded successfully"
- ✅ Article stock decreased by 5
- ✅ New transaction in Transactions tab

---

### ✅ 4. Create New Kit
**Steps:**
1. Navigate to Kits tab
2. Click "Create Kit" button
3. Fill in:
   - BIN Code: KIT-TEST-001
   - Name: Test Kit
   - Category: Office Supplies
4. Add items:
   - Search and add 2-3 items
   - Set quantities
5. Click "Create Kit"

**Expected Result:**
- ✅ 500ms loading delay
- ✅ Console log: "API: Kit created successfully"
- ✅ New kit appears in Kits table
- ✅ Returns to Kits tab view
- ✅ Success alert shown

---

### ✅ 5. Create Template
**Steps:**
1. Navigate to Templates tab
2. Click "Create Template" button (top right)
3. Fill in:
   - Name: Test Template
   - Description: For testing
   - Category: Technology
4. Add items to template
5. Click "Save Template"

**Expected Result:**
- ✅ 500ms loading delay
- ✅ Console log: "API: Template created successfully"
- ✅ New template appears in Templates table
- ✅ Returns to Templates tab
- ✅ Success alert shown

---

### ✅ 6. Create New Bin
**Steps:**
1. Navigate to Bins tab
2. Click "Create New BIN" button
3. Fill in:
   - BIN Code: BIN-TEST-999
   - Type: Good Condition
   - Description: Test bin for verification
4. Click "Create BIN"

**Expected Result:**
- ✅ 500ms loading delay
- ✅ Console log: "API: Bin created successfully"
- ✅ New bin appears in Bins table
- ✅ Modal closes
- ✅ Can see new bin in BIN selectors

---

### ✅ 7. Update Item
**Steps:**
1. In Items tab, click Edit (pencil icon) on any item
2. Change the name or description
3. Click "Update Item"

**Expected Result:**
- ✅ 500ms loading delay
- ✅ Console log: "API: Article updated successfully"
- ✅ Changes reflected in table
- ✅ Modal closes

---

### ✅ 8. Update Kit
**Steps:**
1. In Kits tab, click Edit on any kit
2. Modify the name or add/remove items
3. Click "Save Changes"

**Expected Result:**
- ✅ 500ms loading delay
- ✅ Console log: "API: Kit updated successfully"
- ✅ Changes visible in Kits table
- ✅ Returns to Kits view

---

## Browser Console Verification

Open browser DevTools (F12) → Console tab

You should see logs like:
```
API: Article created successfully {id: 1729180923847, sku: "TEST-001", ...}
API: Movement recorded successfully {movementData: {...}, transaction: {...}}
API: Kit created successfully {id: 1729180945123, binCode: "KIT-TEST-001", ...}
API: Template created successfully {id: 1729180967456, name: "Test Template", ...}
API: Bin created successfully {id: 1729180989789, binCode: "BIN-TEST-999", ...}
```

---

## Network Tab Verification

**Note:** These are simulated calls (no actual HTTP requests)

However, you can verify:
1. Redux DevTools shows action dispatched:
   - `inventory/createArticle/pending`
   - `inventory/createArticle/fulfilled`

2. Timeline shows 500ms delay between pending and fulfilled

---

## Redux DevTools Verification

1. Install Redux DevTools extension
2. Open DevTools → Redux tab
3. Perform any operation
4. You should see:
   ```
   ⚡ inventory/createArticle/pending
   ⚡ inventory/createArticle/fulfilled
   ```

4. Click on action to see:
   - Action type
   - Payload data
   - State diff (before/after)

---

## Loading State Verification

During the 500ms delay:
- Buttons should show loading state (if implemented)
- `loading` state in Redux should be `true`
- After completion, `loading` returns to `false`

---

## Error Handling Test

To test error handling, modify a function in `inventoryApi.ts`:

```typescript
export async function createArticleApi(data) {
  await delay(500);
  throw new Error('Simulated API error'); // Add this
  // rest of code...
}
```

Expected:
- ✅ Error caught by Redux
- ✅ `error` state populated
- ✅ Console shows error
- ✅ UI can display error message

---

## Complete Test Flow

**Recommended order:**
1. ✅ Create 2-3 new items
2. ✅ Create 1-2 new bins
3. ✅ Record entry movement (add stock)
4. ✅ Record exit movement (remove stock)
5. ✅ Create template with items
6. ✅ Create kit from template
7. ✅ Update an item
8. ✅ Update a kit
9. ✅ Verify all in Transactions tab

---

## Success Criteria

All tests pass if:
- ✅ All operations complete without errors
- ✅ Console logs show API calls
- ✅ Data persists in Redux state
- ✅ UI updates correctly
- ✅ 500ms delay is noticeable
- ✅ Loading states work
- ✅ Form validation works
- ✅ Duplicate prevention works (bins, SKUs)

---

## Common Issues

### Issue: No console logs
**Solution:** Check browser console is set to show all logs (not just errors)

### Issue: Changes don't persist
**Solution:** This is expected - simulated API has no real persistence. Refresh will reset data.

### Issue: No loading delay visible
**Solution:** Network might be too fast. Check Redux DevTools for pending/fulfilled actions.

### Issue: Errors in console
**Solution:** Check that all imports are correct and no typos in action names.

---

## Next Steps

Once all tests pass:
1. ✅ API simulation is working correctly
2. ✅ Ready for real backend integration
3. ✅ Can replace mock functions with real fetch calls
4. ✅ Maintain same Redux structure

---

## Notes

- All data is stored in Redux state (in-memory)
- Page refresh will reset all data
- This is expected behavior for simulation
- Real backend will provide persistence
