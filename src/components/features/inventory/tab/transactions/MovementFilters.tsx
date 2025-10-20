import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import type { MovementFiltersProps } from './types';

export function MovementFilters({
  filterType,
  setFilterType,
  filterSubtype,
  setFilterSubtype,
  filterUser,
  setFilterUser,
  filterProject,
  setFilterProject,
  uniqueUsers,
  uniqueProjects,
}: MovementFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Movements</SelectItem>
              <SelectItem value="entry">Entries Only</SelectItem>
              <SelectItem value="exit">Exits Only</SelectItem>
              <SelectItem value="adjustment">Adjustments Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterSubtype} onValueChange={setFilterSubtype}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by operation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Operations</SelectItem>
              <SelectItem value="purchase">Purchase</SelectItem>
              <SelectItem value="loan">Loan</SelectItem>
              <SelectItem value="consumption">Consumption</SelectItem>
              <SelectItem value="return">Return</SelectItem>
              <SelectItem value="sale">Sale</SelectItem>
              <SelectItem value="audit">Audit</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {uniqueProjects.map((project) => (
                <SelectItem key={project} value={project}>
                  {project}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
