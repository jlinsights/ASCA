'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  SearchFilters,
  NOTICE_CATEGORIES,
  EVENT_CATEGORIES,
  STATUS_OPTIONS,
  EXHIBITION_STATUS_OPTIONS,
  EVENT_STATUS_OPTIONS,
} from './SearchConstants';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  contentType: 'notice' | 'exhibition' | 'event' | 'all';
  className?: string;
}

export default function AdvancedSearch({ 
  onSearch, 
  contentType, 
  className = '' 
}: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
  };