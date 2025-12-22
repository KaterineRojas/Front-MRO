import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';

interface AuditHeaderProps {
  completedDate?: string;
  date: string;
  countType: string;
  auditor: string;
  zone: string;
}

export function AuditHeader({ completedDate, date, countType, auditor, zone }: AuditHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Header</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Date and Time</p>
            <p className="text-lg">{completedDate || date}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Count Type</p>
            <p className="text-lg">{countType}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Auditor Responsible</p>
            <p className="text-lg">{auditor}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Zone</p>
            <p className="text-lg">{zone}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
