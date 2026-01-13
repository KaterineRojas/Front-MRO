import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { 
  Camera, 
  Search, 
  Package, 
  MapPin, 
  User, 
  Calendar,
  Scan,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';

interface Article {
  code: string;
  description: string;
  category: 'consumable' | 'non-consumable' | 'pending-purchase';
  currentStock: number;
  unit: string;
  location: string;
  lastMovement?: {
    type: string;
    date: string;
    user: string;
  };
  assignedTo?: string;
  image?: string;
}

const mockArticles: Article[] = [
  {
    code: 'OFF-001',
    description: 'Office Paper A4 - 80gsm',
    category: 'consumable',
    currentStock: 2500,
    unit: 'sheets',
    location: 'Storage Room A - Shelf 3',
    lastMovement: {
      type: 'Purchase Entry',
      date: '2025-01-20',
      user: 'Sarah Johnson'
    }
  },
  {
    code: 'TECH-002',
    description: 'Laptop Dell Latitude 5520',
    category: 'non-consumable',
    currentStock: 15,
    unit: 'units',
    location: 'IT Department - Equipment Locker',
    assignedTo: 'Available for loan',
    lastMovement: {
      type: 'Loan Return',
      date: '2025-01-19',
      user: 'David Wilson'
    }
  },
  {
    code: 'USB-003',
    description: 'USB Cable Type-C 2m',
    category: 'consumable',
    currentStock: 5,
    unit: 'units',
    location: 'IT Department - Cable Box',
    lastMovement: {
      type: 'Internal Consumption',
      date: '2025-01-19',
      user: 'Anna Rodriguez'
    }
  },
  {
    code: 'PROJ-004',
    description: 'Projector Epson EB-X41',
    category: 'pending-purchase',
    currentStock: 0,
    unit: 'units',
    location: 'Not available',
    lastMovement: {
      type: 'Purchase Order Created',
      date: '2025-01-21',
      user: 'David Wilson'
    }
  }
];

export function QuickFind() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      streamRef.current = stream;
      setCameraActive(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Unable to access camera. Please ensure camera permissions are granted.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
    setScanning(false);
  }, []);

  const simulateScan = useCallback(() => {
    setScanning(true);
    
    // Simulate scanning delay
    setTimeout(() => {
      // Simulate finding a random article code
      const articleCodes = mockArticles.map(a => a.code);
      const randomCode = articleCodes[Math.floor(Math.random() * articleCodes.length)];
      setScanResult(randomCode);
      setSearchQuery(randomCode);
      setScanning(false);
      stopCamera();
      
      // Auto-search for the scanned article
      const foundArticle = mockArticles.find(a => a.code.toLowerCase() === randomCode.toLowerCase());
      if (foundArticle) {
        setSelectedArticle(foundArticle);
      }
    }, 2000);
  }, [stopCamera]);

  const handleSearch = () => {
    const foundArticle = mockArticles.find(article => 
      article.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    if (foundArticle) {
      setSelectedArticle(foundArticle);
    } else {
      setSelectedArticle(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getCategoryBadge = (category: Article['category']) => {
    switch (category) {
      case 'consumable':
        return <Badge variant="default">Consumable</Badge>;
      case 'non-consumable':
        return <Badge variant="secondary">Non-consumable</Badge>;
      case 'pending-purchase':
        return <Badge variant="destructive">Pending Purchase</Badge>;
    }
  };

  const getStockStatus = (article: Article) => {
    if (article.category === 'pending-purchase') {
      return { icon: AlertCircle, color: 'text-red-500', text: 'Not Available' };
    } else if (article.currentStock === 0) {
      return { icon: AlertCircle, color: 'text-red-500', text: 'Out of Stock' };
    } else if (article.currentStock < 10) {
      return { icon: AlertCircle, color: 'text-yellow-500', text: 'Low Stock' };
    } else {
      return { icon: CheckCircle, color: 'text-green-500', text: 'In Stock' };
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1>Quick Find</h1>
        <p className="text-muted-foreground">
          Quickly locate articles using camera scanning or manual search
        </p>
      </div>

      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Article Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search">Search by Code or Description</Label>
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter article code or description"
              />
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
              <Button onClick={startCamera} variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </div>
          </div>

          {scanResult && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Successfully scanned: {scanResult}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Camera Modal */}
      <Dialog open={cameraActive} onOpenChange={() => stopCamera()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Scan className="h-5 w-5" />
                <span>Scan Article</span>
              </span>
              <Button variant="ghost" size="sm" onClick={stopCamera}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
            <DialogDescription>
              Use your camera to scan article codes or QR codes
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 bg-black rounded-lg"
              />
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-white text-center">
                    <Scan className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                    <p>Scanning...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={simulateScan} 
                disabled={scanning}
                size="lg"
              >
                {scanning ? (
                  <>
                    <Scan className="h-4 w-4 mr-2 animate-pulse" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Start Scan
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Position the article code or QR code within the camera view and tap "Start Scan"
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Article Details */}
      {selectedArticle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Article Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <Label>Article Code</Label>
                  <p className="font-mono text-lg">{selectedArticle.code}</p>
                </div>
                
                <div>
                  <Label>Description</Label>
                  <p>{selectedArticle.description}</p>
                </div>
                
                <div>
                  <Label>Category</Label>
                  <div className="mt-1">
                    {getCategoryBadge(selectedArticle.category)}
                  </div>
                </div>

                <div>
                  <Label>Current Stock</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {(() => {
                      const status = getStockStatus(selectedArticle);
                      const StatusIcon = status.icon;
                      return (
                        <>
                          <StatusIcon className={`h-4 w-4 ${status.color}`} />
                          <span className={status.color}>
                            {selectedArticle.currentStock} {selectedArticle.unit} - {status.text}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <Label>Location</Label>
                    <p className="text-sm">{selectedArticle.location}</p>
                  </div>
                </div>

                {selectedArticle.assignedTo && (
                  <div className="flex items-start space-x-2">
                    <User className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <Label>Assigned To</Label>
                      <p className="text-sm">{selectedArticle.assignedTo}</p>
                    </div>
                  </div>
                )}

                {selectedArticle.lastMovement && (
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                    <div>
                      <Label>Last Movement</Label>
                      <p className="text-sm">
                        {selectedArticle.lastMovement.type} on {selectedArticle.lastMovement.date}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {selectedArticle.lastMovement.user}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {searchQuery && !selectedArticle && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg mb-2">No Article Found</h3>
              <p className="text-muted-foreground">
                No article matches your search query: "{searchQuery}"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}