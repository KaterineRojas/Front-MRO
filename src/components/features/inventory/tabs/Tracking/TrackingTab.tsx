import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../ui/card';
import { Button } from '../../../../ui/button';
import { Label } from '../../../../ui/label';
import { Badge } from '../../../../ui/badge';
import { Search, Package, User, MapPin, Calendar, Box, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../../../../store/hooks';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '../../../../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../../ui/popover';
import { trackingService, ItemTrackingDto, EngineerTrackingDto } from '../../../../../services/trackingService';
import { amaxService, EngineerDto } from '../../../../../services/amaxService';

type TrackingMode = 'item' | 'engineer';

export function TrackingTab() {
  const { articles } = useAppSelector((state) => state.inventory);
  const currentUser = useAppSelector((state) => state.auth.user);
  const warehouseId = currentUser?.warehouseId ?? currentUser?.warehouse ?? 1;

  const [trackingMode, setTrackingMode] = useState<TrackingMode>('item');
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedEngineerId, setSelectedEngineerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [engineerSearchQuery, setEngineerSearchQuery] = useState('');
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [engineerSearchOpen, setEngineerSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [engineers, setEngineers] = useState<EngineerDto[]>([]);

  // Real data from API
  const [itemTrackingData, setItemTrackingData] = useState<ItemTrackingDto | null>(null);
  const [engineerTrackingData, setEngineerTrackingData] = useState<EngineerTrackingDto | null>(null);

  // Load engineers on component mount
  useEffect(() => {
    const loadEngineers = async () => {
      try {
        const data = await amaxService.getEngineers();
        setEngineers(data);
      } catch (error) {
        console.error('Failed to load engineers:', error);
      }
    };
    loadEngineers();
  }, []);

  // Filter items for autocomplete
  const filteredItems = useMemo(() => {
    if (!searchQuery) return articles;
    const query = searchQuery.toLowerCase();
    return articles.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  const selectedItem = useMemo(
    () => articles.find((item) => item.id === selectedItemId),
    [articles, selectedItemId]
  );

  // Filter engineers for autocomplete
  const filteredEngineers = useMemo(() => {
    if (!engineerSearchQuery) return engineers;
    const query = engineerSearchQuery.toLowerCase();
    return engineers.filter(
      (engineer) =>
        engineer.name.toLowerCase().includes(query) ||
        engineer.employeeId.toLowerCase().includes(query) ||
        engineer.email.toLowerCase().includes(query)
    );
  }, [engineers, engineerSearchQuery]);

  const selectedEngineer = useMemo(
    () => engineers.find((engineer) => engineer.employeeId === selectedEngineerId),
    [engineers, selectedEngineerId]
  );

  const handleItemSearch = async () => {
    if (!selectedItemId) {
      alert('Please select an item first');
      return;
    }

    try {
      setLoading(true);
      const data = await trackingService.getItemTracking(selectedItemId, warehouseId);
      setItemTrackingData(data);
    } catch (error) {
      console.error('Failed to fetch item tracking:', error);
      alert('Failed to fetch item tracking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEngineerSearch = async () => {
    if (!selectedEngineerId) {
      alert('Please enter an engineer ID first');
      return;
    }

    try {
      setLoading(true);
      const data = await trackingService.getEngineerTracking(selectedEngineerId, warehouseId);
      setEngineerTrackingData(data);
    } catch (error) {
      console.error('Failed to fetch engineer tracking:', error);
      alert('Failed to fetch engineer holdings. Please check the engineer ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Tracking</CardTitle>
          <CardDescription>
            Track item locations and engineer holdings across your warehouse
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tracking Mode Selector */}
          <div className="space-y-4">
            <Label>Tracking Mode</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant={trackingMode === 'item' ? 'default' : 'outline'}
                className={`w-full justify-start ${
                  trackingMode === 'item'
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
                onClick={() => {
                  setTrackingMode('item');
                  setItemTrackingData(null);
                }}
              >
                <Package className="mr-2 h-4 w-4" />
                Track by Item
              </Button>
              <Button
                variant={trackingMode === 'engineer' ? 'default' : 'outline'}
                className={`w-full justify-start ${
                  trackingMode === 'engineer'
                    ? 'bg-purple-500 hover:bg-purple-600 text-white'
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                }`}
                onClick={() => {
                  setTrackingMode('engineer');
                  setEngineerTrackingData(null);
                }}
              >
                <User className="mr-2 h-4 w-4" />
                Track by Engineer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Section */}
      {trackingMode === 'item' ? (
        <Card>
          <CardHeader>
            <CardTitle>Search Item Location</CardTitle>
            <CardDescription>
              Select an item to see all its locations across bins
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Item</Label>
              <Popover open={itemSearchOpen} onOpenChange={setItemSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={loading}
                  >
                    {selectedItem ? (
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedItem.sku}</Badge>
                        {selectedItem.name}
                      </span>
                    ) : (
                      'Select an item...'
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search by name or SKU..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandEmpty>No items found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredItems.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={`${item.sku}-${item.name}`}
                          onSelect={() => {
                            setSelectedItemId(item.id);
                            setItemSearchOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Badge variant="secondary" className="text-xs">
                              {item.sku}
                            </Badge>
                            <span className="flex-1">{item.name}</span>
                            <span className="text-xs text-muted-foreground">
                              Stock: {item.currentStock || 0}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleItemSearch} className="w-full" disabled={loading || !selectedItemId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Locations
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Search Engineer Holdings</CardTitle>
            <CardDescription>
              Select an engineer to see all items they are currently holding
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Engineer</Label>
              <Popover open={engineerSearchOpen} onOpenChange={setEngineerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                    disabled={loading}
                  >
                    {selectedEngineer ? (
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedEngineer.employeeId}</Badge>
                        {selectedEngineer.name}
                      </span>
                    ) : (
                      'Select an engineer...'
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput
                      placeholder="Search by name, ID, or email..."
                      value={engineerSearchQuery}
                      onValueChange={setEngineerSearchQuery}
                    />
                    <CommandEmpty>No engineers found.</CommandEmpty>
                    <CommandGroup className="max-h-64 overflow-auto">
                      {filteredEngineers.map((engineer) => (
                        <CommandItem
                          key={engineer.id}
                          value={`${engineer.employeeId}-${engineer.name}`}
                          onSelect={() => {
                            setSelectedEngineerId(engineer.employeeId);
                            setEngineerSearchOpen(false);
                          }}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Badge variant="secondary" className="text-xs">
                              {engineer.employeeId}
                            </Badge>
                            <span className="flex-1">{engineer.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {engineer.departmentName}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleEngineerSearch} className="w-full" disabled={loading || !selectedEngineerId}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search Holdings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results Section - Item Tracking */}
      {trackingMode === 'item' && itemTrackingData && (
        <Card>
          <CardHeader>
            <CardTitle>Item Locations</CardTitle>
            <CardDescription>
              Showing all locations for {itemTrackingData.itemName} ({itemTrackingData.itemSku})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {itemTrackingData.totalInBins}
                      </div>
                      <div className="text-xs text-muted-foreground">In Bins</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {itemTrackingData.totalOnLoan}
                      </div>
                      <div className="text-xs text-muted-foreground">On Loan</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {itemTrackingData.totalReserved}
                      </div>
                      <div className="text-xs text-muted-foreground">Reserved</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {itemTrackingData.totalLocations}
                      </div>
                      <div className="text-xs text-muted-foreground">Locations</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Physical Locations - In Bins */}
              {itemTrackingData.locations.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">Physical Locations (In Bins)</h3>
                  </div>
                  <div className="space-y-2">
                    {itemTrackingData.locations.map((location, index) => (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Bin Location
                              </div>
                              <div className="font-semibold">{location.binCode}</div>
                              {location.isDefault && (
                                <Badge variant="secondary" className="text-xs">
                                  Default Bin
                                </Badge>
                              )}
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Box className="h-3 w-3" />
                                Quantity
                              </div>
                              <div className="font-semibold text-lg text-blue-600">
                                {location.quantity}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Available: {location.quantityAvailable}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">On Loan / Reserved</div>
                              <div className="font-semibold text-purple-600">
                                {location.quantityOnLoan} / {location.quantityReserved}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Loaned / Reserved
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Items on Loan to Engineers */}
              {itemTrackingData.engineersHolding.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">Items on Loan to Engineers</h3>
                  </div>
                  <div className="space-y-2">
                    {itemTrackingData.engineersHolding.map((loan, index) => (
                      <Card key={index} className={`border-l-4 ${loan.isOverdue ? 'border-l-red-500' : 'border-l-purple-500'}`}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Engineer
                              </div>
                              <div className="font-semibold">{loan.engineerName}</div>
                              <Badge variant="secondary" className="text-xs">
                                {loan.engineerId}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                Loan Info
                              </div>
                              <div className="font-medium">{loan.loanRequestNumber}</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground">Quantity</div>
                              <div className="font-semibold text-lg text-purple-600">
                                {loan.quantity}
                              </div>
                              <div className="text-xs text-muted-foreground">units loaned</div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Return Date
                              </div>
                              <div className={`text-sm font-medium ${loan.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                                {new Date(loan.expectedReturnDate).toLocaleDateString()}
                              </div>
                              {loan.isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  OVERDUE
                                </Badge>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {itemTrackingData.locations.length === 0 && itemTrackingData.engineersHolding.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No locations found for this item
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section - Engineer Tracking */}
      {trackingMode === 'engineer' && engineerTrackingData && (
        <Card>
          <CardHeader>
            <CardTitle>Engineer Holdings</CardTitle>
            <CardDescription>
              Items currently held by {engineerTrackingData.engineerName} ({engineerTrackingData.engineerId})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Engineer Info */}
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground">Engineer Name</div>
                      <div className="font-semibold">{engineerTrackingData.engineerName}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Email</div>
                      <div className="font-medium text-sm">{engineerTrackingData.email}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Department</div>
                      <div className="font-medium">{engineerTrackingData.departmentName}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {engineerTrackingData.totalItems}
                      </div>
                      <div className="text-xs text-muted-foreground">Different Items</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {engineerTrackingData.totalQuantity}
                      </div>
                      <div className="text-xs text-muted-foreground">Total Units</div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${engineerTrackingData.overdueItems > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {engineerTrackingData.overdueItems}
                      </div>
                      <div className="text-xs text-muted-foreground">Overdue Items</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Holdings Details */}
              {engineerTrackingData.items.length > 0 && (
                <div className="space-y-2">
                  {engineerTrackingData.items.map((holding, index) => (
                    <Card key={index} className={`border-l-4 ${holding.isOverdue ? 'border-l-red-500' : 'border-l-purple-500'}`}>
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div className="md:col-span-2 space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Item
                            </div>
                            <div className="font-semibold">{holding.itemName}</div>
                            <Badge variant="secondary" className="text-xs">
                              {holding.itemSku}
                            </Badge>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">Quantity</div>
                            <div className="font-semibold text-lg text-purple-600">
                              {holding.quantity}
                            </div>
                            <div className="text-xs text-muted-foreground">units</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              Loan Request
                            </div>
                            <div className="font-medium text-sm">{holding.loanRequestNumber}</div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Return Date
                            </div>
                            <div className={`font-medium text-sm ${holding.isOverdue ? 'text-red-600' : 'text-green-600'}`}>
                              {new Date(holding.expectedReturnDate).toLocaleDateString()}
                            </div>
                            {holding.isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                OVERDUE
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {engineerTrackingData.items.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  This engineer currently has no items on loan
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
