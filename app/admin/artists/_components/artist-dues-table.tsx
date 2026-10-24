'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DUES_STATUSES, type AdminArtistRow, type DuesStatus } from '@/lib/admin/artist-dues'

interface ArtistDuesTableProps {
  artists: AdminArtistRow[]
  savingId: string | null
  onChangeDues: (artist: AdminArtistRow, dues: DuesStatus) => void
}

const SELECT_CLASS =
  'h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50'

export function ArtistDuesTable({ artists, savingId, onChangeDues }: ArtistDuesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>이름</TableHead>
          <TableHead>등급</TableHead>
          <TableHead>직위</TableHead>
          <TableHead>회비 상태</TableHead>
          <TableHead>웹사이트</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {artists.map(artist => (
          <TableRow key={artist.id}>
            <TableCell className='font-medium'>
              {artist.name}
              {artist.name_zh && artist.name_zh !== artist.name && (
                <span className='ml-2 text-muted-foreground'>{artist.name_zh}</span>
              )}
            </TableCell>
            <TableCell>{artist.membership_type ?? '—'}</TableCell>
            <TableCell className='text-muted-foreground'>{artist.title ?? '—'}</TableCell>
            <TableCell>
              <select
                aria-label={`${artist.name} 회비 상태`}
                className={SELECT_CLASS}
                value={artist.dues_status}
                disabled={savingId === artist.id}
                onChange={event => onChangeDues(artist, event.target.value as DuesStatus)}
              >
                {DUES_STATUSES.map(status => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </TableCell>
            <TableCell>
              <Badge variant={artist.visibility === 'public' ? 'default' : 'secondary'}>
                {artist.visibility === 'public' ? '공개' : '비공개'}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
